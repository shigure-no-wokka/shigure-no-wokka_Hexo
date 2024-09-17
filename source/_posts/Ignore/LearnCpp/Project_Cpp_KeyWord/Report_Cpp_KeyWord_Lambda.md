---
title: Cpp 关键字：Lambda
date: 2024-05-03 11:04:08
description: C++ 关键字
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_code.jpg
categories: Code
tags:
  - 关键字
  - Cpp
---

常见形式：
```cpp
[captures] (params) { body }

// UE 中将渲染命令发送给渲染线程
ENQUEUE_RENDER_COMMAND(FTestCmd)([](FRHICommandList& RHICmdList)->void
{
    UE_LOG(LogTmp, Log, TEXT("Render Thread"));
});
```

> 在 UE 中主要适用于给渲染线程塞渲染命令




