---
title: UE 大世界 寻路
date: 2024-09-08 21:37:22
description: 如何在大世界中实现寻路
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: Engine
tags:
  - UnrealEngine
  - LargeWorld
  - Navigation
---

当大世界项目中的场景过大时，地图资源往往不能全部加载，NavMesh 也是同理，因此就需要选择一种适合大世界的寻路方法。

在大世界中实现寻路的关键在于：
- 局部 NavMesh 加载：通过动态生成和流式加载来减少内存消耗。
- 区域分块：结合 Level Streaming 或 World Partition 实现大地图的分块加载。
- 远程路径规划与局部修正：长距离寻路时结合远程路径规划和局部详细路径修正。
- 异步寻路：在后台线程进行路径计算，避免卡顿。
- 路径缓存：缓存计算好的路径，避免重复计算。

<!--more-->

针对这种情况，通常会采用局部加载、动态生成或分块加载等方法来实现有效的寻路。具体到 Unreal Engine（UE），可以使用 Streaming Levels、NavMesh Streaming、Recast 等功能来实现动态和高效的寻路解决方案。

## 局部 NavMesh 加载（NavMesh Streaming）

UE 提供了一个 NavMesh Streaming 的功能，通过动态加载和卸载部分区域的导航网格。这种方式可以让引擎根据玩家的当前位置和可见区域，逐步生成和加载附近的 NavMesh，而不是一次性加载整个地图的导航数据。

关键点：
- 动态生成：根据玩家的活动范围或需求，生成当前附近的 NavMesh。
- 分块生成：大地图会被划分成多个导航网格块，只有玩家附近的网格会被加载和使用。
- 流式加载：当玩家接近一个新的区域时，系统会自动加载对应区域的 NavMesh，而远离的区域会被卸载，减少内存占用。

如何使用：
- 导航网格生成器：UE 使用 Recast 作为默认的导航网格生成器，它支持将导航网格划分为小块并根据需求进行流式加载。确保在 NavMesh 的项目设置中启用了动态生成。
- 使用 Navigation Invokers：UE 的 Navigation Invokers 允许系统根据指定的角色或物体位置动态生成导航网格。

示例：启用 NavMesh Streaming
- 在项目设置中，启用动态导航网格生成：
  - 打开 Edit -> Project Settings -> Navigation Mesh。
  - 勾选 Allow Dynamic Navigation Building，以确保动态构建导航网格。
- 使用 Navigation Invokers：
  - 在角色类中启用 Navigation Invoker 组件。这样，角色周围的一部分地图会动态生成 NavMesh。

```cpp
AMyCharacter::AMyCharacter()
{
    // 启用 Navigation Invoker
    bUseNavigationInvoker = true;
}
```

也可以通过蓝图组件来启用 Navigation Invoker。

## 区域分块（World Partitioning 或 Level Streaming）

UE 支持 World Partitioning 或 Level Streaming，将大地图分成多个独立的子关卡或分块，根据玩家的位置加载对应的区域和 NavMesh。这种方式特别适合大地图或开放世界游戏，因为可以按需加载特定区域的数据。

关键点：
- Level Streaming：将整个地图分为多个子关卡（Streaming Levels），根据玩家的移动和相机范围动态加载和卸载这些子关卡及其 NavMesh。
- World Partition：UE5 提供的更现代化的大世界支持系统，它能够根据玩家位置自动加载和卸载地图的部分块，包括导航网格。

如何实现：
- Streaming Levels：
  - 在 UE 中将地图分成多个子关卡。
为每个子关卡设置 Streaming Volume 或动态触发条件，只有当玩家接近时才加载对应关卡的 NavMesh。
  - 在关卡设计中可以启用 Navigation Mesh 生成，使每个子关卡可以拥有自己独立的导航网格。
- World Partition（UE5 中使用）：
  - 启用 World Partition，地图会自动划分为多个块，并根据需要加载其中的部分。
  - World Partition 会根据玩家的移动来动态加载和卸载这些块，包括导航网格数据。

## 远程路径规划与局部路径修正

对于大世界中的长距离寻路，通常会结合远程路径规划和局部路径修正。这种方式将寻路分为两步：首先计算长距离的目标路径，然后在局部区域内动态生成详细的路径。

步骤：
- 远程路径规划：在全局或大范围内进行路径规划，可以使用低精度的路径点（关键节点）来规划大概的路径。这部分不依赖局部的 NavMesh 生成，而是基于地图中的某些关键节点进行长距离路径计算。
- 局部路径修正：当玩家或 AI 接近某个区域时，基于当前的 NavMesh 生成局部详细的路径，并对远程路径进行修正。局部路径可以通过动态加载的 NavMesh 来进行规划。

示例：
```cpp
void AMyAIController::CalculatePath(FVector TargetLocation)
{
    // 1. 远程路径规划：寻找关键节点进行大概的路径规划
    TArray<FVector> PathPoints = GetGlobalPathPoints(TargetLocation);
    
    // 2. 局部路径修正：在局部动态生成的 NavMesh 上进行详细寻路
    UNavigationSystemV1* NavSys = UNavigationSystemV1::GetCurrent(GetWorld());
    if (NavSys)
    {
        FNavLocation NavLocation;
        if (NavSys->ProjectPointToNavigation(TargetLocation, NavLocation))
        {
            // 使用局部 NavMesh 计算详细路径
            FPathFindingQuery Query;
            NavSys->FindPathSync(Query);
        }
    }
}
```

## 异步寻路（Async Pathfinding）

UE 支持异步寻路计算，尤其在大地图中，寻路操作可能会较为耗时，使用异步计算可以避免主线程的卡顿。你可以在后台线程处理寻路请求，并在完成后返回结果。

示例：异步寻路
```cpp
void AMyAIController::RequestAsyncPathfinding(FVector Destination)
{
    FNavPathSharedPtr Path;
    FPathFindingQuery Query(this, *GetNavData(), GetPawn()->GetActorLocation(), Destination);
    
    UNavigationSystemV1::GetCurrent(GetWorld())->FindPathAsync(
        EPathFindingMode::Hierarchical,
        Query,
        FNavPathQueryDelegate::CreateUObject(this, &AMyAIController::OnPathFound)
    );
}

void AMyAIController::OnPathFound(uint32 RequestID, ENavigationQueryResult::Type ResultType, FNavPathSharedPtr Path)
{
    if (ResultType == ENavigationQueryResult::Success && Path.IsValid())
    {
        // 处理成功寻路的路径
    }
}
```

## 避免重新计算路径（路径缓存）

为了避免频繁的路径计算，你可以对已经计算好的路径进行缓存，并根据玩家或 AI 的位置更新路径的一部分，而不是每次都从头计算全局路径。这种方式特别适用于大世界中的 AI 角色。


