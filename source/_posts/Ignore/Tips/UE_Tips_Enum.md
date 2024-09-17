---
title: UETips：枚举值
date: 2024-08-30 17:14
description: 在 UE 中使用枚举值时遇到的一些问题总结
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---

# EObjectTypeQuery

我指定了一个 `TArray` 用来存放可攀爬的墙壁对象

```cpp
TArray<TEnumAsByte<EObjectTypeQuery>> ClimbableSurfaceTraceTypes;
```

查看 `EObjectTypeQuery` 枚举类型发现其成员为：

```cpp
/** Specifies custom collision object types, overridable per game */
UENUM(BlueprintType)
enum EObjectTypeQuery : int
{
ObjectTypeQuery1 UMETA(Hidden), 
ObjectTypeQuery2 UMETA(Hidden), 
ObjectTypeQuery3 UMETA(Hidden), 
ObjectTypeQuery4 UMETA(Hidden), 
ObjectTypeQuery5 UMETA(Hidden), 
ObjectTypeQuery6 UMETA(Hidden), 
ObjectTypeQuery7 UMETA(Hidden), 
ObjectTypeQuery8 UMETA(Hidden), 
ObjectTypeQuery9 UMETA(Hidden), 
ObjectTypeQuery10 UMETA(Hidden),
...
}
```

而我想要指定一个 `ECC_WorldStatic` 对象，需要进行一次转换

引擎内部定义了一个转换方法：`UEngineTypes::ConvertToObjectType`

```cpp
ClimbableSurfaceTraceTypes.Add(UEngineTypes::ConvertToObjectType(ECC_WorldStatic));
```

成功添加

---




