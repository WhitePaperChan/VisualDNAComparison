//DEFINITIONS
let svg = document.getElementById('comparison');
let oneVectorLength = 10;

let importInput1 = document.getElementById('import1');
let importInput2 = document.getElementById('import2');

let seq1edit = document.getElementById('seq1edit');
let seq2edit = document.getElementById('seq2edit');

let seq1check = document.getElementById('seq1check');
let seq2check = document.getElementById('seq2check');

let widthInput1 = document.getElementById('width1');
let widthInput2 = document.getElementById('width2');

let naturalCheckbox = document.getElementById('natural');

let shorterCheckbox = document.getElementById('shorter');
let identicalPartsRadio = document.getElementsByName('identical');

let compareButton = document.getElementById('run');
let exportButton = document.getElementById('export');

let colorPicker1 = document.getElementById('color1');
let colorPicker2 = document.getElementById('color2');

let resetButton = document.getElementById('reset');

let overlay = document.getElementById('overlay');

let identicalPartsMode = "sqrt(n)";
identicalPartsModeCheck();

let letters = {
    'A': {x: -1, y: 0, length: 1}, 
    'C': {x: 0, y: -1, length: 4}, 
    'T': {x: 1, y: 0, length: 2}, 
    'U': {x: 1, y: 0, length: 2}, 
    'G': {x: 0, y: 1, length: 3}
};

//===========TUTORIAL===================
if (window.PointerEvent) {
    svg.addEventListener('pointerdown', onPointerDown); // Pointer is pressed
    svg.addEventListener('pointerup', onPointerUp); // Releasing the pointer
    svg.addEventListener('pointerleave', onPointerUp); // Pointer gets out of the SVG area
    svg.addEventListener('pointermove', onPointerMove); // Pointer is moving
} else {
    // Add all mouse events listeners fallback
    svg.addEventListener('mousedown', onPointerDown); // Pressing the mouse
    svg.addEventListener('mouseup', onPointerUp); // Releasing the mouse
    svg.addEventListener('mouseleave', onPointerUp); // Mouse gets out of the SVG area
    svg.addEventListener('mousemove', onPointerMove); // Mouse is moving
  
    // Add all touch events listeners fallback
    svg.addEventListener('touchstart', onPointerDown); // Finger is touching the screen
    svg.addEventListener('touchend', onPointerUp); // Finger is no longer touching the screen
    svg.addEventListener('touchmove', onPointerMove); // Finger is moving
}

// This variable will be used later for move events to check if pointer is down or not
var isPointerDown = false;

// This variable will contain the original coordinates when the user start pressing the mouse or touching the screen
var pointerOrigin = {
  x: 0,
  y: 0
};

// Function called by the event listeners when user start pressing/touching
function onPointerDown(event) {
  isPointerDown = true; // We set the pointer as down
  
  // We get the pointer position on click/touchdown so we can get the value once the user starts to drag
  var pointerPosition = getPointFromEvent(event);
  pointerOrigin.x = pointerPosition.x;
  pointerOrigin.y = pointerPosition.y;
}

// We save the original values from the viewBox
var viewBox = {
    x: 0,
    y: 0,
    width: 1000,
    height: 1000
  };
  
  // The distances calculated from the pointer will be stored here
  var newViewBox = {
    x: 0,
    y: 0
  };
  
  // Function called by the event listeners when user start moving/dragging
  function onPointerMove (event) {
    // Only run this function if the pointer is down
    if (!isPointerDown) {
      return;
    }
    // This prevent user to do a selection on the page
    event.preventDefault();
  
    // Get the pointer position
    var pointerPosition = getPointFromEvent(event);
  
    // We calculate the distance between the pointer origin and the current position
    // The viewBox x & y values must be calculated from the original values and the distances
    newViewBox.x = viewBox.x - ((pointerPosition.x - pointerOrigin.x) * ratio);
    newViewBox.y = viewBox.y - ((pointerPosition.y - pointerOrigin.y) * ratio);
  
    // We create a string with the new viewBox values
    // The X & Y values are equal to the current viewBox minus the calculated distances
    var viewBoxString = `${newViewBox.x} ${newViewBox.y} ${viewBox.width} ${viewBox.height}`;
    // We apply the new viewBox values onto the SVG
    svg.setAttribute('viewBox', viewBoxString);
  }

  function onPointerUp() {
    // The pointer is no longer considered as down
    isPointerDown = false;
  
    // We save the viewBox coordinates based on the last pointer offsets
    viewBox.x = newViewBox.x;
    viewBox.y = newViewBox.y;
  }

  // Calculate the ratio based on the viewBox width and the SVG width
