//DEFINITIONS
let svg = document.getElementById('comparison');
let oneVectorLength = 5;

let importInput1 = document.getElementById('import1');
let importInput2 = document.getElementById('import2');

let naturalCheckbox = document.getElementById('natural');

let compareButton = document.getElementById('run');
let exportButton = document.getElementById('export');

let sequenceText1 = document.getElementById('seq1');
let sequenceText2 = document.getElementById('seq2');

let letters = {
    'A': {x: -1, y: 0, length: 1}, 
    'C': {x: 0, y: -1, length: 4}, 
    'T': {x: 1, y: 0, length: 2}, 
    'U': {x: 1, y: 0, length: 2}, 
    'G': {x: 0, y: 1, length: 3}
};

//2del
let XNA = ['', '', '', ''];

importInput1.addEventListener("change", () => {
    let file = importInput1.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
        read_result = reader.result;
        XNA[0] = read_result;
        reg = />.*/i;
        XNA[0] = XNA[0].split(reg).filter(function(value){return value != ''})[0];
        XNA[0] = XNA[0].replaceAll('\r', '');
        XNA[0] = XNA[0].replaceAll('\n', '');
        sequenceText1.textContent = XNA[0];
    };
});

importInput2.addEventListener("change", () => {
    let file = importInput2.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
        read_result = reader.result;
        XNA[1] = read_result;
        reg = />.*/i;
        XNA[1] = XNA[1].split(reg).filter(function(value){return value != ''})[0];
        XNA[1] = XNA[1].replaceAll('\r', '');
        XNA[1] = XNA[1].replaceAll('\n', '');
        sequenceText2.textContent = XNA[1];
    };
});


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


function partOfPath(x1, y1, x2, y2){
    return 'M ' + (x1 * oneVectorLength) + ', ' + (y1 * oneVectorLength) + 
    '\n L' + (x2 * oneVectorLength) + ', ' + (y2 * oneVectorLength) + '\n';
}

function drawComparison(){
    svg.innerHTML = "";
    let path1 = "";
    let path2 = "";
    let x1 = 0;
    let y1 = svg.getBoundingClientRect().height / oneVectorLength;
    let x2 = 0;
    let y2 = svg.getBoundingClientRect().height / oneVectorLength;
    let length = Math.min(XNA[0].length, XNA[1].length);
    let weirdSymbols = false;
    for (let i = 0; i < length; i++){
        if (XNA[0][i] == XNA[1][i] && letters[XNA[0][i]]){
            path1 += partOfPath(x1, y1, x1 + 1, y1 - 1);
            path2 += partOfPath(x2, y2, x2 + 1, y2 - 1);
            x1 += 1;
            y1 -= 1;
            x2 += 1;
            y2 -= 1;
        } else {
            if (letters[XNA[0][i]]){
                l = 1;
                if (naturalCheckbox.checked == true){
                    l = letters[XNA[0][i]].length;
                }
                path1 += partOfPath(x1, y1, x1 + letters[XNA[0][i]].x * l, y1 + letters[XNA[0][i]].y * l);
                x1 += letters[XNA[0][i]].x * l; 
                y1 += letters[XNA[0][i]].y * l;
            } 
            else if (XNA[0][i] == "-"){
                path1 += 'M ' + (x1 + oneVectorLength) + ', ' + (y1 - oneVectorLength) + "\n";
                x1 += 1;
                y1 -= 1;
            }
            else if (!weirdSymbols) {
                weirdSymbols = true;
                alert('Symbol ' + XNA[0][i] + " can't be processed");
            }
            if (letters[XNA[1][i]]){
                l = 1;
                if (naturalCheckbox.checked == true){
                    l = letters[XNA[1][i]].length;
                }
                path2 += partOfPath(x2, y2, x2 + letters[XNA[1][i]].x * l, y2 + letters[XNA[1][i]].y * l);
                x2 += letters[XNA[1][i]].x * l; 
                y2 += letters[XNA[1][i]].y * l;
            }
            else if (XNA[1][i] == "-"){
                path2 += 'M ' + (x2 + oneVectorLength) + ', ' + (y2 - oneVectorLength) + "\n";
                x2 += 1;
                y2 -= 1;
            }
            else if (!weirdSymbols) {
                weirdSymbols = true;
                alert('Symbol ' + XNA[1][i] + " can't be processed");
            }
        }
    }
    path1 += 'z';
    path2 += 'z';
    drawPath(path1, 'red', 0.5);
    drawPath(path2, 'blue', 1);
}

function drawPath(path, color, width){
    let element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    element.setAttribute('d', path);
    element.setAttribute('stroke', color);
    element.setAttribute('stroke-width', width);
    element.setAttribute('stroke-linecap', 'round');
    svg.appendChild(element);
}