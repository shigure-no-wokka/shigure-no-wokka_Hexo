---
title: UE 基础：GetWorldTimerManager
date: 2024-05-06 17:14
description: 
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---

在 TPS 多人项目中，想要实现长按开火功能：`AActor:: GetWorldTimerManager ()`

```cpp
// 开火定时器
FTimerHandle AutoFireTimer; // 计时器句柄
UPROPERTY(EditAnywhere)
float AutoFireRate;

// 客户端输入操作
void UCombatComponent::FireButtonPressed(bool bPressed)
{
	bFireButtonPressed = bPressed;
	if (bFireButtonPressed)
	{
		Fire();
	}
	else
	{// 松开按键立刻清空计时器
		Character->GetWorldTimerManager().ClearTimer(AutoFireTimer);
	}
}

void UCombatComponent::Fire()
{
	//..
	// 第一次开火后开始计时
	StartFireTimer();
}

void UCombatComponent::StartFireTimer()
{// 开启计时器
	Character->GetWorldTimerManager().SetTimer(AutoFireTimer, this, &UCombatComponent::AutoFireReset, AutoFireRate);
}

void UCombatComponent::AutoFireReset()
{// 计时器自动调用的函数
	if (bFireButtonPressed)
	{
		Fire();
	}
}
```


---
# 参考连接

- [AActor::GetWorldTimerManager | Unreal Engine Documentation](https://docs.unrealengine.com/4.26/en-US/API/Runtime/Engine/GameFramework/AActor/GetWorldTimerManager/)
- [【UE4 C++】定时器 Timer 与事件绑定 - 砥才人 - 博客园](https://www.cnblogs.com/shiroe/p/14691257.html)