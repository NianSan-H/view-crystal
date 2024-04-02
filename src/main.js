import { dealPoscarStr } from "./deal-poscar-str.js";
import { drawCrystal } from "./draw-crystal.js"

let bandCutOff = 2.8;
let atomCutoff = 0.3;

function main(poscarStr) {
  let canvas = document.querySelector("#crystal");
  let crystal = dealPoscarStr(poscarStr, bandCutOff, atomCutoff)
  drawCrystal(canvas, crystal)
}

export { main }