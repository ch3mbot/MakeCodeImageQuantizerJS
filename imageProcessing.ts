class Color {
    public rgb: [number, number, number];

    constructor(r: number, g: number, b: number) {
        r = this.clampByte(r);
        g = this.clampByte(g);
        b = this.clampByte(b);
        this.rgb = [r, g, b];
    }

    public get R(): number { return this.rgb[0]; }
    public get G(): number { return this.rgb[1]; }
    public get B(): number { return this.rgb[2]; }

    // clamp color value from 0-255
    private clampByte(v: number) { return Math.max(Math.min(v, 255), 0);}

    // Hexadecimal representation
    toHex(): string {
        const toHexComponent = (c: number) => {
            const hex = c.toString(16);
            return (hex.length === 1) ? ("0" + hex) : hex;
        };

        return `${toHexComponent(this.R)}${toHexComponent(this.G)}${toHexComponent(this.B)}`;
    }

    // squared distance is used since holds for inqeualities
    public distanceSqr(other: Color): number {
        let dR = this.R - other.R;
        let dG = this.G - other.G;
        let dB = this.B - other.B;
        return dR * dR + dG * dG + dB * dB;
    }

    public equals(other: Color): boolean {
        return (this.R == other.R) && (this.G == other.G) && (this.B == other.B);
    }

    public nearestInPaletteIndex(palette: Color[]): number {
        let minDist = Number.MAX_VALUE;
        let minIndex = -1;
        for(let i = 0; i < palette.length; i++) {
            let dist = this.distanceSqr(palette[i]);
            if(dist < minDist) {
                minDist = dist;
                minIndex = i;
            }
        }
        return minIndex;
    }

    public nearestInPalette(palette: Color[]): Color {
        return palette[this.nearestInPaletteIndex(palette)];
    }
}

class KMeansCalculator {
    public centroids: Color[];
    public clusters: Color[][];
    public dataPoints: Color[];

    constructor(dataPoints: Color[]) {
        this.centroids = [];
        this.clusters = [];
        this.dataPoints = dataPoints;
    }

    public async calculateKMeans(k: number, maxIterations: number, debugLabel: HTMLLabelElement): Promise<Color[]> {
        // set up random centroids
        this.initializeCentroids(k);

        // declared out here for debugging
        let converged = false;
        for(let iteration = 0; iteration < maxIterations; iteration++) {
            if(iteration % 10 == 0) 
                console.log("iteration: " + iteration);

            debugLabel.textContent = "Processing... Iteration: " + (iteration + 1);
            await new Promise(resolve => setTimeout(resolve, 0));

            //assign points to clusters, then cenerate new centroids for each cluster
            this.assignPointsToClusters();
            let newCentroids: Color[] = [];
            for(let i = 0; i < this.clusters.length; i++) {
                let centroid = this.calculateCentroid(this.clusters[i]);
                newCentroids[i] = centroid;
            }
            
            // check if new centroids match old ones
            converged = true;
            for(let i = 0; i < this.centroids.length; i++) {
                if(!this.centroids[i].equals(newCentroids[i])) {
                    converged = false;
                    break;
                }
            }

            // if centroids have converged end early, otherwise go until max iterations
            if(converged){
                console.log("Converged!");
                debugLabel.textContent = "Converged!";
                await new Promise(resolve => setTimeout(resolve, 0));
                break;
            }

            this.centroids = newCentroids;
        }

        if(!converged) {
            debugLabel.textContent = "Did not converge after " + maxIterations + " iterations.";
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        return this.centroids;
    }

    // initialize random (but unique) centroids
    private initializeCentroids(k: number) {
        console.log("Initializing centroids... " + this.dataPoints.length);

        this.centroids = [];
        
        while(this.centroids.length < k) {
            let randIndex = Math.floor(Math.random() * this.dataPoints.length);
            let randColor = this.dataPoints[randIndex];
            let found = false;
            for(let col of this.centroids) {
                if(randColor.equals(col)){
                    found = true;
                    break;
                }
            }
            if(!found) {
                this.centroids.push(randColor);
                console.log("chose centroid: [" + randColor.R + ", " + randColor.G + ", " + randColor.B + "]");
            }
        }
    }

    // assign all points to nearest centroid
    private assignPointsToClusters() {
        this.clusters = [];
        for(let i = 0; i < this.centroids.length; i++) {
            this.clusters.push([]);
        }

        for(let point of this.dataPoints) {
            let minDist = Number.MAX_VALUE;
            let closestCentroidIndex = -1;
            for(let i = 0; i < this.centroids.length; i++) {
                let dist = point.distanceSqr(this.centroids[i]);
                if(dist < minDist) {
                    minDist = dist;
                    closestCentroidIndex = i;
                }
            }
            this.clusters[closestCentroidIndex].push(point);
        }
    }

    // from a list of points generate the centroid (average datapoint)
    private calculateCentroid(cluster: Color[]) {
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;

        for(let color of cluster) {
            sumR += color.R;
            sumG += color.G;
            sumB += color.B;
        }

        // #FIXME should be round? just cast in c#...
        let meanR = Math.floor(sumR / cluster.length);
        let meanG = Math.floor(sumG / cluster.length);
        let meanB = Math.floor(sumB / cluster.length);

        return new Color(meanR, meanG, meanB);
    }
}

let imageColorData: Color[] = [];
let KMeansCalc: KMeansCalculator;
let width: number = 0;
let height: number = 0;

async function getImageData(imageElement: HTMLImageElement): Promise<ImageData> {
    console.log("attempting getting data from element asynch");

    const bitmap = await createImageBitmap(imageElement);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    width = imageElement.naturalWidth;
    height = imageElement.naturalHeight;
    canvas.width = width;
    canvas.height = height;

    console.log("size: " + width + ", " + height);

    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

async function getDataFromElement(imgElement: HTMLImageElement) {
    console.log("processing data from element");
    let imageData = await getImageData(imgElement);
    imageColorData = [];
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            let index = (y * width + x) * 4; // each pixel is 4 array elements (R, G, B, A)
            let red = imageData.data[index];
            let green = imageData.data[index + 1];
            let blue = imageData.data[index + 2];
            let alpha = imageData.data[index + 3]; // do nothing with alpha
            let color = new Color(red, green, blue);
            imageColorData.push(color);
        }
    }

