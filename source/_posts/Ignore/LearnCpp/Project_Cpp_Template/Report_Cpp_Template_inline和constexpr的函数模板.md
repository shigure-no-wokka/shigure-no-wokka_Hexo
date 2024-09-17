---
title: C++ 模板：inline 和 constexpr 的函数模板
date: 2024-04-26 20:04:59
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

函数模板可以声明为 inline 或 constexpr，方式如下：

```cpp
template<typename T>
inline T GetMin(const T&, const T&);
```

即，inline 或 constexpr 要放在模板参数之后，返回值类型之前

