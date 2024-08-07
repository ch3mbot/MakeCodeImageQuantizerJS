// element variables
const fileUploadInput = document.getElementById('file-upload');
const fastAccurateSwitch = document.getElementById('toggle-switch');
const maxIterationInput = document.getElementById('max-iterations');
const customScaleInput = document.getElementById('custom-scale');
const customWidthInput = document.getElementById('custom-width');
const customHeightInput = document.getElementById('custom-height');

const colorSelectors = [];
for (let i = 1; i <= 15; i++) {
    colorSelectors.push(document.getElementById(`select-${i}`));
}

const colorInputs = [];
for (let i = 1; i <= 15; i++) {
    colorInputs.push(document.getElementById(`color-${i}`));
}

const generatePaletteButton = document.getElementById('generate-palette');
const applyPaletteButton = document.getElementById('apply-palette');
const debugText = document.getElementById('debugText');
const originalImage = document.getElementById('original-image');
const processedImage = document.getElementById('processed-image');

const allDefaultButton = document.getElementById('all-default-button');
const allGenerateButton = document.getElementById('all-generate-button');

const infoButton = document.getElementById('info-button');

const resOption1 = document.getElementById('res-option-1');
const resOption2 = document.getElementById('res-option-2');
const resOption3 = document.getElementById('res-option-3');

// some config variables 
const validFileTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/bmp",
    "image/tiff",
    "image/svg+xml",
    "image/webp",
];

const maxMaxIterations = 500;
const maxSingleAxisRes = 5000;

const defaultColorPalette = ["#ffffff","#ff2121","#ff93c4","#ff8135","#fff609","#249ca3","#78dc52","#003fad","#87f2ff","#8e2ec4","#a4839f","#5c406c","#e5cdc4","#91463d","#000000"];

// config choices with default values
let file; 
let speedMode = true;
let maxIterations = 200;
let targetResolution = [1, 1];
let genColorNum = 15;
let genColorIndices = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
let fullColorPalette = ["#ffffff","#ff2121","#ff93c4","#ff8135","#fff609","#249ca3","#78dc52","#003fad","#87f2ff","#8e2ec4","#a4839f","#5c406c","#e5cdc4","#91463d","#000000"];
let currentResolutionChoice = 1;

// array of the disabled status of elements, to be stored while processing. format is "element-id":false
let previousDisabledStatus = {
}

// data from image
let imageWidth = 1;
let imageHeight = 1;

console.log("starting...")

function setTargetRes(x, y) {
    targetResolution = [x, y];
    console.log("targetResolution set to: " + targetResolution[0] + ", " + targetResolution[1]);
}

// cannot process until an image is uploaded
generatePaletteButton.disabled = true;
applyPaletteButton.disabled = true;

// instructions on how to use 
infoButton.addEventListener('change', function() {

})

// handling number input changes
fileUploadInput.addEventListener('change', function() {
    toggleProcessingMode(true);
    file = fileUploadInput.files[0];
    if (file) {
        originalImage.style.display = 'none'
        processedImage.style.display = 'none'
        const reader = new FileReader();
        reader.onload = function(event) {
            if (determineCanProcess()[1]) {
                originalImage.src = event.target.result;
                originalImage.style.display = 'block'; 
                var img = new Image();
                img.src = event.target.result;  
                img.onload = function () {
                    imageWidth = img.width;
                    imageHeight = img.height;
                    customWidthInput.value = imageWidth;
                    customHeightInput.value = imageHeight;
                    setResolutionMode(currentResolutionChoice);
                    console.log("width: " + imageWidth + " height: " + imageHeight)
                    toggleProcessingMode(false);
                    determineCanProcess(); //do again since toggleProcessingMode will have messed with things.
                }
            }
        };
        reader.readAsDataURL(file);
        console.log("new file of type " + file.type + " uploaded")
    }
});    

