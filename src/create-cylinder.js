function getCircleCoordinates(center, normalVector, radius, subdivisions) {
    // 计算法向量和圆心坐标
    let n = normalVector;
    let c = center;

    // 计算圆的参数化方程中的参数 theta
    let theta = [];
    for (let i = 0; i <= subdivisions; i++) {
        theta.push((2 * Math.PI / subdivisions) * i);
    }

    // 计算 a 向量
    let a = [0, 0, 0];
    a[0] = n[1];
    a[1] = -n[0];
    a[2] = 0;
    if (a.every(element => element === 0)) {
        a[0] = -n[2];
        a[2] = n[0];
    }

    // 计算 b 向量
    let b = [0, 0, 0];
    b[0] = n[1] * a[2] - n[2] * a[1];
    b[1] = n[2] * a[0] - n[0] * a[2];
    b[2] = n[0] * a[1] - n[1] * a[0];

    // 单位化向量 a 和 b
    let norm_a = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    let norm_b = Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2]);
    a = [a[0] / norm_a, a[1] / norm_a, a[2] / norm_a];
    b = [b[0] / norm_b, b[1] / norm_b, b[2] / norm_b];

    // 计算圆上各点的坐标
    let points = [];
    for (let i = 0; i < theta.length; i++) {
        let x = c[0] + radius * a[0] * Math.cos(theta[i]) + radius * b[0] * Math.sin(theta[i]);
        let y = c[1] + radius * a[1] * Math.cos(theta[i]) + radius * b[1] * Math.sin(theta[i]);
        let z = c[2] + radius * a[2] * Math.cos(theta[i]) + radius * b[2] * Math.sin(theta[i]);
        points.push([x, y, z]);
    }

    return points;
}


function createCylinderVertices(centerA, centerB, radius, subdivisions) {
    let normalVector = [centerA[0] - centerB[0], centerA[1] - centerB[1], centerA[2] - centerB[2]];
  
    let verticesA = getCircleCoordinates(centerA, normalVector, radius, subdivisions);
    let verticesB = getCircleCoordinates(centerB, normalVector, radius, subdivisions);

    let cylinderVertices = [];
    let textureCoordinates = [];
    let normals = [];
  
    // 生成侧面顶点和法向量
    for (let i = 0; i < verticesA.length-1; i++) {
        let vertex1 = verticesA[i];
        let vertex2 = verticesA[i + 1];
        let vertex3 = verticesB[i];
        let vertex4 = verticesB[i + 1];
        // 侧面三角形1
        cylinderVertices.push(
            vertex1[0], vertex1[1], vertex1[2],
            vertex2[0], vertex2[1], vertex2[2], 
            vertex3[0], vertex3[1], vertex3[2]
        );
    
        // 计算侧面三角形1的法向量
        let v1 = [vertex2[0] - vertex1[0], vertex2[1] - vertex1[1], vertex2[2] - vertex1[2]];
        let v2 = [vertex3[0] - vertex2[0], vertex2[1] - vertex1[1], vertex3[2] - vertex2[2]];
        let normal1 = [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]
        ];
        normals.push(
            normal1[0], normal1[1], normal1[2],
            normal1[0], normal1[1], normal1[2],
            normal1[0], normal1[1], normal1[2],
        );
    
        // 侧面三角形2
        cylinderVertices.push(
            vertex2[0], vertex2[1], vertex2[2],
            vertex4[0], vertex4[1], vertex4[2], 
            vertex3[0], vertex3[1], vertex3[2], 
        );
    
        // 计算侧面三角形2的法向量
        let v3 = [vertex4[0] - vertex2[0], vertex4[1] - vertex2[1], vertex4[2] - vertex2[2]];
        let normal2 = [
            v2[1] * v3[2] - v2[2] * v3[1],
            v2[2] * v3[0] - v2[0] * v3[2],
            v2[0] * v3[1] - v2[1] * v3[0]
        ];
        normals.push(
            normal2[0], normal2[1], normal2[2],
            normal2[0], normal2[1], normal2[2],
            normal2[0], normal2[1], normal2[2],
        );
    
        // 计算纹理坐标
        let s1 = i / subdivisions; // 归一化的角度，对应纹理坐标的 s 分量
        let s2 = (i + 1) / subdivisions;
    
        textureCoordinates.push(
            s1, 0,
            s2, 0,
            s1, 1
        );
    
        textureCoordinates.push(
            s2, 0,
            s2, 1,
            s1, 1
        );
    }
  
    return {
        position: new Float32Array(cylinderVertices),
        texcoord: new Float32Array(textureCoordinates),
        normals: new Float32Array(normals),
    };
}


export {createCylinderVertices}