---
title: Cpp 面经整理
date: 2024-08-16 23:51
description: 一些遇到的或网上搜集的 C++ 面经
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - Cpp
---

# 虚函数表指针和虚函数表的创建时机

- **虚函数表指针**：虚表指针跟随对象创建，位于对象内存的最前端
- **虚函数表**：在编译期间确定，其记录的虚函数地址也是编译期间确定的，虚表属于类，被该类的所有对象共享


