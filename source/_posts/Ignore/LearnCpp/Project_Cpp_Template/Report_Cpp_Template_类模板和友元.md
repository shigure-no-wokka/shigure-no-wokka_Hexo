---
title: Cpp 模板：类模板和友元
date: 2024-04-26 20:14:30
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

# 类模板和友元

友元本身不属于类模板

- 如果一个类模板包含一个（非模板）友元，则这个友元可以访问所有模板实例
- 如果友元是模板，那么可以自行设定类的授权给全部的友元模板实例，还是指定某些特定的友元模板实例

如果，**这个友元模板就是类模板自己，那么就表示这个类模板的全部实例之间，互为友元**

```cpp
template<typename T>
class TestClass
{
    template<typename OtherT>
    friend class TestClass;
};
```