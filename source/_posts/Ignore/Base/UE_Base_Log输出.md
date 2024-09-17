---
title: UE 基础：Log 输出
date: 2024-04-27 12:54:14
description: 写 UE 项目时候的一些笔记
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---

# UE_LOG

## 使用方式

```cpp
UE_LOG(YourLogName, Warning, TEXT("Problem on load Province Message!"));
```

## DECLARE_LOG_CATEGORY_EXTERN 声明自定义的 Log 标签

在.h 文件中，填写如下代码：

```cpp
DECLARE_LOG_CATEGORY_EXTERN(YourLogName, Log, All);
```

在.cpp 文件中，填写如下代码：

```cpp
DEFINE_LOG_CATEGORY(YourLogName);
```

输出格式如下：

（1）`UE_LOG(YourLogName, Warning, TEXT("Problem on load Province Message!"));`

（2）`UE_LOG(YourLogName, Warning, TEXT("Content:%s"), *(Response->GetContentAsString()));`

## 颜色设置

```cpp
//"this is Grey Text"
UE_LOG(YourLog, Log, TEXT("This is grey text!"));
//"this is Yellow Text"
UE_LOG(YourLog, Warning, TEXT("This is yellow text!"));
//"This is Red Text"
UE_LOG(YourLog, Error, TEXT("This is red text!"));
```


