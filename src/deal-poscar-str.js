let matrixRotation = [
    [1, 0, 0], 
    [0, 1, 0],
    [0, 0, -1]
]

function dealPoscarStr(poscarStr) {
    let crystalSite = {};
    let poscarStrList = poscarStr.split("\n");
    let composition = getCompositionByString(poscarStrList[5], poscarStrList[6]);
    // 获得晶体结构的基矢
    crystalSite.baseVector = [getNumListByString(poscarStrList[2]),
                              getNumListByString(poscarStrList[3]),
                              getNumListByString(poscarStrList[4])];
    
    // 从 poscar 文件的第八行开始读取周期性位点坐标
    let readLine = 8;

    // 获得笛卡尔坐标位点并将结构中心平移到原点
    let matrixFractionalCoordinateSite = []
    let totalSiteNums = composition[1].reduce((total, current) => total + current, readLine);
    for ( readLine; readLine<totalSiteNums; readLine++ ) {
        // 获得分数位点坐标并平移
        let sitePosition = getNumListByString(poscarStrList[readLine]).map((axis) => axis-0.5)
        matrixFractionalCoordinateSite.push(sitePosition);
    }
    // 分数坐标转换为笛卡尔坐标
    let matrixCartesianCoordinateSites = getCartesianCoordinateSite(
        matrixFractionalCoordinateSite,
        crystalSite.baseVector
    );
    
    // 使用笛卡尔位点坐标计算位点间的成键
    let bondingList = []
    let cutoff = 2.8
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
    matrixCartesianCoordinateSites = getCartesianCoordinateSite(
        matrixCartesianCoordinateSites,
        [[400, 0, 0], [0, 400, 0], [0, 0, 400]]
    );
    matrixCartesianCoordinateSites = getCartesianCoordinateSite(matrixCartesianCoordinateSites, matrixRotation)

    // 通过成键列表生成晶体的化学键属性
    let atomicBonding = []
    for ( let bondingNum=0; bondingNum<bondingList.length; bondingNum++) {
        atomicBonding.push([matrixCartesianCoordinateSites[bondingList[bondingNum][0]],
                            matrixCartesianCoordinateSites[bondingList[bondingNum][1]]])
    }
    crystalSite.atomicBonding = atomicBonding;

    // 生成晶体结构对象的位点坐标属性
    let elementTypeCount = 0;
    let siteLineCount = 0;
    crystalSite.periodicSite = [];
    while ( elementTypeCount < composition[0].length ) {
        let lineElement = composition[0][elementTypeCount];
        for ( let i=0; i < composition[1][elementTypeCount]; i++ ) {
            let Site = {};
            Site.position = matrixCartesianCoordinateSites[siteLineCount];
            Site.elementType = elementInfo[lineElement];
            crystalSite.periodicSite.push(Site);
            siteLineCount++;
        }
        elementTypeCount++;
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

function getCartesianCoordinateSite(matrixFractionalCoordinateSite, matrixBaseVector) {
    /*使用矩阵乘法将分数坐标转换为笛卡尔坐标*/
    let matrixCartesianCoordinateSites = [];
    for (let i = 0; i < matrixFractionalCoordinateSite.length; i++) {
        let ansRow = [];
        for (let j = 0; j < matrixBaseVector[0].length; j++) {
            let sumEle = 0;
            for (let k = 0; k < matrixFractionalCoordinateSite[i].length; k++) {
                sumEle += matrixFractionalCoordinateSite[i][k] * matrixBaseVector[k][j];
            }
            ansRow.push(sumEle);
        }
        matrixCartesianCoordinateSites.push(ansRow);
    }
    return matrixCartesianCoordinateSites;
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


export {dealPoscarStr}