var ratio = viewBox.width / svg.getBoundingClientRect().width;
window.addEventListener('resize', function() {
  ratio = viewBox.width / svg.getBoundingClientRect().width;
});

// This function returns an object with X & Y values from the pointer event
function getPointFromEvent (event) {
    var point = {x:0, y:0};
    // If event is triggered by a touch event, we get the position of the first finger
    if (event.targetTouches) {
      point.x = event.targetTouches[0].clientX;
      point.y = event.targetTouches[0].clientY;
    } else {
      point.x = event.clientX;
      point.y = event.clientY;
    }
    
    return point;
  }

//============== END OF TUTORIAL =================

svg.onwheel = zoom;

var scale = 1;

function zoom(event){
    event.preventDefault();
    viewBox.width += event.deltaY * 0.2;
    viewBox.height += event.deltaY * 0.2;
    var viewBoxString = `${newViewBox.x} ${newViewBox.y} ${viewBox.width} ${viewBox.height}`;
    svg.setAttribute('viewBox', viewBoxString);
}

resetButton.addEventListener('click', () => {
    viewBox.x = 0
    viewBox.y = 0
    newViewBox.x = 0
    newViewBox.y = 0
    var viewBoxString = `0 0 ${viewBox.width} ${viewBox.height}`;
    svg.setAttribute('viewBox', viewBoxString);
});

seq1check.addEventListener('change', () => {
    seq1edit.disabled = !seq1check.checked;
})

seq2check.addEventListener('change', () => {
    seq2edit.disabled = !seq2check.checked;
})  

function identicalPartsModeCheck(){
    identicalPartsRadio.forEach(i => {
        if (i.checked){
            identicalPartsMode = i.value;
        }
    })
}

let XNA = [seq1edit.value, seq2edit.value];

let color1 = colorPicker1.value;
let color2 = colorPicker2.value;

importInput1.addEventListener("change", () => {
    let file = importInput1.files[0];
    let reader = new FileReader();
    let format = file.name.slice(file.name.lastIndexOf(".") + 1);
    reader.readAsText(file);
    reader.onload = function() {
        read_result = reader.result;
        XNA[0] = read_result;
        if (format == "gb"){
            XNA[0] = parseGenbank(XNA[0])
        } else {
            XNA[0] = parseFasta(XNA[0], 0)
        }
        seq1edit.value = XNA[0];
    };
});

importInput2.addEventListener("change", () => {
    let file = importInput2.files[0];
    let reader = new FileReader();
    let format = file.name.slice(file.name.lastIndexOf(".") + 1);
    reader.readAsText(file);
    reader.onload = function() {
        read_result = reader.result;
        XNA[1] = read_result;
        if (format == "gb"){
            XNA[1] = parseGenbank(XNA[1])
        } else {
            XNA[1] = parseFasta(XNA[1], 1)
        }
        seq2edit.value = XNA[1];
    };
});

function parseFasta(text, id){
    let reg = />.*/ig;
    let sequences = text.split(reg).filter(function(value){return value != ''});
    let descriptions = text.match(reg);
    if (sequences.length > 1){
        overlay.style.display = 'block';
        createOvelay(descriptions, sequences, id)
        return '';
    }
    sequences[0] = sequences[0].replaceAll('\r', '');
    sequences[0] = sequences[0].replaceAll('\n', '');
    sequences[0] = sequences[0].replaceAll(' ', '');
    XNA[id] = sequences[0];
}

