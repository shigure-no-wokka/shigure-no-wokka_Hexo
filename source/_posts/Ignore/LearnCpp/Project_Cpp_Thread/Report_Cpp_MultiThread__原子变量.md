---
title: Cpp 多线程：原子变量
date: 2024-04-15 19:53:46
description: C++ 多线程
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 多线程
  - Cpp
---
# 基本概念

原子变量，一种多线程编程中的同步机制。能够保证对原子变量的操作是原子性的，不会被其他线程打断。

**可以指定不同的内存序（memory orders）来控制对其他非原子变量的访问顺序和可见性，从而实现线程安全**

参考链接：https://zhuanlan.zhihu.com/p/599202353


