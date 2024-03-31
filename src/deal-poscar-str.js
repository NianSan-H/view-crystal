let matrixRotation = [
    [1, 0, 0], 
    [0, 1, 0],
    [0, 0, -1]
]

// 使用分数坐标确定晶格的 8 个顶点
let unitCellVertices = [
    // 下底面 4 点
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [1, 1, 0],

    // // 上顶面 4 点
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1], 
    [1, 1, 1],
]

// 连接 8 个顶点坐标形成晶格形成 12 条边
const unitCellVerticesLink = [
    // 下底面 4 边
    [0, 1], [0, 2], [1, 3], [2, 3], 

    // 上顶面 4 边
    [4, 5], [4, 6], [5, 7], [6, 7],

    // 连接顶面与底面 4 边
    [0, 4], [1, 5], [2, 6], [3, 7]
]


function dealPoscarStr(poscarStr, cutoff = 3.) {
    let crystalSite = {};
    let poscarStrList = poscarStr.split("\n");
    let composition = getCompositionByString(poscarStrList[5], poscarStrList[6]);
    // 获得晶体结构的基矢
    crystalSite.baseVector = [getNumListByString(poscarStrList[2]),
                              getNumListByString(poscarStrList[3]),
                              getNumListByString(poscarStrList[4])];
    
    // 根据基矢生成 unit cell
    unitCellVertices = translateCoordinates(unitCellVertices, 0.5)
    let unitCellCoordinateVertices = matrixMultiply(unitCellVertices, crystalSite.baseVector)
    unitCellCoordinateVertices = matrixMultiply(unitCellCoordinateVertices,[[400, 0, 0], [0, 400, 0], [0, 0, 400]]);
    unitCellCoordinateVertices = matrixMultiply(unitCellCoordinateVertices, matrixRotation)
    crystalSite.unitCell = []
    for ( let ii=0; ii<unitCellVerticesLink.length; ii++ ) {
        let edge = unitCellVerticesLink[ii]
        crystalSite.unitCell.push([unitCellCoordinateVertices[edge[0]], unitCellCoordinateVertices[edge[1]]])
    }

    // 从 poscar 文件的第八行开始读取周期性位点坐标
    let readLine = 8;

    // 获得笛卡尔坐标位点并将结构中心平移到原点
    let matrixFractionalCoordinateSite = []
    let totalSiteNums = composition[1].reduce((total, current) => total + current, readLine);
    for ( readLine; readLine<totalSiteNums; readLine++ ) {
        // 获得分数位点坐标并平移
        let sitePosition = getNumListByString(poscarStrList[readLine])
        matrixFractionalCoordinateSite.push([sitePosition[0], sitePosition[1], sitePosition[2]]);
    }

    let elements = composition[0];
    let counts = composition[1];
    let repeatedElements = counts.flatMap((count, index) => Array(count).fill(elements[index]));
    
    [matrixFractionalCoordinateSite, repeatedElements] = 
                fillCrystalSite(matrixFractionalCoordinateSite, repeatedElements, 0.3)
    console.log(matrixFractionalCoordinateSite)
    matrixFractionalCoordinateSite = translateCoordinates(matrixFractionalCoordinateSite, 0.5)

    // 分数坐标转换为笛卡尔坐标
    let matrixCartesianCoordinateSites = matrixMultiply(
        matrixFractionalCoordinateSite,
        crystalSite.baseVector
    );
    
    // 使用笛卡尔位点坐标计算位点间的成键
    let bondingList = [];
    for ( let siteANum=0; siteANum < matrixCartesianCoordinateSites.length-1; siteANum++) {
        let siteA = matrixCartesianCoordinateSites[siteANum];
        for ( let siteBNum=siteANum + 1; siteBNum < matrixCartesianCoordinateSites.length; siteBNum++) {
            let siteB = matrixCartesianCoordinateSites[siteBNum];
            if (checkBonding(siteA, siteB, cutoff)) {
                bondingList.push([siteANum, siteBNum])
            }
        }
    }
    
    // 对笛卡尔位点坐标进行放大
    matrixCartesianCoordinateSites = matrixMultiply(
        matrixCartesianCoordinateSites,
        [[400, 0, 0], [0, 400, 0], [0, 0, 400]]
    );
    matrixCartesianCoordinateSites = matrixMultiply(matrixCartesianCoordinateSites, matrixRotation)

    // 通过成键列表生成晶体的化学键属性
    let atomicBonding = []
    for ( let bondingNum=0; bondingNum<bondingList.length; bondingNum++) {
        atomicBonding.push([matrixCartesianCoordinateSites[bondingList[bondingNum][0]],
                            matrixCartesianCoordinateSites[bondingList[bondingNum][1]]])
    }
    crystalSite.atomicBonding = atomicBonding;

    // 生成晶体结构对象的位点坐标属性
    crystalSite.periodicSite = [];
    for ( let ii=0; ii<repeatedElements.length; ii++ ) {
        let Site = {};
        Site.position = matrixCartesianCoordinateSites[ii];
        Site.elementType = elementInfo[repeatedElements[ii]];
        crystalSite.periodicSite.push(Site)
    }
    return crystalSite
}


