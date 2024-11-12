const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
let drawing = false;
let eraser = false;
let undoStack = [];
let redoStack = [];
let drawingRectangle = false; 
let drawingCircle = false;
let drawingLine = false;
let startX, startY; 
let brushStyle = 'solid'
let snapshot;
let gallery = [];



canvas.width = window.innerWidth * 0.7;
canvas.height = window.innerHeight * 0.8;

let color = document.getElementById('colorSelect').value;
let lineWidth = document.getElementById('lineWidth').value;
const brushStyleSelector = document.getElementById('brush-style')


brushStyleSelector.addEventListener('change', (e) => {
    brushStyle = e.target.value;
});

setCursor('crayon');

document.getElementById('colorSelect').addEventListener('input', (e) => {
    color = e.target.value;
    eraser = false;
    setCursor('crayon');
});

const lineWidthInput = document.getElementById('lineWidth');

lineWidthInput.addEventListener('input', (e) => {
    lineWidth = e.target.value; 
    const thumbSize = (lineWidth*0.5+10); 
    lineWidthInput.style.setProperty('--thumb-width', `${thumbSize}px`);
    lineWidthInput.style.setProperty('--thumb-height', `${thumbSize}px`);
});



document.getElementById('eraser').addEventListener('click', (e) => {
    eraser = !eraser;
    if (eraser) {
        color = "#FFFFFF";
        
        setCursor('eraser');
    }
});

document.getElementById('crayon').addEventListener('click', (e) => {
    eraser = !eraser;
    if (eraser) {
        color = color = document.getElementById('colorSelect').value;
         
        setCursor('crayon');
    }
});

document.getElementById('rectangle').addEventListener('click', () => {
    drawingRectangle = true; 
    drawingCircle = false;
    drawingLine = false;
});

document.getElementById('circle').addEventListener('click', () => {
    drawingCircle = true;
    drawingRectangle = false; 
    drawingLine = false;
});

document.getElementById('line').addEventListener('click', () => {
    drawingCircle = false;
    drawingRectangle = false; 
    drawingLine = true;
});




canvas.addEventListener('mousedown', (e) => {
    if (drawingRectangle || drawingCircle || drawingLine) {
        drawing = true;
        startX = e.offsetX;
        startY = e.offsetY;
        undoStack.push(canvas.toDataURL());
        redoStack = [];
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    }else{
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
        undoStack.push(canvas.toDataURL());
        redoStack = [];
        
    }
});


canvas.addEventListener('mousemove', (e) => {
    
    if (drawing) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        if (brushStyle === 'dashed') {
            ctx.setLineDash([5, 5]); 
        } else if (brushStyle === 'solid') {
            ctx.setLineDash([]);  
        }



        if (drawingRectangle) {
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
            ctx.putImageData(snapshot, 0, 0);
            const width = e.offsetX - startX;
            const height = e.offsetY - startY;
            ctx.strokeRect(startX, startY, width, height);
        } else if (drawingCircle){
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
            ctx.putImageData(snapshot, 0, 0);
            
            const radius = Math.sqrt(Math.pow(e.offsetX - startX, 2) + Math.pow(e.offsetY - startY, 2));
            ctx.beginPath();
            ctx.arc(startX,startY,radius,0,2*Math.PI);
            ctx.stroke();
        
        }else if (drawingLine){
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
            ctx.putImageData(snapshot, 0, 0);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }else {
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
        }
    }
    
});

canvas.addEventListener('mouseup', () => {
    if (drawingRectangle) {
        drawing = false;
        ctx.closePath();
        drawingRectangle = false; 
    } else if (drawingCircle) {
        drawing = false;
        ctx.closePath();
        drawingCircle = false;
    } else if (drawingLine) {
        drawing = false;
        ctx.closePath();
        drawingLine = false;
    }else {
        drawing = false;
        ctx.closePath();
    }


});

canvas.addEventListener('mouseout', () => {
    drawing = false;
    ctx.closePath();
});

document.getElementById('erase_all').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoStack.push(canvas.toDataURL()); 
});


document.getElementById('undo').addEventListener('click', () => {
    if (undoStack.length > 0) {
        redoStack.push(canvas.toDataURL());
        const lastState = undoStack.pop(); 
        redoStack.push(lastState);
        const img = new Image();
        img.src = lastState;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
            ctx.drawImage(img, 0, 0); 
        };
    } 
});

document.getElementById('redo').addEventListener('click', () => {
    if (redoStack.length > 0) {
        const redoState = redoStack.pop(); 
        undoStack.push(redoState); 
        const img = new Image();
        img.src = redoState;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
            ctx.drawImage(img, 0, 0); 
        };
    } 
});


function setCursor(type) {
    if (type === 'crayon') {
        canvas.style.cursor = 'url(crayon.png) 0 32, auto'; 
    } else if (type === 'eraser') {
        canvas.style.cursor = 'url(la-gomme.png) 2 4, auto'; 
    }
}


window.addEventListener('resize', () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);
    
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight * 0.8;
    ctx.drawImage(tempCanvas, 0, 0);
});

document.getElementById('save').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my_drawing.png';
    link.href = canvas.toDataURL();
    link.click();
});

document.getElementById('gallery-add').addEventListener('click', () => {
    const drawingData = canvas.toDataURL();
    gallery.push(drawingData);
    updateGallery();
});

function updateGallery() {
    const galleryContainer = document.getElementById('gallery');
    galleryContainer.innerHTML = '';
    gallery.forEach((drawing, index) => {
        const img = document.createElement('img');
        img.src = drawing;
        img.alt = 'Drawing ${index + 1}';
        img.className = 'gallery-thumbnail';
        img.addEventListener('click', () => {
            const img = new Image();
            img.src = drawing;
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
        });
        galleryContainer.appendChild(img);
    });
}

const siteUrl = encodeURIComponent(window.location.href); 
const msg = encodeURIComponent("Réveillez votre âme d'artiste grâce à SketchFlow")
const siteTitle = encodeURIComponent(document.title); 

document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${siteUrl}`;
document.getElementById('share-twitter').href = `https://twitter.com/intent/tweet?url=${siteUrl}&text=${msg}`;

document.getElementById('share-pinterest').href = `https://pinterest.com/pin/create/button/?url=${siteUrl}&description=${msg}`;
