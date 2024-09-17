---
title: UE 基础：枚举和结构体
date: 2024-04-30 18:34:27
description: UENUM() 和 USTRUCT()
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---

---
# 枚举

```cpp
UENUM(BlueprintType)
enum class ECharacterState
{
    IDLE,
    WALK,
    RUN,
    ATTACK,
    ATTACK_HIT,
    ATTACK_MISS,
    BEING_HITTED,
    DEAD
};
```

使用`ENUM()`修饰，利用`BlueprintType`暴露给蓝图，也可以不加`ENUM()`修饰，创建原生枚举

```cpp
UPROPERTY(EditAnywhere,BlueprintReadWrite)
ECharacterState MyCurrentState UMETA(DisplayName = "当前状态");
```


---
# 结构体

```cpp
USTRUCT(BlueprintType)
struct FItemInfo
{
    GENERATED_BODY()
public:
    UPROPERTY()
    FName Name;
    UPROPERTY()
    int Price;
};
```

和枚举同理，`USTRUCT()`修饰，`BlueprintType`暴露给蓝图。和`UCLASS()`一样，要在结构体中使用`GENERATED_BODY()`宏标记，属性`UPROPERTY()`和`UCLASS()`中使用方式相同。





---
# 参考链接
- [【UE4 C++ 基础知识】<4> 枚举 Enum、结构体 Struct](https://www.cnblogs.com/shiroe/p/14691171.html)

