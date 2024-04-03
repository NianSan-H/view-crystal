import { dealPoscarStr } from "./deal-poscar-str.js";
import { drawCrystal } from "./draw-crystal.js"
import { drawCrystalInfo } from "./draw-crystal-info.js"

let bandCutOff = 2.8;
let atomCutoff = 0.3;

function main(poscarStr) {
    let canvasCrystal = document.querySelector("#crystal");
    let crystal = dealPoscarStr(poscarStr, bandCutOff, atomCutoff)

    drawCrystalInfo(canvasCrystal, crystal.composition)
    drawCrystal(canvasCrystal, crystal)
}


export { main }