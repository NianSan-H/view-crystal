function drawElements(canvas, composition, elementProp) {
    let ctx = canvas.getContext("2d");

    for (let ii = 0; ii < composition.length; ii++) {
        let element = composition[ii]
        let color = [Math.round(element.color[0] * 255), 
                     Math.round(element.color[1] * 255), 
                     Math.round(element.color[2] * 255)];

        let canvasWidth = canvas.width;
        let centerX = canvasWidth / 4;
        let centerY = elementProp * ( 2 * ii + 1 );
        let radius = element.radius * elementProp / 30;

        let fontStyle = `bold ${elementProp}px serif`;
        let fontOffset = canvasWidth / 3;

        drawSphere(ctx, centerX, centerY, color, radius);
        drawText(ctx, fontStyle, centerX + fontOffset, centerY, element.symbol)
    }

    function drawSphere(ctx, x, y, color, radius) {
        /* 使用渐变填充模拟光照效果下球的阴影 */
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);

        let gradient = ctx.createRadialGradient(x, y, radius, x, y, radius / 5, radius);
        gradient.addColorStop(0, `rgb(110, 110, 110)`);
        gradient.addColorStop(0.5, `rgb(${color})`);
        gradient.addColorStop(1, `rgb(${color[0] * 1.1}, ${color[1] * 1.1}, ${color[2] * 1.1})`);

        ctx.fillStyle = gradient;
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    function drawText(ctx, fontStyle, x, y, text) {
        ctx.font = fontStyle;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, y);
    }
}


function createChildCanvas(canvasCrystal, canvasElement, width, height, top, left) {
    canvasElement.width = width;
    canvasElement.height = height;
    canvasElement.style.position = "relative";
    canvasElement.style.top = top;
    canvasElement.style.left = left;

    canvasCrystal.parentNode.appendChild(canvasElement);
}


function drawCrystalInfo(canvasCrystal, composition) {
    let canvasElement = document.getElementById("composition");

    if (!canvasElement) {
        canvasElement = document.createElement("canvas");
        canvasElement.setAttribute("id", "composition");
        createChildCanvas(
            canvasCrystal,
            canvasElement,
            canvasCrystal.offsetWidth / 5,
            composition.length * (canvasCrystal.offsetHeight / 10),

            `-${canvasCrystal.offsetHeight}px`,
            `0px`,
        )
    }

    drawElements(canvasElement, composition, canvasCrystal.offsetHeight / 20)
}



export { drawCrystalInfo }