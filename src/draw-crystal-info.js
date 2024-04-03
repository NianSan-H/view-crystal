function drawElements(canvas, composition) {
    let ctx = canvas.getContext("2d");

    console.log(composition)
    for (let ii = 0; ii < composition.length; ii++) {
        let element = composition[ii]
        let color = `rgb(${Math.round(element.color[0] * 255)}, 
                         ${Math.round(element.color[1] * 255)}, 
                         ${Math.round(element.color[2] * 255)})`;

        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;
        let centerX = canvasWidth / 4;
        let centerY = canvasHeight / 5 * (ii + 1) - canvasHeight / 10;
        let radius = element.radius * canvasWidth / 150;

        let fontStyle = `bold ${canvasWidth / 6}px serif`;
        let fontOffset = canvasWidth / 3;

        drawSphere(ctx, centerX, centerY, color, radius);
        drawText(ctx, fontStyle, centerX + fontOffset, centerY, element.symbol)
    }

    function drawSphere(ctx, x, y, color, radius) {
        /* 使用渐变填充模拟光照效果下球的阴影 */
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);

        var gradient = ctx.createRadialGradient(x, y, radius, x, y, radius / 3, radius);
        gradient.addColorStop(0, "#666666");
        gradient.addColorStop(1, color);

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


function createChildCanvas(canvasCrystal, canvasElement, width, height, left, top) {
    canvasElement.width = width;
    canvasElement.height = height;
    canvasElement.style.position = "absolute";
    canvasElement.style.left = left;
    canvasElement.style.top = top;
    canvasCrystal.parentNode.appendChild(canvasElement);
}


function drawCrystalInfo(canvasCrystal, crystal) {
    let composition = crystal.composition
    let canvasCrystalRect = canvasCrystal.getBoundingClientRect();
    let canvasCrystalStyle = getComputedStyle(canvasCrystal);
    let canvasCrystalWidth = parseInt(canvasCrystalStyle.getPropertyValue("width"));
    let canvasCrystalHeight = parseInt(canvasCrystalStyle.getPropertyValue("height"));

    let canvasElement = document.createElement("canvas");
    createChildCanvas(
        canvasCrystal,
        canvasElement,
        canvasCrystalWidth / 5,
        composition.length * (canvasCrystalHeight / 10),
        `${canvasCrystalRect.left}px`,
        `${canvasCrystalRect.top}px`,
    )

    drawElements(canvasElement, composition)
}



export { drawCrystalInfo }