function createOvelay(descriptions, sequences, id){
    overlay.style.display = 'block';
    let radiobuttons = [];
    let labels = [];
    descriptions.forEach(i => {
        radiobuttons.push(document.createElement("input"));
        radiobuttons[radiobuttons.length - 1].name = 'sequences';
        radiobuttons[radiobuttons.length - 1].type = 'radio';
        radiobuttons[radiobuttons.length - 1].id = `sequences ${radiobuttons.length}`;
        overlay.append(radiobuttons[radiobuttons.length - 1]);
        labels.push(document.createElement("label"));
        labels[labels.length - 1].for = `sequences ${radiobuttons.length}`;
        labels[labels.length - 1].innerHTML = i;
        overlay.append(labels[labels.length - 1]);
        overlay.append(document.createElement('br'))
    })
    let buttonOk = document.createElement('input');
    buttonOk.type = 'button';
    buttonOk.value = 'OK';
    buttonOk.class = 'button';
    buttonOk.addEventListener('click', chooseSequence);
    overlay.append(buttonOk);
    let buttonCancel = document.createElement('input');
    buttonCancel.type = 'button';
    buttonCancel.value = 'Cancel';
    buttonCancel.class = 'button';
    buttonCancel.addEventListener('click', removeOverlay);
    overlay.append(buttonCancel);

    function chooseSequence(){
        for (let i = 0; i < radiobuttons.length; i++){
            if (radiobuttons[i].checked){
                if (id == 0){
                    seq1edit.value = sequences[i];
                    seq1edit.value = seq1edit.value.replaceAll('\r', '');
                    seq1edit.value = seq1edit.value.replaceAll('\n', '');
                    seq1edit.value = seq1edit.value.replaceAll(' ', '');
                } else {
                    seq2edit.value = sequences[i];
                    seq2edit.value = seq2edit.value.replaceAll('\r', '');
                    seq2edit.value = seq2edit.value.replaceAll('\n', '');
                    seq2edit.value = seq2edit.value.replaceAll(' ', '');
                }
                break;
            }
        }
        removeOverlay();
    }
}


function removeOverlay(){
    overlay.style.display = 'none';
    overlay.innerHTML = '';
}

function parseGenbank(text){
    let reg = /(?<=ORIGIN).*(?=\/\/)/gms;
    text = text.match(reg)[0];
    reg = /[gatcuGATCU]/gm;
    text = text.match(reg).join("");
    return text;
}

compareButton.addEventListener('click', drawComparison);