function determineCanProcess() {
    let canGenPalette = true;
    let canApplyPalette = true;
    if(!file) {
        debugText.textContent = "Cannot process or apply palette, no file.";
        canGenPalette = false;
        canApplyPalette = false;
    } else if(validFileTypes.indexOf(file.type + "") < 0) {
        debugText.textContent = "Cannot process or apply palette, wrong file type.";
        canGenPalette = false;
        canApplyPalette = false;
    } else if (genColorNum == 0) {
        debugText.textContent = "Cannot process. No generation colours. Can apply palette"
        canGenPalette = false;
    } else {
        debugText.textContent = "Can process. Filetype: " + file.type + ". Colors: " + genColorNum + ". Mode: " + (speedMode ? "Fast" : "Accurate") + ".";
    }
    generatePaletteButton.disabled = !canGenPalette;
    applyPaletteButton.disabled = !canApplyPalette; 

    return [canGenPalette, canApplyPalette];
}

fastAccurateSwitch.addEventListener('change', function() {
    speedMode = !fastAccurateSwitch.checked;
    console.log("speedmode set to: " + speedMode)
});

maxIterationInput.addEventListener('change', function() {
    if(maxIterationInput.value < 1)
        maxIterationInput.value = 1;
    if(maxIterationInput.value > maxMaxIterations)
        maxIterationInput.value = maxMaxIterations;
    maxIterations = maxIterationInput.value;
    console.log("max iterations set to: " + maxIterations)
});

// when one of three resolution modes is selected
function setResolutionMode(selectionNumber) {
    console.log("resolution mode selected: " + selectionNumber);
    currentResolutionChoice = selectionNumber;
    switch(selectionNumber) {
        case 1:
            customScaleInput.disabled = true;
            customWidthInput.disabled = true;
            customHeightInput.disabled = true;
            setTargetRes(imageWidth, imageHeight);
            break;
        case 2:
            customScaleInput.disabled = false;
            customWidthInput.disabled = true;
            customHeightInput.disabled = true;
            setTargetRes(imageWidth * customScaleInput.value, imageHeight * customScaleInput.value);
            break;
        case 3:
            customScaleInput.disabled = true;
            customWidthInput.disabled = false;
            customHeightInput.disabled = false;
            setTargetRes(customWidthInput.value, customHeightInput.value);
            break;
    }
}

// correct scale value to fit within bounds
customScaleInput.addEventListener('change', function() {
    let newW = imageWidth * customScaleInput.value;
    let newH = imageHeight * customScaleInput.value

    if(newW < 1) {
        console.log("newW was " + newW + ". correcting.");
        customScaleInput.value = Math.ceil(1 / imageWidth);
        newW = 1;
    } else if(newW > maxSingleAxisRes) {
        console.log("newW was " + newW + ". correcting.");
        customScaleInput.value = Math.floor(maxSingleAxisRes / imageWidth);
        newW = maxSingleAxisRes;
    }
    
    if(newH < 1) {
        console.log("newH was " + newH + ". correcting.");
        customScaleInput.value = Math.ceil(1 / imageHeight);
        newH = 1;
    } else if(newH > maxSingleAxisRes) {
        console.log("newH was " + newH + ". correcting.");
        customScaleInput.value = Math.floor(maxSingleAxisRes / imageHeight);
        newH = maxSingleAxisRes;
    }

    setTargetRes(newW, newH);
});

function clampSingleAxisRes(inputResVal) {
    if(inputResVal < 1) 
        return 1;
    if(inputResVal > maxSingleAxisRes)
        return maxSingleAxisRes;
    return inputResVal;
}

customWidthInput.addEventListener('change', function() {
    let newW = clampSingleAxisRes(customWidthInput.value);
    let newH = clampSingleAxisRes(customHeightInput.value);
    customWidthInput.value = newW;
    
    setTargetRes(newW, newH);
});

customHeightInput.addEventListener('change', function() {
    let newW = clampSingleAxisRes(customWidthInput.value);
    let newH = clampSingleAxisRes(customHeightInput.value);
    customHeightInput.value = newH;
    
    setTargetRes(newW, newH);
});

function recalculateGenNum() {
    genColorNum = 0;
    for(let i = 1; i <= 15; i++){
        if(genColorIndices[i - 1])
            genColorNum++;
    }
    determineCanProcess();
}

