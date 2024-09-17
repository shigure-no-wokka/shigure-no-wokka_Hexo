---
title: Cpp 模板：模板类型别名
date: 2024-04-26 20:12:00
description: C++ 模板学习
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 模板
  - Cpp
---

类模板实例化后定义了一个特定的类类型，因此可以使用`typedef`来引用实例化的类：

```cpp
typedef MyClass<int> IntMyClass;
```

`typedef`无法引用模板，因为模板并不是一个类型，即`typedef MyClass<T> TemplateMyClass;`是不允许的

但是可以这样，**给类模板定义一个类型别名**

```cpp
template<typename T> using twin = pair<T, T>;
twin<int> test; // 这样 test 就是一个 pair<int ,int>类型的对象
```




