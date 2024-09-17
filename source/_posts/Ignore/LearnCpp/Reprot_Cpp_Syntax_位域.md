---
title: Cpp 语法：位域
date: 2024-05-03 17:30:08
description: C++ 语法
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 位域
  - Cpp
---

位域（bit field）：位域允许你在一个整数类型中定义多个变量，并指定每个变量占用的位数，通常用于节省内存空间或者对硬件寄存器进行位级别的访问

```cpp
struct Flags {
    bool a : 1; // 占用一个位，用于表示布尔值
    int b : 5;  // 占用五个位，用于表示整数值（-16 到 15）
    int c : 6;  // 占用六个位，用于表示整数值（-32 到 31）
};
```

Flags 结构体中的 a 成员变量占用一个位，b 成员变量占用五个位，c 成员变量占用六个位。这样定义的好处是可以节省内存空间，因为每个成员变量占用的位数是固定的。
