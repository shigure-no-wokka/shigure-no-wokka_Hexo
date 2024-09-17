---
title: UE 基础：一些常见宏
date: 2024-05-02 11:11:24
description: 
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---

# UCLASS()

UCLASS() 会生成一个 UClass 类型的对象来代表被它修饰的这个类，在这个对象中就会记录这个类中所有的反射信息，类的大小、类的方法和属性等等


# UPROPERTY()

UPROPERTY() 生成 FProperty 类型的对象，并存放在对应的 UClass 对象中

从蓝图或其他反射获取某个属性时，会传入一个字符串，在类的 UClass 对象中找到这个 UPROPERTY()，也就是生成的这个 FProperty 对象，从而可以得到这个属性在这个 UClass 所代表的类中的偏移。最后将这个 UClass 代表的类的某个对象传入，根据这个偏移从而获得对应的属性


# USTRUCT()

USTRUCT() 生成 UScriptStruct 类型的对象