exportButton.addEventListener("click", () => {
    let svgData = svg.outerHTML;
    let svgBlob = new Blob([svgData], {type:"image/svg+xml"});
    let svgUrl = URL.createObjectURL(svgBlob);
    let downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "xna_visual_compare.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

colorPicker1.addEventListener('change', () => {
    color1 = colorPicker1.value;
});

colorPicker2.addEventListener('change', () => {
    color2 = colorPicker2.value;
});

function partOfPath(x1, y1, x2, y2){
    return 'M ' + (x1 * oneVectorLength) + ', ' + (y1 * oneVectorLength) + 
    '\n L' + (x2 * oneVectorLength) + ', ' + (y2 * oneVectorLength) + '\n';
}

function drawComparison(){
    XNA[0] = seq1edit.value.toUpperCase();
    XNA[1] = seq2edit.value.toUpperCase();
    svg.innerHTML = "";
    let path1 = "";
    let path2 = "";
    let x1 = 0;
    let y1 = svg.getBoundingClientRect().height / oneVectorLength;
    let x2 = 0;
    let y2 = svg.getBoundingClientRect().height / oneVectorLength;
    let length = Math.min(XNA[0].length, XNA[1].length);
    let weirdSymbols = false;
    let identicalPartsLength = 0;
    let gapLength1 = 0;
    let gapLength2 = 0;
    for (let i = 0; i < length; i++){
        if (XNA[0][i] == XNA[1][i] && letters[XNA[0][i]]){
            processGap1();
            processGap2();
            identicalPartsLength++;
        } else {
            processIdenticalParts()
            if (letters[XNA[0][i]]){
                processGap1();
                l = 1;
                if (naturalCheckbox.checked == true){
                    l = letters[XNA[0][i]].length;
                }
                path1 += partOfPath(x1, y1, x1 + letters[XNA[0][i]].x * l, y1 + letters[XNA[0][i]].y * l);
                x1 += letters[XNA[0][i]].x * l; 
                y1 += letters[XNA[0][i]].y * l;
            } 
            else if (XNA[0][i] == "-"){
                gapLength1++;
            }
            else if (!weirdSymbols) {
                weirdSymbols = true;
                alert('Symbol ' + XNA[0][i] + " can't be processed");
            }
            if (letters[XNA[1][i]]){
                processGap2();
                l = 1;
                if (naturalCheckbox.checked == true){
                    l = letters[XNA[1][i]].length;
                }
                path2 += partOfPath(x2, y2, x2 + letters[XNA[1][i]].x * l, y2 + letters[XNA[1][i]].y * l);
                x2 += letters[XNA[1][i]].x * l; 
                y2 += letters[XNA[1][i]].y * l;
            }
            else if (XNA[1][i] == "-"){
                gapLength2++;
            }
            else if (!weirdSymbols) {
                weirdSymbols = true;
                alert('Symbol ' + XNA[1][i] + " can't be processed");
            }
        }
    }
    if (identicalPartsLength > 0){
        processIdenticalParts()
    }
    path1 += 'z';
    path2 += 'z';
    drawPath(path1, color1, widthInput1.value);
    drawPath(path2, color2, widthInput2.value);

    function processIdenticalParts(){
        identicalPartsModeCheck()
        if (identicalPartsMode == 'identicalSqrtN'){
            identicalPartsLength = Math.sqrt(identicalPartsLength);
        } else if (identicalPartsMode == 'identicalLnN' && identicalPartsLength >= 3){
            identicalPartsLength = Math.log(identicalPartsLength);
        }
        path1 += partOfPath(x1, y1, x1 + identicalPartsLength, y1 - identicalPartsLength);
        path2 += partOfPath(x2, y2, x2 + identicalPartsLength, y2 - identicalPartsLength);
        x1 += identicalPartsLength;
        y1 -= identicalPartsLength;
        x2 += identicalPartsLength;
        y2 -= identicalPartsLength;
        identicalPartsLength = 0;
    }

    function processGap1(){
        identicalPartsModeCheck()
        if (identicalPartsMode == 'identicalSqrtN'){
            gapLength1 = Math.sqrt(gapLength1);
        } else if (identicalPartsMode == 'identicalLnN' && gapLength1 >= 3){
            gapLength1 = Math.log(gapLength1);
        }
        path1 += 'M ' + (x1 + oneVectorLength * gapLength1) + ', ' + (y1 - oneVectorLength * gapLength1) + "\n";
        x1 += gapLength1;
        y1 -= gapLength1;
        gapLength1 = 0;
    }

    function processGap2(){
        identicalPartsModeCheck()
        if (identicalPartsMode == 'identicalSqrtN'){
            gapLength2 = Math.sqrt(gapLength2);
        } else if (identicalPartsMode == 'identicalLnN' && gapLength2 >= 3){
            gapLength2 = Math.log(gapLength2);
        }
        path2 += 'M ' + (x2 + oneVectorLength * gapLength2) + ', ' + (y2 - oneVectorLength * gapLength2) + "\n";
        x2 += gapLength2;
        y2 -= gapLength2;
        gapLength2 = 0;
    }
}

function drawPath(path, color, width){
    let element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    element.setAttribute('d', path);
    element.setAttribute('stroke', color);
    element.setAttribute('stroke-width', width);
    element.setAttribute('stroke-linecap', 'round');
    svg.appendChild(element);
}