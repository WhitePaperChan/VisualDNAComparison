//DEFINITIONS
let svg = document.getElementById('comparison');
let oneVectorLength = 5;

//2del
let DNA1 = 'AAA-TATAATTTTTTATTGACATAAACTGGAAGTTTATGTTAGGATAAGCCAATC';
let DNA2 = 'AAACTATAATTTTTTATTGACATAAACTTCCAGTTTATGTTAGGATAAGCCAATA';

let importInput1 = document.getElementById('import1');
let importInput2 = document.getElementById('import2');

let compareButton = document.getElementById('run');

importInput1.addEventListener("change", () => {
    let file = document.getElementById('import1').files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
        read_result = reader.result;
        DNA1 = read_result;
    };
});

importInput2.addEventListener("change", () => {
    let file = document.getElementById('import2').files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
        read_result = reader.result;
        DNA2 = read_result;
    };
});

compareButton.addEventListener('click', drawComparison);

function partOfPath(x1, y1, x2, y2){
    return 'M ' + (x1 * oneVectorLength) + ', ' + (y1 * oneVectorLength) + '\n L' + (x2 * oneVectorLength) + ', ' + (y2 * oneVectorLength) + '\n';
}

function drawComparison(){
    svg.innerHTML = "";
    let path1 = "";
    let path2 = "";
    let x1 = 0;
    let y1 = svg.getBoundingClientRect().height / oneVectorLength;
    let x2 = 0;
    let y2 = svg.getBoundingClientRect().height / oneVectorLength;
    let length = Math.min(DNA1.length, DNA2.length);
    for (let i = 0; i < length; i++){
        if (DNA1[i] == DNA2[i]){
            path1 += partOfPath(x1, y1, x1 + 1, y1 - 1);
            path2 += partOfPath(x2, y2, x2 + 1, y2 - 1);
            x1 += 1;
            y1 -= 1;
            x2 += 1;
            y2 -= 1;
        } else {
            if (DNA1[i] == 'A'){
                path1 += partOfPath(x1, y1, x1 - 1, y1);
                x1 -=1;
            }
            if (DNA1[i] == 'C'){
                path1 += partOfPath(x1, y1, x1, y1 - 1);
                y1 -=1;
            }
            if (DNA1[i] == 'T'){
                path1 += partOfPath(x1, y1, x1 + 1, y1);
                x1 +=1;
            }
            if (DNA1[i] == 'G'){
                path1 += partOfPath(x1, y1, x1, y1 + 1);
                y1 +=1;
            }
            if (DNA1[i] == '-'){
                x1 += 1;
                y1 -= 1;
            }
            if (DNA2[i] == 'A'){
                path2 += partOfPath(x2, y2, x2 - 1, y2);
                x2 -=1;
            }
            if (DNA2[i] == 'C'){
                path2 += partOfPath(x2, y2, x2, y2 - 1);
                y2 -=1;
            }
            if (DNA2[i] == 'T'){
                path2 += partOfPath(x2, y2, x2 + 1, y2);
                x2 +=1;
            }
            if (DNA2[i] == 'G'){
                path2 += partOfPath(x2, y2, x2, y2 + 1);
                y2 +=1;
            }
            if (DNA2[i] == '-'){
                x2 += 1;
                y2 -= 1;
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
    element.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(element);
}

drawComparison();