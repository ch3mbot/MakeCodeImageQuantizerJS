var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Color = /** @class */ (function () {
    function Color(r, g, b, a) {
        r = this.clampByte(r);
        g = this.clampByte(g);
        b = this.clampByte(b);
        if (a == undefined)
            a = 255;
        a = this.clampByte(a);
        this.rgba = [r, g, b, a];
    }
    Object.defineProperty(Color.prototype, "R", {
        get: function () { return this.rgba[0]; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Color.prototype, "G", {
        get: function () { return this.rgba[1]; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Color.prototype, "B", {
        get: function () { return this.rgba[2]; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Color.prototype, "A", {
        get: function () { return this.rgba[3]; },
        enumerable: false,
        configurable: true
    });
    // clamp color value from 0-255
    Color.prototype.clampByte = function (v) { return Math.max(Math.min(v, 255), 0); };
    // Hexadecimal representation (no alpha)
    Color.prototype.toHex = function () {
        var toHexComponent = function (c) {
            var hex = c.toString(16);
            return (hex.length === 1) ? ("0" + hex) : hex;
        };
        return "".concat(toHexComponent(this.R)).concat(toHexComponent(this.G)).concat(toHexComponent(this.B));
    };
    // squared distance is used since holds for inqeualities (no alpha)
    Color.prototype.distanceSqr = function (other) {
        var dR = this.R - other.R;
        var dG = this.G - other.G;
        var dB = this.B - other.B;
        return dR * dR + dG * dG + dB * dB;
    };
    // check if two colors are the same (no alpha)
    Color.prototype.equals = function (other) {
        return (this.R == other.R) && (this.G == other.G) && (this.B == other.B);
    };
    Color.prototype.nearestInPaletteIndex = function (palette) {
        var minDist = Number.MAX_VALUE;
        var minIndex = -1;
        for (var i = 0; i < palette.length; i++) {
            var dist = this.distanceSqr(palette[i]);
            if (dist < minDist) {
                minDist = dist;
                minIndex = i;
            }
        }
        return minIndex;
    };
    Color.prototype.nearestInPalette = function (palette) {
        return palette[this.nearestInPaletteIndex(palette)];
    };
    return Color;
}());
var KMeansCalculator = /** @class */ (function () {
    function KMeansCalculator(dataPoints) {
        this.centroids = [];
        this.clusters = [];
        this.dataPoints = dataPoints;
    }
    KMeansCalculator.prototype.calculateKMeans = function (k, maxIterations, debugLabel) {
        return __awaiter(this, void 0, void 0, function () {
            var converged, iteration, newCentroids, i, centroid, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // set up random centroids
                        this.initializeCentroids(k);
                        converged = false;
                        iteration = 0;
                        _a.label = 1;
                    case 1:
                        if (!(iteration < maxIterations)) return [3 /*break*/, 6];
                        if (iteration % 10 == 0)
                            console.log("iteration: " + iteration);
                        debugLabel.textContent = "Processing... Iteration: " + (iteration + 1);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 0); })];
                    case 2:
                        _a.sent();
                        //assign points to clusters, then cenerate new centroids for each cluster
                        this.assignPointsToClusters();
                        newCentroids = [];
                        for (i = 0; i < this.clusters.length; i++) {
                            centroid = this.calculateCentroid(this.clusters[i]);
                            newCentroids[i] = centroid;
                        }
                        // check if new centroids match old ones
                        converged = true;
                        for (i = 0; i < this.centroids.length; i++) {
                            if (!this.centroids[i].equals(newCentroids[i])) {
                                converged = false;
                                break;
                            }
                        }
                        if (!converged) return [3 /*break*/, 4];
                        console.log("Converged!");
                        debugLabel.textContent = "Converged!";
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 0); })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        this.centroids = newCentroids;
                        _a.label = 5;
                    case 5:
                        iteration++;
                        return [3 /*break*/, 1];
                    case 6:
                        if (!!converged) return [3 /*break*/, 8];
                        debugLabel.textContent = "Did not converge after " + maxIterations + " iterations.";
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 0); })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/, this.centroids];
                }
            });
        });
    };
    // initialize random (but unique) centroids
    KMeansCalculator.prototype.initializeCentroids = function (k) {
        console.log("Initializing centroids... " + this.dataPoints.length);
        this.centroids = [];
        while (this.centroids.length < k) {
            var randIndex = Math.floor(Math.random() * this.dataPoints.length);
            var randColor = this.dataPoints[randIndex];
            var found = false;
            for (var _i = 0, _a = this.centroids; _i < _a.length; _i++) {
                var col = _a[_i];
                if (randColor.equals(col)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.centroids.push(randColor);
                console.log("chose centroid: [" + randColor.R + ", " + randColor.G + ", " + randColor.B + "]");
            }
        }
    };
    // assign all points to nearest centroid
    KMeansCalculator.prototype.assignPointsToClusters = function () {
        this.clusters = [];
        for (var i = 0; i < this.centroids.length; i++) {
            this.clusters.push([]);
        }
        for (var _i = 0, _a = this.dataPoints; _i < _a.length; _i++) {
            var point = _a[_i];
            var minDist = Number.MAX_VALUE;
            var closestCentroidIndex = -1;
            for (var i = 0; i < this.centroids.length; i++) {
                var dist = point.distanceSqr(this.centroids[i]);
                if (dist < minDist) {
                    minDist = dist;
                    closestCentroidIndex = i;
                }
            }
            this.clusters[closestCentroidIndex].push(point);
        }
    };
    // from a list of points generate the centroid (average datapoint)
    KMeansCalculator.prototype.calculateCentroid = function (cluster) {
        var sumR = 0;
        var sumG = 0;
        var sumB = 0;
        for (var _i = 0, cluster_1 = cluster; _i < cluster_1.length; _i++) {
            var color = cluster_1[_i];
            sumR += color.R;
            sumG += color.G;
            sumB += color.B;
        }
        // #FIXME should be round? just cast in c#...
        var meanR = Math.floor(sumR / cluster.length);
        var meanG = Math.floor(sumG / cluster.length);
        var meanB = Math.floor(sumB / cluster.length);
        return new Color(meanR, meanG, meanB);
    };
    return KMeansCalculator;
}());
var imageColorData = [];
var KMeansCalc;
var width = 0;
var height = 0;
function getImageData(imageElement) {
    return __awaiter(this, void 0, void 0, function () {
        var bitmap, canvas, ctx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("attempting getting data from element asynch");
                    return [4 /*yield*/, createImageBitmap(imageElement)];
                case 1:
                    bitmap = _a.sent();
                    canvas = document.createElement('canvas');
                    ctx = canvas.getContext('2d');
                    width = imageElement.naturalWidth;
                    height = imageElement.naturalHeight;
                    canvas.width = width;
                    canvas.height = height;
                    console.log("size: " + width + ", " + height);
                    ctx.drawImage(bitmap, 0, 0);
                    return [2 /*return*/, ctx.getImageData(0, 0, canvas.width, canvas.height)];
            }
        });
    });
}
function getDataFromElement(imgElement, fast) {
    return __awaiter(this, void 0, void 0, function () {
        var imageData, y, x, index, red, green, blue, alpha, color, iX, iY, paletteProcessingColorData, y, x, index;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("processing data from element");
                    return [4 /*yield*/, getImageData(imgElement)];
                case 1:
                    imageData = _a.sent();
                    imageColorData = [];
                    for (y = 0; y < height; y++) {
                        for (x = 0; x < width; x++) {
                            index = (y * width + x) * 4;
                            red = imageData.data[index];
                            green = imageData.data[index + 1];
                            blue = imageData.data[index + 2];
                            alpha = imageData.data[index + 3];
                            color = new Color(red, green, blue, alpha);
                            imageColorData.push(color);
                        }
                    }
                    iX = 1;
                    iY = 1;
                    if (fast) {
                        // round or floor? does it matter?
                        iX = Math.round(width / 1000);
                        iY = Math.round(height / 500);
                    }
                    paletteProcessingColorData = [];
                    for (y = 0; y < height; y += iY) {
                        for (x = 0; x < width; x += iX) {
                            index = y * width + x;
                            //do not add data that isn't full alpha #FIXME handling partial transparency
                            if (imageColorData[index].A != 255)
                                continue;
                            paletteProcessingColorData.push(imageColorData[index]);
                        }
                    }
                    // setup k means calc
                    KMeansCalc = new KMeansCalculator(paletteProcessingColorData);
                    return [2 /*return*/];
            }
        });
    });
}
function displayImageFromArray(colors, displayElement) {
    console.log("attempting image display");
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    var imageData = ctx.createImageData(width, height);
    var data = imageData.data;
    for (var i = 0; i < colors.length; i++) {
        var color = colors[i];
        data[i * 4] = color.R;
        data[i * 4 + 1] = color.G;
        data[i * 4 + 2] = color.B;
        data[i * 4 + 3] = 255; // Alpha is always full
    }
    ctx.putImageData(imageData, 0, 0);
    displayElement.src = canvas.toDataURL();
}
// running this assumes dataGotten has been called
function quantizeAndDisplay(k, maxIterations, outputImgElement, outputPaletteTextElement, outputImageTextElement, debugLabel, makeCodeMode) {
    return __awaiter(this, void 0, void 0, function () {
        function insertPiece(piece) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (makeCodeMode)
                                outputImageTextElement.value += piece;
                            if (piece == undefined || piece == 'undefined' || piece === undefined || piece === 'undefined')
                                console.log("problematic data");
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 0); })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        var startTime, palette, endTime, paletteText, i, outputImageColorData, outputImgString, temp, lineSize, i, nearIndex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("attempting quantizing");
                    startTime = new Date().getTime();
                    return [4 /*yield*/, KMeansCalc.calculateKMeans(k, maxIterations, debugLabel)];
                case 1:
                    palette = _a.sent();
                    endTime = new Date().getTime();
                    console.log("time for palette gen: " + (endTime - startTime));
                    startTime = new Date().getTime();
                    if (makeCodeMode) {
                        paletteText = "namespace userconfig {\n    export const ARCADE_SCREEN_WIDTH = " + width + "\n    export const ARCADE_SCREEN_HEIGHT = " + height + "\n}\nimage.setPalette(hex`000000";
                        for (i = 0; i < palette.length; i++) {
                            //console.log(palette[i].R  + ", " + palette[i].G + ", " + palette[i].B);
                            paletteText += palette[i].toHex();
                        }
                        paletteText += "`);";
                        outputPaletteTextElement.value = paletteText;
                    }
                    outputImageColorData = [];
                    outputImgString = "let mySprite = sprites.create(img`\n";
                    if (makeCodeMode) {
                        outputImageTextElement.value = outputImgString;
                        debugLabel.textContent = "Adding text: 0/" + height;
                    }
                    temp = "";
                    lineSize = width * 200;
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < imageColorData.length)) return [3 /*break*/, 5];
                    nearIndex = imageColorData[i].nearestInPaletteIndex(palette);
                    outputImageColorData.push(palette[nearIndex]);
                    if (!makeCodeMode)
                        return [3 /*break*/, 4];
                    // make text show up in chunks
                    temp += (nearIndex + 1).toString(16);
                    if (i % width == 0 && i != 0)
                        temp += "\n";
                    if (!(i % lineSize == 0)) return [3 /*break*/, 4];
                    if ((i / width) % 50 == 0)
                        debugLabel.textContent = "Adding text: " + (i / width) + "/" + height;
                    return [4 /*yield*/, insertPiece(temp)];
                case 3:
                    _a.sent();
                    temp = "";
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    if (makeCodeMode)
                        outputImageTextElement.value += "`, SpriteKind.Player);";
                    endTime = new Date().getTime();
                    console.log("time for text gen: " + (endTime - startTime));
                    startTime = new Date().getTime();
                    console.log("Done text");
                    displayImageFromArray(outputImageColorData, outputImgElement);
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=imageProcessing.js.map