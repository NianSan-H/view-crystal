# WebGL 实现可视化晶体结构
本仓库使用 WebGL 实现了晶体结构的可视化，可视化程序需嵌入前端网页应用，虽然也有其它的网页应用实现了晶体结构可视化如 [Jmol](https://jmol.sourceforge.net/ 'https://jmol.sourceforge.net/')，但是使用起来都挺复杂（我不会用），因此我自己使用 WebGL 实现了一个，没有附加功能，但基本能实现晶体结构的可视化（勉强够用）。

参考资料：
+ [WebGL 官方教程](https://webgl2fundamentals.org/webgl/lessons/zh_cn/webgl-fundamentals.html)
+ [场景图绘制参考](https://webgl2fundamentals.org/webgl/lessons/zh_cn/webgl-scene-graph.html)


## 使用的外部模块
仓库使用的外部模块均参考自 WebGL 官方文档教程，以下说明使用这些模块做了什么：
+ twgl：https://twgljs.org/
    + 生成球的顶点坐标及纹理
    + 快速方便的将属性及变量绑定到缓冲区
+ m4：一个三维数学库，实现对晶体结构的旋转平移及放大操作

## Usage