function getNumListByString(str) {
    return str.split(/\s+/).map(parseFloat).splice(1)
}

function getCompositionByString(strEle, strCount) {
    let elements = strEle.match(/[A-Z][a-z]*/g);
    let counts = strCount.match(/\d+/g).map(numStr => parseInt(numStr));
    return [elements, counts] 
}

function matrixMultiply(matrixA, matrixB) {
    /*使用矩阵乘法将分数坐标转换为笛卡尔坐标*/
    let matrixProduct = [];
    for (let i = 0; i < matrixA.length; i++) {
        let ansRow = [];
        for (let j = 0; j < matrixB[0].length; j++) {
            let sumEle = 0;
            for (let k = 0; k < matrixA[i].length; k++) {
                sumEle += matrixA[i][k] * matrixB[k][j];
            }
            ansRow.push(sumEle);
        }
        matrixProduct.push(ansRow);
    }
    return matrixProduct;
}

function translateCoordinates(array, translation) {
    return array.map(subArray => subArray.map(axis => axis - translation));
}

function checkBonding(siteA, siteB, cutoff=3) {
    /* 根据位点坐标及截断半径检查位点间是否成键 */
    let distance = getDistance(siteA, siteB);
    if ( distance <= cutoff ) {
        return true
    }
    return false
}

function getDistance(siteA, siteB) {
    return Math.sqrt((siteA[0] - siteB[0]) * (siteA[0] - siteB[0]) + 
                     (siteA[1] - siteB[1]) * (siteA[1] - siteB[1]) + 
                     (siteA[2] - siteB[2]) * (siteA[2] - siteB[2]))
}

function boundaryJudgment(pos, threshold) {
    if ( pos < threshold ) {
        return [pos, pos+1]
    } else if ( pos > 1 - threshold ) {
        return [pos, pos-1]
    } else {
        return [pos]
    }
}

function fillCrystalSite(primordialCellSiteList, elementList, threshold) {
    let fillPrimordialCellSiteList = []
    let fillElementList = []

    for (let ii = 0; ii < primordialCellSiteList.length; ii++) {
        let currentSite = primordialCellSiteList[ii];
        let currentElement = elementList[ii];

        let x = boundaryJudgment(currentSite[0], threshold);
        let y = boundaryJudgment(currentSite[1], threshold);
        let z = boundaryJudgment(currentSite[2], threshold);

        let atomPosList = [];
        for (let newX of x) {
            for (let newY of y) {
                for (let newZ of z) {
                    atomPosList.push([newX, newY, newZ]);
                }
            }
        }

        for (let ii = 0; ii < atomPosList.length; ii++) {
            fillPrimordialCellSiteList.push(atomPosList[ii]);
            fillElementList.push(currentElement);
        }
    }

    return [fillPrimordialCellSiteList, fillElementList]
}



import { elementInfo } from "./element-info.js";

export { dealPoscarStr }