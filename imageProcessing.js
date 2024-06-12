// transpilation command: tsc imageProcessing.ts --target es6
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Color {
    constructor(r, g, b, a) {
        r = this.clampByte(r);
        g = this.clampByte(g);
        b = this.clampByte(b);
        if (a == undefined)
            a = 255;
        a = this.clampByte(a);
        this.rgba = [r, g, b, a];
    }
    get R() { return this.rgba[0]; }
    get G() { return this.rgba[1]; }
    get B() { return this.rgba[2]; }
    get A() { return this.rgba[3]; }
    // clamp color value from 0-255
    clampByte(v) { return Math.max(Math.min(v, 255), 0); }
    // Hexadecimal representation (no alpha)
    toHex() {
        const toHexComponent = (c) => {
            const hex = c.toString(16);
            return (hex.length === 1) ? ("0" + hex) : hex;
        };
        return `${toHexComponent(this.R)}${toHexComponent(this.G)}${toHexComponent(this.B)}`;
    }
    // squared distance is used since holds for inqeualities (no alpha)
    distanceSqr(other) {
        let dR = this.R - other.R;
        let dG = this.G - other.G;
        let dB = this.B - other.B;
        return dR * dR + dG * dG + dB * dB;
    }
    // check if two colors are the same (no alpha)
    equals(other) {
        return (this.R == other.R) && (this.G == other.G) && (this.B == other.B);
    }
    nearestInPaletteIndex(palette) {
        let usedDifferenceFunction = Color.CIE76DifferenceFunction; //#FIXME add option in UI?
        let minDist = Number.MAX_VALUE;
        let minIndex = -1;
        for (let i = 0; i < palette.length; i++) {
            let dist = usedDifferenceFunction(this, palette[i]);
            if (dist < minDist) {
                minDist = dist;
                minIndex = i;
            }
        }
        return minIndex;
    }
    nearestInPalette(palette) {
        return palette[this.nearestInPaletteIndex(palette)];
    }
    static fromHex(hexCol) {
        let R = parseInt(hexCol.substring(1, 3), 16);
        let G = parseInt(hexCol.substring(3, 5), 16);
        let B = parseInt(hexCol.substring(5, 7), 16);
        return new Color(R, G, B);
    }
    toLab() {
        let _r = this.R / 255;
        let _g = this.G / 255;
        let _b = this.B / 255;
        let [rLin, gLin, bLin] = [_r, _g, _b].map(v => v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92);
        let x = rLin * 0.4124564 + gLin * 0.3575761 + bLin * 0.1804375;
        let y = rLin * 0.2126729 + gLin * 0.7151522 + bLin * 0.0721750;
        let z = rLin * 0.0193339 + gLin * 0.1191920 + bLin * 0.9503041;
        let [xr, yr, zr] = [x / 0.95047, y / 1.00000, z / 1.08883];
        let [fx, fy, fz] = [xr, yr, zr].map(v => v > 0.008856 ? Math.pow(v, 1 / 3) : (7.787 * v) + (16 / 116));
        let l = (116 * fy) - 16;
        let a = 500 * (fx - fy);
        let b = 200 * (fy - fz);
        return [l, a, b];
    }
    // modified CIE76 difference formula
    static deltaE76(lab1, lab2) {
        const [L1, a1, b1] = lab1;
        const [L2, a2, b2] = lab2;
        const deltaL = L2 - L1;
        const deltaA = a2 - a1;
        const deltaB = b2 - b1;
        return Math.pow(deltaL, 2) + Math.pow(deltaA, 2) + Math.pow(deltaB, 2);
    }
    //CIEDE2000 color difference formula
    static deltaE2000(lab1, lab2) {
        let [L1, a1, b1] = lab1;
        let [L2, a2, b2] = lab2;
        let avgL = (L1 + L2) / 2;
        let c1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2));
        let c2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));
        let avgC = (c1 + c2) / 2;
        let g = 0.5 * (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));
        let a1Prime = (1 + g) * a1;
        let a2Prime = (1 + g) * a2;
        let c1Prime = Math.sqrt(Math.pow(a1Prime, 2) + Math.pow(b1, 2));
        let c2Prime = Math.sqrt(Math.pow(a2Prime, 2) + Math.pow(b2, 2));
        let avgCPrime = (c1Prime + c2Prime) / 2;
        let h1Prime = Math.atan2(b1, a1Prime) + 2 * Math.PI * (Math.atan2(b1, a1Prime) < 0 ? 1 : 0);
        let h2Prime = Math.atan2(b2, a2Prime) + 2 * Math.PI * (Math.atan2(b2, a2Prime) < 0 ? 1 : 0);
        let deltaLPrime = L2 - L1;
        let deltaCPrime = c2Prime - c1Prime;
        let deltahPrime = 2 * Math.sqrt(c1Prime * c2Prime) * Math.sin((h2Prime - h1Prime) / 2);
        let avgLPrime = (L1 + L2) / 2;
        let avgCPrimePrime = (c1Prime + c2Prime) / 2;
        let avghPrime = (h1Prime + h2Prime) / 2 - Math.PI * Math.abs(h1Prime - h2Prime > Math.PI ? 1 : 0);
        let t = 1 - 0.17 * Math.cos(avghPrime - Math.PI / 6) +
            0.24 * Math.cos(2 * avghPrime) +
            0.32 * Math.cos(3 * avghPrime + Math.PI / 30) -
            0.20 * Math.cos(4 * avghPrime - 63 * Math.PI / 180);
        let deltaTheta = 30 * Math.PI / 180 * Math.exp(Math.pow((-((avghPrime - 275 * Math.PI / 180) / 25)), 2));
        let Rc = 2 * Math.sqrt(Math.pow(avgCPrimePrime, 7) / (Math.pow(avgCPrimePrime, 7) + Math.pow(25, 7)));
        let sl = 1 + (0.015 * Math.pow((avgLPrime - 50), 2)) / Math.sqrt(20 + Math.pow((avgLPrime - 50), 2));
        let sc = 1 + 0.045 * avgCPrimePrime;
        let sh = 1 + 0.015 * avgCPrimePrime * t;
        let Rt = -Math.sin(2 * deltaTheta) * Rc;
        return Math.sqrt(Math.pow((deltaLPrime / sl), 2) + Math.pow((deltaCPrime / sc), 2) + Math.pow((deltahPrime / sh), 2) + Rt * (deltaCPrime / sc) * (deltahPrime / sh));
    }
}
Color.simpleDifferenceFunction = (a, b) => { return a.distanceSqr(b); };
Color.CIE76DifferenceFunction = (a, b) => { return Color.deltaE76(a.toLab(), b.toLab()); };
Color.CIEDE2000DifferenceFunction = (a, b) => { return Color.deltaE2000(a.toLab(), b.toLab()); };
class KMeansCalculator {
    constructor(datapoints, alphaCutoff) {
        this.centroids = [];
        this.clusters = [];
        // only take no transparent for k means clustering
        let nonTransparentDataPoints = [];
        datapoints.forEach(point => {
            if (point.A >= alphaCutoff)
                nonTransparentDataPoints.push(point);
        });
        this.datapoints = nonTransparentDataPoints;
    }
    calculateKMeans(k, maxIterations, debugLabel) {
        return __awaiter(this, void 0, void 0, function* () {
            // set up random centroids
            this.initializeCentroids(k);
            // declared out here for debugging
            let converged = false;
            for (let iteration = 0; iteration < maxIterations; iteration++) {
                if (iteration % 10 == 0)
                    console.log("iteration: " + iteration);
                debugLabel.textContent = "Processing... Iteration: " + (iteration + 1);
                yield new Promise(resolve => setTimeout(resolve, 0));
                //assign points to clusters, then cenerate new centroids for each cluster
                this.assignPointsToClusters();
                let newCentroids = [];
                for (let i = 0; i < this.clusters.length; i++) {
                    let centroid = this.calculateCentroid(this.clusters[i]);
                    newCentroids[i] = centroid;
                }
                // check if new centroids match old ones
                converged = true;
                for (let i = 0; i < this.centroids.length; i++) {
                    if (!this.centroids[i].equals(newCentroids[i])) {
                        converged = false;
                        break;
                    }
                }
                // if centroids have converged end early, otherwise go until max iterations
                if (converged) {
                    console.log("Converged!");
                    debugLabel.textContent = "Converged!";
                    yield new Promise(resolve => setTimeout(resolve, 0));
                    break;
                }
                this.centroids = newCentroids;
            }
            if (!converged) {
                debugLabel.textContent = "Did not converge after " + maxIterations + " iterations.";
                yield new Promise(resolve => setTimeout(resolve, 0));
            }
            return this.centroids;
        });
    }
    // initialize random (but unique) centroids
    initializeCentroids(k) {
        console.log("Initializing centroids... " + this.datapoints.length);
        this.centroids = [];
        while (this.centroids.length < k) {
            let randIndex = Math.floor(Math.random() * this.datapoints.length);
            let randColor = this.datapoints[randIndex];
            let found = false;
            for (let col of this.centroids) {
                if (randColor.equals(col)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.centroids.push(randColor);
                console.log("centroid: " + randColor);
                console.log("chose centroid: [" + randColor.R + ", " + randColor.G + ", " + randColor.B + "]");
            }
        }
    }
    // assign all points to nearest centroid
    assignPointsToClusters() {
        this.clusters = [];
        for (let i = 0; i < this.centroids.length; i++) {
            this.clusters.push([]);
        }
        for (let point of this.datapoints) {
            let minDist = Number.MAX_VALUE;
            let closestCentroidIndex = -1;
            for (let i = 0; i < this.centroids.length; i++) {
                let dist = point.distanceSqr(this.centroids[i]);
                if (dist < minDist) {
                    minDist = dist;
                    closestCentroidIndex = i;
                }
            }
            this.clusters[closestCentroidIndex].push(point);
        }
    }
    // from a list of points generate the centroid (average datapoint)
    calculateCentroid(cluster) {
        let sumR = 0;
        let sumG = 0;
        let sumB = 0;
        for (let color of cluster) {
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
let imageColorData = [];
let KMeansCalc;
let width = 0;
let height = 0;
function getImageData(imageElement) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("attempting getting data from element asynch");
        const bitmap = yield createImageBitmap(imageElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        width = imageElement.naturalWidth;
        height = imageElement.naturalHeight;
        canvas.width = width;
        canvas.height = height;
        console.log("size: " + width + ", " + height);
        ctx.drawImage(bitmap, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
    });
}
function getDataFromElement(imgElement, fast) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("processing data from element");
        let imageData = yield getImageData(imgElement);
        imageColorData = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let index = (y * width + x) * 4; // each pixel is 4 array elements (R, G, B, A)
                let red = imageData.data[index];
                let green = imageData.data[index + 1];
                let blue = imageData.data[index + 2];
                let alpha = imageData.data[index + 3];
                let color = new Color(red, green, blue, alpha);
                imageColorData.push(color);
            }
        }
        // sample data less often for images larger than 1000x500 pixels
        let iX = 1;
        let iY = 1;
        if (fast && width >= 1000) {
            // round or floor? does it matter?
            iX = Math.round(width / 1000);
        }
        if (fast && height >= 500) {
            // round or floor? does it matter?
            iY = Math.round(height / 500);
        }
        console.log("halfway done processing data");
        let paletteProcessingColorData = [];
        for (let y = 0; y < height; y += iY) {
            for (let x = 0; x < width; x += iX) {
                let index = y * width + x;
                // #FIXME always 127 alpha cutoff?
                if (imageColorData[index].A < 127)
                    continue;
                paletteProcessingColorData.push(imageColorData[index]);
            }
        }
        console.log("done processing data. points " + paletteProcessingColorData.length);
        // setup k means calc #FIXME always 127 for alpha cutoff?
        KMeansCalc = new KMeansCalculator(paletteProcessingColorData, 127);
    });
}
function displayImageFromArray(colors, displayElement, imgWidth, imgHeight) {
    console.log("attempting image display. width: " + imgWidth + " height: " + imgHeight);
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    let imageData = ctx.createImageData(imgWidth, imgHeight);
    let data = imageData.data;
    for (let i = 0; i < colors.length; i++) {
        let color = colors[i];
        data[i * 4] = color.R;
        data[i * 4 + 1] = color.G;
        data[i * 4 + 2] = color.B;
        data[i * 4 + 3] = 255; // Alpha is always full
    }
    ctx.putImageData(imageData, 0, 0);
    displayElement.src = canvas.toDataURL();
    displayElement.width = width;
    displayElement.height = height;
}
// running this assumes dataGotten has been called
function quantizeAndDisplay(outputImgElement, debugLabel, strPalette, _width, _height) {
    return __awaiter(this, void 0, void 0, function* () {
        let palette = [];
        strPalette.forEach(strCol => {
            palette.push(Color.fromHex(strCol));
        });
        console.log("attempting quantizing");
        let startTime = new Date().getTime();
        // #FIXME modify palette text to not include screen size text
        let paletteText = "namespace userconfig {\n    export const ARCADE_SCREEN_WIDTH = " + _width + "\n    export const ARCADE_SCREEN_HEIGHT = " + _height + "\n}\nimage.setPalette(hex`000000";
        for (let i = 0; i < palette.length; i++) {
            //console.log(palette[i].R  + ", " + palette[i].G + ", " + palette[i].B);
            paletteText += palette[i].toHex();
        }
        paletteText += "`);";
        let outputPaletteString = paletteText;
        let outputImageColorData = [];
        let outputImgString = "let mySprite = sprites.create(img`\n";
        let outputImageSpriteString = outputImgString;
        debugLabel.textContent = "Adding text: 0/" + _height;
        function insertPiece(piece) {
            return __awaiter(this, void 0, void 0, function* () {
                outputImageSpriteString += piece;
                if (piece == undefined || piece == 'undefined' || piece === undefined || piece === 'undefined')
                    console.log("problematic data");
                yield new Promise(resolve => setTimeout(resolve, 0));
            });
        }
        // #FIXME: always 127 alpha cutoff?
        let temp = "";
        let lineSize = width * 200;
        const colorTrans = new Color(0, 0, 0, 0);
        const colorBlack = new Color(0, 0, 0, 255);
        const colorWhite = new Color(255, 255, 255, 255);
        for (let _y = 0; _y < _height; _y++) {
            for (let _x = 0; _x < _width; _x++) {
                let y = _y * (height / _height);
                let x = _x * (width / _width);
                let dataIndex = y * width + x;
                let outputDataIndex = _y * _width + _x;
                if (imageColorData[dataIndex].A < 127) {
                    outputImageColorData.push(colorWhite); // #FIXME: use black for transparency? white?
                    temp += "0";
                }
                else {
                    let nearIndex = imageColorData[dataIndex].nearestInPaletteIndex(palette);
                    outputImageColorData.push(palette[nearIndex]);
                    temp += (nearIndex + 1).toString(16);
                }
                // make text show up in chunks
                if (_x == 0 && _x != 0)
                    temp += "\n";
                if (_x % lineSize == 0) {
                    if (_y % 50 == 0)
                        debugLabel.textContent = "Adding text: " + _y + "/" + _height;
                    yield insertPiece(temp);
                    temp = "";
                }
            }
        }
        //for(let i = 0; i < imageColorData.length; i++) {
        //}
        outputImageSpriteString += "`, SpriteKind.Player);";
        let endTime = new Date().getTime();
        console.log("time for text gen: " + (endTime - startTime));
        console.log("Done text");
        displayImageFromArray(outputImageColorData, outputImgElement, _width, _height);
        return [outputPaletteString, outputImageSpriteString];
    });
}
function genPalette(k, maxIterations, debugLabel, nonGenPalette) {
    return __awaiter(this, void 0, void 0, function* () {
        let startTime = new Date().getTime();
        let palette = yield KMeansCalc.calculateKMeans(k, maxIterations, debugLabel);
        //nonGenPalette.forEach(col => { palette.push(col); });
        let endTime = new Date().getTime();
        console.log("time for palette gen: " + (endTime - startTime));
        let outPalette = [];
        palette.forEach(col => {
            outPalette.push("#" + col.toHex());
        });
        return outPalette;
    });
}