    // setup k means calc
    KMeansCalc = new KMeansCalculator(imageColorData);
}

function displayImageFromArray(colors: Color[], displayElement: HTMLImageElement) {
    console.log("attempting image display");
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    let imageData = ctx.createImageData(width, height);
    let data = imageData.data;

    for (let i = 0; i < colors.length; i++) {
        let color = colors[i];
        data[i * 4] = color.R; 
        data[i * 4 + 1] = color.G;
        data[i * 4 + 2] = color.B; 
        data[i * 4 + 3] = 255;  // Alpha is always full
    }

    ctx.putImageData(imageData, 0, 0);
    displayElement.src = canvas.toDataURL();
}

// running this assumes dataGotten has been called
async function quantizeAndDisplay(k: number, maxIterations: number, outputImgElement: HTMLImageElement, outputPaletteTextElement: HTMLTextAreaElement, outputImageTextElement: HTMLTextAreaElement, debugLabel: HTMLLabelElement, makeCodeMode: boolean) {
    console.log("attempting quantizing");
    
    let palette: Color[] = await KMeansCalc.calculateKMeans(k, maxIterations, debugLabel);

    if(makeCodeMode) {
        let paletteText = "namespace userconfig {\n    export const ARCADE_SCREEN_WIDTH = " + width + "\n    export const ARCADE_SCREEN_HEIGHT = " + height + "\n}\nimage.setPalette(hex`000000";
        for(let i = 0; i < palette.length; i++) {
            console.log(palette[i].R  + ", " + palette[i].G + ", " + palette[i].B);
            paletteText += palette[i].toHex();
        }
        paletteText += "`);";
        outputPaletteTextElement.value = paletteText;
    }

    let outputImageColorData: Color[] = [];

    let outputImgString: string = "let mySprite = sprites.create(img`\n";
    if(makeCodeMode){
        outputImageTextElement.value = outputImgString;
        debugLabel.textContent = "Adding text: 0/" + height;
    }

    async function insertPiece(piece: string) {
        if(makeCodeMode)
            outputImageTextElement.value += piece;
        if(piece == undefined || piece == 'undefined' || piece === undefined || piece === 'undefined') 
            console.log("problematic data");
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    let temp = ""
    for(let i = 0; i < imageColorData.length; i++) {
        let nearIndex = imageColorData[i].nearestInPaletteIndex(palette);
        outputImageColorData.push(palette[nearIndex]);
        if(!makeCodeMode)
            continue;
        

        // make text show up in chunks
        temp += (nearIndex + 1).toString(16);

        if(i % width == 0) {
            if((i / width) % 50 == 0) 
                debugLabel.textContent = "Adding text: " + (i / width) + "/" + height;
            await insertPiece(temp + "\n");
            temp = ""
        }
    }
    if(makeCodeMode)
        outputImageTextElement.value += "`, SpriteKind.Player);";
    console.log("Done text");
    displayImageFromArray(outputImageColorData, outputImgElement);
}