import { createCylinderVertices } from "./create-cylinder.js"

let vs = `#version 300 es
in vec4 a_position;
in vec4 a_color;
in vec3 a_normal;

uniform mat4 u_matrix;
uniform vec3 u_lightDirection;

out vec4 v_color;
out float v_lightWeight;

void main() {
    vec3 normal = normalize((u_matrix * vec4(a_normal, 0.0)).xyz);
    float nDotL = max(dot(normal, normalize(u_lightDirection)), 0.0);
    v_lightWeight = nDotL;

    gl_Position = u_matrix * a_position;
    v_color = a_color;
}`;

let fs = `#version 300 es
precision highp float;

in float v_lightWeight;
in vec4 v_color;

uniform vec4 u_pureColor;
uniform vec3 u_lightColor;

out vec4 outColor;

void main() {
    vec3 ambientComponent = vec3(0.25, 0.25, 0.25);
    vec3 lightEffect = u_lightColor * v_lightWeight;
    vec3 color = (u_pureColor.rgb * lightEffect) + ambientComponent;
    float alpha = u_pureColor.a;

    outColor = vec4(color, alpha);
}`;

let Node = function () {
  this.children = [];
  this.localMatrix = m4.identity();
  this.worldMatrix = m4.identity();
};

Node.prototype.setParent = function (parent) {
  if (this.parent) {
    let ndx = this.parent.children.indexOf(this);
    if (ndx >= 0) {
      this.parent.children.splice(ndx, 1);
    }
  }

  if (parent) {
    parent.children.push(this);
  }
  this.parent = parent;
};

Node.prototype.updateWorldMatrix = function (matrix) {
  if (matrix) {
    m4.multiply(matrix, this.localMatrix, this.worldMatrix);
  } else {
    m4.copy(this.localMatrix, this.worldMatrix);
  }

  let worldMatrix = this.worldMatrix;
  this.children.forEach(function (child) {
    child.updateWorldMatrix(worldMatrix);
  });
};

function main(crystal) {
  let canvas = document.querySelector("#crystal");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  let distance = 200 * Math.sqrt(crystal.baseVector.reduce((sum, vector) => {
    return sum + vector.map(component => component ** 2).reduce((acc, val) => acc + val, 0);
  }, 0));
  let positions = crystal.periodicSite;
  let bonding = crystal.atomicBonding;

  twgl.setAttributePrefix("a_");

  let objectsToDraw = [];
  let objects = [];

  let crystalSystemNode = new Node();
  let lightDirection = [0, 0, -1];
  let sphereVertices = twgl.primitives.createSphereVertices(15, 200, 200);
  let sphereBufferInfo = twgl.createBufferInfoFromArrays(gl, sphereVertices);
  let programInfo = twgl.createProgramInfo(gl, [vs, fs]);
  let sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo);

  // 绘制各位点原子
  for (let ii = 0; ii < positions.length; ++ii) {
    let position = positions[ii].position
    let element = positions[ii].elementType

    let atomOrbitNode = new Node();
    atomOrbitNode.localMatrix = m4.translation(position[0], position[1], position[2]);

    let atomNode = new Node();
    // 设置原子的显示大小，根据原子半径进行调整
    atomNode.localMatrix = m4.scaling(element.radius, element.radius, element.radius);
    atomNode.drawInfo = {
      uniforms: {
        u_pureColor: [element.color[0], element.color[1], element.color[2], 1],
        u_lightColor: [1, 1, 1]
      },
      programInfo: programInfo,
      bufferInfo: sphereBufferInfo,
      vertexArray: sphereVAO,
    };
    atomOrbitNode.setParent(crystalSystemNode);
    atomNode.setParent(atomOrbitNode);

    objects.push(atomNode);
    objectsToDraw.push(atomNode.drawInfo);
  }

  // 绘制原子间键合
  for (let jj = 0; jj < bonding.length; jj++) {
    let cylinderVertices = createCylinderVertices(bonding[jj][0], bonding[jj][1], 30, 200);
    let cylinderBufferInfo = twgl.createBufferInfoFromArrays(gl, cylinderVertices);
    let programInfo = twgl.createProgramInfo(gl, [vs, fs]);
    let cylinderVAO = twgl.createVAOFromBufferInfo(gl, programInfo, cylinderBufferInfo);

    let bondOrbitNode = new Node();
    let bondNode = new Node();

    bondNode.drawInfo = {
      uniforms: {
        u_pureColor: [0, 0, 0, 1],
        u_lightColor: [1, 1, 1]
      },
      programInfo: programInfo,
      bufferInfo: cylinderBufferInfo,
      vertexArray: cylinderVAO,
    };
    bondOrbitNode.setParent(crystalSystemNode);
    bondNode.setParent(bondOrbitNode);

    objects.push(bondNode);
    objectsToDraw.push(bondNode.drawInfo);
  }

  let rotate = false;
  let startX, startY;
  let cameraPosition = [0, 0, 2 * distance];
  let lastUpdateTime = 0;
  let updateInterval = 50;
  drawScene();

  function drawScene(time) {
    time *= 0.001;
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('wheel', function (event) {
      let delta = event.deltaY / 3000;
      if (delta > 0) {
        cameraPosition = [cameraPosition[0], cameraPosition[1], cameraPosition[2] + delta];
      } else {
        cameraPosition = [cameraPosition[0], cameraPosition[1], cameraPosition[2] + delta];
      }
      event.preventDefault();
    });

    updataScene(cameraPosition, [0., 0.]);
    requestAnimationFrame(drawScene);
  }

  function updataScene(cameraPosition, rotationList) {
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let projectionMatrix =
      m4.perspective(Math.PI / 2, aspect, 1, 3 * distance);
    let cameraMatrix = m4.lookAt(cameraPosition, [0, 0, 0], [0, 1, 0]);

    let viewMatrix = m4.inverse(cameraMatrix);
    let viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    m4.multiply(m4.xRotation(rotationList[0]), crystalSystemNode.localMatrix, crystalSystemNode.localMatrix);
    m4.multiply(m4.yRotation(rotationList[1]), crystalSystemNode.localMatrix, crystalSystemNode.localMatrix);

    crystalSystemNode.updateWorldMatrix();

    objects.forEach(function (object) {
      object.drawInfo.uniforms.u_lightDirection = lightDirection;
      object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);
    });

    twgl.drawObjectList(gl, objectsToDraw);
  }
  // 一次性事件监听器
  function onMouseDown(event) {
    rotate = true;
    startX = event.clientX;
    startY = event.clientY;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(event) {
    let currentTime = performance.now();
    if (rotate && currentTime - lastUpdateTime > updateInterval) {
      let deltaX = event.clientX - startX;
      let deltaY = event.clientY - startY;
      updataScene(cameraPosition, [deltaY / 100, deltaX / 100]);
      lastUpdateTime = currentTime;

      startX = event.clientX;
      startY = event.clientY;
    }
  }

  function onMouseUp() {
    rotate = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }
}




export { main }
