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

## 使用方式
仓库仅提供可视化 POSCAR 形式的晶体结构。你需要提供结构的 POSCAR 字符串，这可以通过 pymatgen 获取，使用以下代码：
```python
from pymatgen.core import Strtucture

structure = Structure.from_file("./your poscar path/structure-file")
print(structure.to(fmt="poscar"))


# 你可以使用以下代码将字符串输出到 json 文件
import json

with open("./your-crystal.json", "w") as poscar:
    data = {"poscar": structure.to(fmt="poscar")}
    json.dump(data, poscar, indent=4)
```
具体的使用方式见 [index.html](./index.html)，绘制结果如下图所示：

<img src="./gen-input/Li3VS4.png#pic" alt="Li3VS4.png" style="width: 400px; height: 400px"/>

## TODO
+ 增加滑动条分别用于设置 bondCutOff 和 atomCutOff 调整成键和位点的填充。
    > 由于每次更新 bondCutOff 和 atomCutOff 都需要重新计算周期性位点及成键，这使得晶体结构需要重新渲染，滑动条实时更新显然不太现实。这里可以选择改为使用输入框绑定 bondCutOff 和 atomCutOff，随后通过按钮点击更新输入框即可。
+ 新建 canvas 用于显示原子对应的颜色。
    > 已通过使用新建 canvas 的方式完成，使用 canvas 的渐变填充模拟 3D 光照效果，勉强能凑合看，元素字体不好看，自行修改，这里需要使用盒子把 canvas 元素包裹起来，并设置布局为 grid 布局。