// by default all colors are to be generated
for(let i = 1; i <= 15; i++) {
    colorInputs[i - 1].value = "#FFFFFF";
    colorInputs[i - 1].disabled = true;
    colorInputs[i - 1].style.opacity = 0.45;
    colorSelectors[i - 1].addEventListener('change', function() {
        switch(colorSelectors[i - 1].value) {
            case "generate":
                genColorIndices[i - 1] = true;
                recalculateGenNum();

                colorInputs[i - 1].disabled = true;
                colorInputs[i - 1].style.opacity = 0.45;
                colorInputs[i - 1].value = "#FFFFFF"
                break;
            case "custom":
                genColorIndices[i - 1] = false;
                recalculateGenNum();

                colorInputs[i - 1].disabled = false;
                colorInputs[i - 1].style.opacity = 1.0;
                break;
            case "default":
                genColorIndices[i - 1] = false;
                recalculateGenNum();

                colorInputs[i - 1].disabled = true;
                colorInputs[i - 1].style.opacity = 0.45;
                colorInputs[i - 1].value = defaultColorPalette[i - 1];
                break;
        }
        console.log("number to be generated: " + genColorNum);
    })

    colorInputs[i - 1].addEventListener('change', function() {
        quantize();
    })
}

allDefaultButton.addEventListener('click', function(){
    for(let i = 1; i <= 15; i++){
        genColorIndices[i - 1] = false;
        colorInputs[i - 1].disabled = true;
        colorInputs[i - 1].style.opacity = 0.45;
        colorInputs[i - 1].value = defaultColorPalette[i - 1];
        colorSelectors[i - 1].value = "default";
    }
    recalculateGenNum();
});

allGenerateButton.addEventListener('click', function(){
    for(let i = 1; i <= 15; i++){
        genColorIndices[i - 1] = true;
        colorInputs[i - 1].disabled = true;
        colorInputs[i - 1].style.opacity = 0.45;
        colorInputs[i - 1].value = "#FFFFFF";
        colorSelectors[i - 1].value = "generate";
    }
    recalculateGenNum();
});

generatePaletteButton.addEventListener('click', function() {
    console.log("gen hit.");
    toggleProcessingMode(true);
    let nonGenPalette = [];
    for(let i = 0; i < 15; i++) {
        if(colorSelectors[i].value != "generate") {
            nonGenPalette.push(colorInputs[i].value);
        }
    }

    getDataFromElement(originalImage, speedMode).then(() => {
        genPalette(genColorNum, maxIterations, debugText).then(value =>{
            console.log("pal: " + value);
    
            for(let i = 0; i < 15; i++) {
                if(colorSelectors[i].value == "generate") {
                    let newColStr = value.pop();
                    colorInputs[i].value = newColStr
                    fullColorPalette[i] = newColStr;
                }
            }

            toggleProcessingMode(false);
        });
    });

})

applyPaletteButton.addEventListener('click', function() {
    console.log("apply hit.");
    for(let i = 0; i < 15; i++) {
        fullColorPalette[i] = colorInputs[i].value;
    }
    if(determineCanProcess()[1]) {
        quantize();
    }
})

// call the typescript function properly
function quantize(){
    console.log("Quantizing with width " + targetResolution[0] + " height " + targetResolution[1]);
    toggleProcessingMode(true);
    console.log(fullColorPalette[0]);
    getDataFromElement(originalImage, speedMode).then(() => {
        console.log("done getting data");
        quantizeAndDisplay(processedImage, debugText, fullColorPalette, targetResolution[0], targetResolution[1]).then(() => {
            console.log("Palette: " + fullColorPalette);
            processedImage.style.display = 'block'; 
            debugText.textContent = "Completed";
            console.log("done out here");
            toggleProcessingMode(false);
        })
    })
}

// function that disables and enables all elements while processing.
function toggleProcessingMode(processing){
    let relevantElementList = [
        fileUploadInput,
        fastAccurateSwitch,
        maxIterationInput,
        resOption1,
        resOption2,
        resOption3,
        customScaleInput,
        customWidthInput,
        customHeightInput,
        allGenerateButton,
        allDefaultButton,
        generatePaletteButton,
        applyPaletteButton,
    ];
    relevantElementList.push(...colorSelectors);
    relevantElementList.push(...colorInputs);

    for(let element of relevantElementList) {
        if (processing) {
            previousDisabledStatus[element.id] = element.disabled;
            element.disabled = true;
        } else {
            element.disabled = previousDisabledStatus[element.id];
        }
    }
}

// make image process button work
// mark image preview as old on palette gen data change
// update the image immediately on non palette gen data change
// add copy buttons to put into makecode