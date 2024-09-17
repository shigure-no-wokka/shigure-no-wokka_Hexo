---
title: UE 基础：性能分析基础
date: 2024-05-08 23:31
description: 
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---

# 方法一：Stat

在编辑器界面的游戏窗口内，常用两个：FPS 和 Unit

![Stat-Engine-FPS_And_Unit](UE_Base_性能分析基础/stat_fps_and_unit.png)

显示效果：

![](UE_Base_性能分析基础/show_fps_unit.png)

前者显示 FPS，后者显示游戏线程、渲染线程和 GPU 的帧速率，以及 DrawCall 和 Primitive 数量

如果在编辑器中运行游戏，可以通过命令行输入 `stat unit` 或者 `stat fps` 开启：

![](UE_Base_性能分析基础/command_line_in_game.png)


---
# 方法二：GPU Profile

快捷键：`ctrl + shift + .`

![](UE_Base_性能分析基础/gpu_profile.png)

引擎中可以打开这里进行设置：

![](UE_Base_性能分析基础/setting.png)


---
# 方法三：Unreal Insight

路径一般在：`\Engine\Binaries\Win64`

![UnrealInsights](UE_Base_性能分析基础/UnrealInsights.png)

注：
- UnrealInsight 对内存要求比较高
- 以及其生成的 log 文件可能比较大

也可以检测内存泄漏问题

---
# 参考链接
- [【UE5】10 分钟学会 UE5 性能分析，让你的游戏帧数起飞\_哔哩哔哩\_bilibili](https://www.bilibili.com/video/BV18C4y1A7Np?vd_source=4ca316b11bb8c03c238d1da54c1ba5f0)
- [Unreal Insights | Unreal Engine 4.27 Documentation](https://docs.unrealengine.com/4.27/en-US/TestingAndOptimization/PerformanceAndProfiling/UnrealInsights/)
