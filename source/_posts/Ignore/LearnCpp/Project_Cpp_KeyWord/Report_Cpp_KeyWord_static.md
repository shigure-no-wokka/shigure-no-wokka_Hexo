---
title: Cpp 关键字：static
date: 2024-05-02 09:28:59
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 关键字
  - Cpp
---

- static 的第一种含义：修饰**全局变量**时，表明一个全局变量**只对定义在同一文件中的函数可见**。
- static 的第二种含义：修饰**局部变量**时，表明该变量的值**不会因为函数终止而丢失**。
- static 的第三种含义：修饰函数时，表明该**函数只在同一文件中调用**。
- static 的第四种含义：修饰**类的数据成员**，表明对该类所有对象**这个数据成员都只有一个实例**，即该实例归所有对象共有
- static 的第五种含义：用 static 修饰不访问非静态数据成员的类成员函数。这意味着一个静态成员函数只能访问它的参数、类的静态数据成员和全局变量
  - 不能对 static 成员函数加 const：对成员函数中使用关键字 const 是表明：函数不会修改该函数访问的目标对象的数据成员。既然一个静态成员函数根本不访问非静态数据成员，那么就没必要使用 const 了