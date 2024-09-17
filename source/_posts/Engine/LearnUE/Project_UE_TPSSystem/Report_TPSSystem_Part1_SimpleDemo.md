---
title: UE TPS 系统 Part1 简易的 Demo
date: 2024-05-17 22:35
description: 初学UE时做的一个简易TPS游戏Demo
categories: Engine
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
tags:
  - UnrealEngine
  - TPS
---


本课程的结构为：
- 多人游戏插件
- 实际的游戏项目

---
# 多人游戏插件

暂略 :( 另一台电脑不在手边


---
# 项目准备

## 安装插件

## 从 Mixamo 下载免费模型和动画

网站[->](https://www.mixamo.com/#/)

T Pose 和 A Pose 的区别

（和 Mixamo 的模型重定向）重定向前手动将 UE4 的人物骨骼摆成 T Pose，upperarm_l 和 upperarm_r 上抬 45°，手臂 lowerarm_l 和 lowerarm_r 伸直 10°

UE4 中手动设置重定向

（重定向到 EpicCharacter 时也有另一个参数设置）

该 UE4 工程作为资源的中转站保存

## 创建动画实例（AnimationBlueprint）

似乎大佬们创建某个 C++ 类的子蓝图类时，都是先从原本的基类创建，然后再内部修改为 C++ 类

动画状态机中，点击转移条件，可以在右侧面板中发现`Automatic Rules Based Transition->Automatic Rule Based on Sequence Player in State`，勾选，保证前一个动画结束后就自动过渡到下一个

从 JumpStop 到 Idel，过度条件设置为`TimeRemaining(Ratio) <= 0.1`

> 刚刚设置完动画蓝图后发现角色没有根据移动速度设置动画，原因是没有热编译（注意是在 UE 这边热编译，除非大概否则 UE 这边热编译就行），编译后正常

在 C++ 中设置某些变量后（比如 ACharacter 中的 bUseControllerRotationYaw，和 CharacterMovement 中的 OrientationRotationToMovement），子蓝图在创建时会覆写在 C++ 中设置好的变量，所以注意在蓝图中重新设置一下


# 多人游戏项目

这部分主要涉及两个大方面：
- **射击游戏项目逻辑**
- **如何在 server 和 client 之间通信并同步游戏**

## TransitionLevel And Lobby

Seamless Travel, Transition level, lobby game mode

- NON-Seamless Travel
  - 客户端会从服务端 disconnect
  - 然后 reconnect 回同一个服务端
- 一般会出现在第一次加载地图的时候
- 或者是第一次假如服务器
- 或者是结束了一个多人游戏，并开始了新游戏

- Seamless Travel
  - 提高游戏体验（smoother）
  - 避免了 reconnection issues
  - `bUseSeamlessTravel = true`
  - 需要有一个过度关卡来作为 transition map
    - 任何一个地图必须要在任何给定时间内加载
    - 所以要用一个 transition map 来过度


多人游戏里的 Travel
- 服务端 UWorld::ServeTravel
  - Server Only
  - Jumps the server to a new level
  - All connected clients will follow
  - Server calls APlayController::ClientTravel
- 客户端 APlayController::ClientTravel
  - When called from a client: travel to new server, need server address
  - When called from a server: makes the player travel to a new map

## NetWork Role

三种角色：
- 本地客户端角色
- 服务端的 copy 一份
- 其他客户端 copy 一份

需要分清楚要处理哪一个

使用 ENetRole 来区分
- ENetRole::ROLE_Authority：一般是服务器上的角色作为权威角色
- ENetRole::ROLE_SimulatedProxy：指那些非本机器控制的角色
- ENetRole::ROLE_AutonomousProxy：自己控制的

`APawn::GetLocalRole()` 和 `APawn::GetRemoteRole()` 两者的区别，可以用来判断目前处于什么机器上（服务端还是客户端）

## 在 server 上进行权威性的检测：以 PickupWidget 为例

服务端与武器接触会正常在服务器端显示 widget，但当客户端角色与武器重合却不会在客户端显示，而在服务器端上显示。

因为在实现中，这里设置成了**只有角色拥有 Authority 的时候才会启动碰撞检测，也就是只在服务端检测重叠**

```cpp
if (HasAuthority()) // GetLocalRole() == ENetRole::ROLE_Authority
{
	AreaSphere->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics); // Enabled on server
	AreaSphere->SetCollisionObjectType(ECollisionChannel::ECC_Pawn);
	AreaSphere->SetCollisionResponseToChannel(ECollisionChannel::ECC_Pawn, ECollisionResponse::ECR_Overlap);
	// Bind only on server cause weapon there has authority
	AreaSphere->OnComponentBeginOverlap.AddDynamic(this, &AWeapon::OnSphereOverlap);
}
```

需要 Replication 来实现在客户端也能正常显示

流程：**服务器检测碰撞，并告知客户端可以显示控件**

## 服务器和客户端同步变量的修改：Variable Replication

- 如何复制一个变量
- 何时复制了一个变量
- 如何创建一个函数，通知变量被复 制：**RepNotify**

Replicate 意味着，**服务器上这个变量修改了，就要通知所有客户端也要修改这个变量**

声明形式如下：
```cpp
UPROPERTY(Replicated)
class AWeapon* OverlappedWeapon;
```

注册 replicated 变量：
```cpp
// Register variables to be replicated
virtual void GetLifetimeReplicationProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

void ABlasterCharacter::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);

	DOREPLIFETIME(ABlasterCharacter, OverlappingWeapon);
}
```

但这样会导致，一旦发生重叠，所有客户端的这个 ABlasterCharacter 角色的 OverlappingWeapon 变量都会被设置，可以修改这个宏，只有拥有这个角色的客户端才可以设置这个变量
```cpp
DOREPLIFETIME_CONDITION(ABlasterCharacter, OverlappingWeapon, COND_OwnerOnly);
```

此时客户端之间问题解决了，但服务端仍存在问题，因为当客户端的角色和武器重叠，服务端也会显示这个 widget

可以直接判断这个重叠的角色是不是在本地控制的，这样如果是 client 控制的角色被 server 检测到和 weapon 重叠，那么在 server 上不会去设置这个 widget

```cpp
void ABlasterCharacter::SetOverlappingWeapon(AWeapon* Weapon)
{
	OverlappingWeapon = Weapon;
	if (IsLocallyControlled())
	{
		if (OverlappingWeapon)
		{
			OverlappingWeapon->ShowPickupWidget(true);
		}
	}
}
```

但我们需要让 client 上显示这个 widget，这里就需要用到 ReplicatedNotify 了，方式如下：

```cpp
// 在这里标签改为：ReplicatedUsing = OnRep_OverlappingWeapon
UPROPERTY(ReplicatedUsing = OnRep_OverlappingWeapon)
class AWeapon* OverlappingWeapon;
```

并设置这个 notify 函数：

```cpp
UFUNCTION()
void OnRep_OverlappingWeapon();

void ABlasterCharacter::OnRep_OverlappingWeapon()
{
	if (OverlappingWeapon)
	{
		OverlappingWeapon->ShowPickupWidget(true);
	}
}
```

注意：这个 RepNotify 只会从 server 发送到 client，server 不会执行的

可以这么理解，当这个变量发生修改时，server 就会发送一条这个 notify 到 client，client 就会执行这个 notify 从而修改 client 上这个 widget 可见性


接下来开始设置结束重叠时关闭 widget，首先要在 weapon 中设置结束重叠事件，直接将 overlapped Actor 中的这个 overlapping weapon 设置为 nullptr 即可

那么此时有一个问题：**这个武器已经被置空了，怎么从角色那里关闭呢？**，利用 RepNotify 的参数。当一个网络可复制的变量发生改变时，这个 RepNotify 会接受改变之前的数值作为参数，也就是说：
- 重叠前，武器为空（0）
- 发生重叠，武器不为空（1），此时会传入武器为空时的值，0
- 结束重叠前，武器为 1
- 结束重叠，武器为 0，此时会传入武器置空之前的值也就是 1

所以可以用如下代码实现：

```cpp
void ABlasterCharacter::OnRep_OverlappingWeapon(AWeapon* LastWeapon)
{
	if (OverlappingWeapon) // 如果检测到武器就设置为真
	{// 如果没有这个就不会执行
		OverlappingWeapon->ShowPickupWidget(true);
	}
	if (LastWeapon) // 如果刚重叠，这里是空，不会执行下边
	{ // 但如果是重叠结束，这里会传入结束重叠前的值，不会空，就会执行这里
		LastWeapon->ShowPickupWidget(false);
	}
}
```

要注意，**RepNotify 只会在 client 上执行，server 上不会，所以还要单独对 server 执行一次 false 操作**，同样可以直接在设置的时候执行：

（**根本原因其实就是，碰撞只在 server 上启动了，检测也只在这里进行，而这个 SetOverlappingWeapon 也只会在 overlapping 的时候调用，client 压根不会执行这个，所以 client 需要 notify 来接受 server 的通知。而 server 就按照正常的编写思路设置就好了**）

```cpp
void ABlasterCharacter::SetOverlappingWeapon(AWeapon* Weapon)
{
	if (OverlappingWeapon) // 就是在设置这个 weapon 之前，先关一次
	{
		OverlappingWeapon->ShowPickupWidget(false);
	}
	OverlappingWeapon = Weapon; // 如果设置为空了，下边不会打开；如果设置不是空，那最终 widget 还是会显示
	if (IsLocallyControlled())
	{
		if (OverlappingWeapon)
		{
			OverlappingWeapon->ShowPickupWidget(true);
		}
	}
}
```

## 关于 Replicated 和 RepNotify 的一些思考

在设计多人游戏时，在 server 上，可以按照正常的单人游戏逻辑去设计，因为很多逻辑，像是碰撞检测等都是 server 去做。但是由于 client 上不存在这些逻辑，这就导致 client 上不会执行相关的检测

就比如角色和 weapon 的重叠事件，server 上正常进行，client 上没有开启这个重叠检测，但是当 client 的角色和 weapon 的确处于一个发生重叠的范围内时，server 上的的确确会发生重叠后的事件，而 client 上不会，因为压根就没有开启这个检测也就不会有重叠事件发生。

因此，需要 replicated 和 notify，通过 server 把什么变量被修改了通知给 client，上边重叠例子就是要 server 把和角色重叠的 weapon 告诉 client，你这个 OverlappingWeapon 修改了（此时 client 上没有经过那个 SetWeapon 函数，而是直接同步修改了变量），但是按照原本的游戏逻辑，设置这个变量过程中是需要一些操作的，把这个变量修改时要执行的操作告诉 client 就是这个 notify 的作用。从而实现了：
- 当这个变量变化的时候，server 发送信息让 client 按照 server 中这个变量进行修改
- 并且这个变量变化时伴随一些操作，server 也会打包为一个 rep notify 通知这个 client，这个变量修改了你还要做这些事情

所以，整体思路应当是：
- server 上进行一些权威性的逻辑判断与检测，这些可以正常编写
- 涉及到需要在 client 产生变化时，就设置相应的变量为 replicated 并看情况是否设置相应的 rep notify（因为有些动作不会在 client 上执行）
- 并且要注意，是要发送给全部的 client 还是只是发送给这个变量的 owner

可以看到 RepNotify 是依赖于 Replicated 的，只有标记为 replicated 的变量修改了，绑定在这个变量上的 notify 才会被 server 发送到 client，但如果不需要变量，只是想发送一些指令操作呢？（RPC？）

## 通过项目中“装备武器”学习 Replicate 和 RPC
### 客户端逻辑：按键触发 Equipping Weapon 动作

创建一个 CombatComponent，在其中实现战斗相关的逻辑，这里主要实现的是装备武器。

记得先绑定动作映射，这里设置的是 E 键拾取并装备武器

在 CombatComponent 中，设置两个变量，一个用来存放拥有这个组件的角色指针，一个存放目前装备着的武器。**知道一个物体或组件等的拥有者是很重要的一件事**，所以这里在角色中，重载函数`PostInitializeComponents`，目的是在组件创建好之后就将其一些变量/属性进行初始化设置，这里是将角色指针指向组件目前添加到的角色指针

另外一件事，就是将武器装备到角色上，主要是通过骨骼网格体的 Socket，可以打开角色骨骼网格体，在右手`Hand_R`这里添加 Socket，设置一个武器预览调整好位置

回到 C++，在 CombatComponent 中：

```cpp
void UCombatComponent::EquipWeapon(AWeapon* WeaponToEquip)
{
	if (Character == nullptr || WeaponToEquip == nullptr) return; // check valid

	// Attach weapon to a hand socket on the skeleton mesh
	EquippedWeapon = WeaponToEquip;
	EquippedWeapon->SetWeaponState(EWeaponState::EWS_Equipped);
	const USkeletalMeshSocket* HandSocket = Character->GetMesh()->GetSocketByName(FName("RightHandSocket"));
	if (HandSocket)
	{
		HandSocket->AttachActor(EquippedWeapon, Character->GetMesh());
	}
	EquippedWeapon->SetOwner(Character);
	EquippedWeapon->ShowPickupWidget(false);
}
```

在角色这里，**希望 server 拥有决定一个角色是否可以装备武器的 authority**：

```cpp
void ABlasterCharacter::EquipButtonPressed()
{ // need server to validate this action, then tell client equip or not
	if (Combat && HasAuthority()) // 同样在 server 上进行装备
	{
		Combat->EquipWeapon(OverlappingWeapon);
	}
}
```

此时存在一些 bug：
- server 可以正常拾取，client 不行
- 拾取武器后，角色跳跃再落地后武器的 widget 又出现，再次按 E 又消失
  - 推测，武器的 spheremesh 没有关闭，当跳跃时武器和角色结束 overlap，落地后武器和角色重新 overlap，导致 widget 被置为可见
  - 由于此时 overlapping，所以按 E 后相当于又拾取了一次武器，从而又关闭了 widegt


### 客户端到 Server 端的通信：Remote Procedure Calls (RPC)

RPC：是一个函数，**可以从一个机器上调用，但在另一台机器上执行**

三种标签：
- Server：客户端调用，服务器执行
- Client：服务器调用，客户端执行
- NetMulticast：服务器调用，当前连接的所有客户端执行

参考笔记：[UE 基础：联网及多人游戏](../../框架学习/UE基础/UE基础：联网及多人游戏.md)

```cpp
UFUNCTION(Server) // 设置从客户端到服务器发送信息
void ServerEquipButtonPressed();
```

需要指明这个 RPC 是 reliable 还是 unreliable

这个函数在 C++ 里需要实现这个版本的`void ServerEquipButtonPressed_Implementation()`，这里目的是当 client 按下 E 时，进行装备，所以 RPC 需要发送装备指令：

```cpp
void ABlasterCharacter::ServerEquipButtonPressed_Implementation()
{
	if (Combat) // if not server, send confirm by RPC
	{
		Combat->EquipWeapon(OverlappingWeapon);
	}
}
```

同时调整之前的装备指令，根据 HasAuthority() 来决定执行还是 RPC 发送指令：

```cpp
void ABlasterCharacter::EquipButtonPressed()
{ // need server to validate this action, then tell client equip or not
	if (Combat)
	{
		if (HasAuthority()) // 是服务器就直接装备
		{
			Combat->EquipWeapon(OverlappingWeapon);
		}
		else
		{
			ServerEquipButtonPressed(); // 不是服务器要通知服务器 client 的操作
		}
	}
}
```

此时 Client 可以正常拾取了

存在问题：
- SphereCollistion 还没关
  - 拾取武器的机器上 widget 一直开启
  - 拾取武器后与其他角色接近会在对方机器上显示 widget
  - 其他角色可以从装备武器的角色手里夺取武器并装备武器

接下来要设置 weapon 被装备时关闭碰撞检测

之前在创建 weapon 的时候设置了如下枚举值：

```cpp
UENUM(BlueprintType)
enum class EWeaponState : uint8
{
	EWS_Initial UMETA(DisplayName = "Initial State"), // on the ground
	EWS_Equipped UMETA(DisplayName = "Equipped"), // equip by player
	EWS_Dropped UMETA(DisplayName = "Dropped"), // drop, when open collision

	EWS_MAX UMETA(DisplayName = "DefaultMAX"), // Default Max constant, for check how many constants here
};
```

所以我们可以将 WeaponState 设置为可复制，并调用对应的 RepNotify 同步

```cpp
UPROPERTY(ReplicatedUsing = OnRep_WeaponState, VisibleAnywhere, Category = "Weapon Properties")
EWeaponState WeaponState;
UFUNCTION()
void OnRep_WeaponState();

// 添加
void AWeapon::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);

	DOREPLIFETIME(AWeapon, WeaponState); // 因为 Weapon 就这一个，所以直接发给全部的客户端
}
```

当武器状态被修改：

```cpp
void AWeapon::SetWeaponState(EWeaponState State)
{
	WeaponState = State;

	switch (WeaponState)
	{
	case EWeaponState::EWS_Equipped:
		ShowPickupWidget(false); // 关闭 widget
		AreaSphere->SetCollisionEnabled(ECollisionEnabled::NoCollision); // 关闭碰撞
		break;
	}
}
```

因为我们已经将 client 的按键 E 装备武器操作通过 RPC 发送到了 server，在 EquipWeapon 中就会执行这个 SetWeaponState 操作，所以我认为在 server 和 client 两边都已经正确执行了关闭 widget 的操作，但视频里仍然单独实现了一下关闭 client 的 widget 的操作

```cpp
void AWeapon::OnRep_WeaponState()
{
	switch (WeaponState)
	{
	case EWeaponState::EWS_Equipped:
		ShowPickupWidget(false);
		break;
	}
}
```


### Server 进行权威检测的另一实例：装备动作和装备武器

动画示例和网络可复制关系不大，只能访问本地机器上的变量

在之前的工作中，我们没有针对 CombatComponent 中的 EquippedWeapon 进行设置，因为本地按下 E 的时候，本地 client 只是执行了一条发送 RPC 到 server 的操作，而没有执行这个 RPC 中装备武器的命令，因此在本地 client 上，这个 equippedweapon 一直为空

所以需要在 CombatComponent 中将这个变量设置为 replicated，从而同步这个角色实例在各个 client 上的状态

这里的逻辑也就是：**client 检测玩家输入，并通知 server，server 执行相关操作；再利用 replicated 变量，由 server 向指定的 client 同步这个变量**

最后在动画蓝图中需要用到一个节点：blend pose by bool，然后判断当前角色是否是 equippedweapon 的状态来决定输出的动画


### Crouching

角色蹲伏能力默认是关闭的，记得在 MovementComponent 中开启，这个属性在 Character.h 中已经被设置为了 Replicated 并且会调用一个 RepNotify

C++ 里可以这么开启：
```cpp
GetCharacterMovement()->NavAgentProps.bCanCrouch = true;
```

###  不需要 server 权威检测但需要 replicated 的变量：bAiming

增加 bool 描述当前是否在 aiming，设置 replicated，保证 server 同步 client，并增加 RPC，保证 client 的右键瞄准操作导致的 bAiming 等在 server 上正确设置，从而自动同步到所有 client

这里要和之前 Character 中设置 EuippedWeapon 区分，在本节 bAiming 这个变量只和某个角色相关，并且查看官方 RPC 档案发现，此时这个 RPC 只会在 server 上执行，所以更不需要判断当前是服务器还是 client。但 EquippedWeapon 需要和各个角色实例检测，**需要由服务器决定，那个角色实例最终可以 Equip 上，而不是每个 client 都先装备再告诉 server**

## 网络更新频率

一个改动地方，角色蓝图，搜索 net：
- 网络更新频率：NetUpdateFrequency = 100. F;
- 最小网络更新频率（复制属性很少时的更新频率）MinNetUpdateFrequency = 33. F;

另一个 NetTickRate：
- 打开项目文件夹，config -> DefaultEngine. Ini
- 在最后加上

```ini
[/Script/OnlineSubsystemUtils.IpNetDriver]
NetServerMaxTickRate = 60
```

# Weapon

两种射击武器的实现方式
- Projectile Weapon
  - 产生投射物
  - 投射物具有速度
  - （可选）具有重力
  - 有 Hit Event
  - Tracer Particles
- Hitscan Weapon
	- Line trace
	- Instant kill
	- Beam particles

## Projectile Weapon

### 枪械开火：client 到 server 再到 client

开火事件的输入在 client 发生，然后通过 RPC 通知 server，server 接收到后通过检测并利用 Multicast 在 server+ 全部 client 上执行角色的开火动画和枪械开火动画

对于枪械开火动画：将开火动作设置为 additive，并选择 mesh space，设置好 base pose type，这样可以让这个开火动作在原动作基础上播放。这一节内容比较新鲜，61 集。**要考虑动作 Additive 的位置，比如这里选择在 Equipped 到 AimOffsets 之间设置，目的是让 AimOffsets 也作用在这个动画之上**

### 多人游戏的开火特效

开火特效没有在其他机器上显示

原因是相关方法没有在其他机器上执行，这里用到了 UFUNCTION 中的 Multicast，该标签会导致该方法在 server 上调用时会同时在 server+ 全部 client 上执行（client 上调用只会在 client 上执行）

所以这里的逻辑就变为：
- Client 检测开火，给 server 发送开火信息（RPC）
- Server 给 server+ 全部 client 发送执行开火的指令（Multicast）

### Hit Target

核心思路是：在 CombatComponent 中利用 LineTraceByChannel 生成一条射线，检测所碰到的 Actor，返回这个 Actor 的引用，然后在调用 Weapon 的 Fire 方法时，把这个 HitTarget 位置信息传过去，让 weapon 利用这个 HitTarget 位置信息去生成 projectile 并检测弹丸的碰撞，对于 HitScanWeapon 这里也是，利用这个 HitTarget 位置再生成一个从枪口到 Hit 位置长一点的地方的 LineTrace

检测 HitTarget 在 client 上进行，逻辑为：利用屏幕中心点（一般是准星所在位置）计算其在世界空间中的位置以及生成的射线方向，指定检测距离返回第一个碰撞到的物体（**注意如果没有碰撞到物体，要把碰撞结果中的碰撞点设置为检测的末端点位置**）

UGameplayStatics:: DeprojectScreenToWorld ()
GetWorld ()->LineTraceSingleByChannel ()
DrawDebugSphere ()

同时，因为这个逻辑只在 client 上进行，所以还需要考虑同步

### 修正各机器上的 HitTarget

**利用好之前已经设置为 replicate 的方法或属性**

这里可以在之前设置的 ServerFire 和 MulticastFire 传入 HitResult 参数（这里的参数类型为 FVector_NetQuantize 会去掉小数部分），从而同步 HitTarget 位置

### 处理 HitEvent

碰撞检测同样在 server 上执行，所以核心逻辑就是 server 给 client 发送检测结果

在 server 端将 HitEvent 事件绑定到 Mesh 的 OnComponentHit 上（注意要接收的参数）

这里为了同步各个机器上的特效和音效，**想办法利用已经实现各个机器同步的方法来实现其他方法的同步**，比如这里利用 AActor 的 Destroy 函数，在 AActor 被销毁时其内部的一个虚函数 AActor:: Destroyed () 会被调用，所以这里可以 override 这个虚函数，在这个 Actor 被销毁的时候生成特效和播放音效（这里会在每个机器上调用）

### 生成投射物和投射物组件以及投射物路径

在武器的 Mesh 上有两个 socket，MuzzleFlash 和 AmmoEject，分别用来生成投射物和抛出弹壳

主要过程为：
- Projectileweapon 上重载 AWeapon 基类的 Fire 方法
- 在对应的 socket 位置生成 projectile，使用的是 GetWorld ()->SpawnActor

投射物组件则创建在投射物中，它负责管理投射物的运动

ProjectileTracer：这里主要是在投射物上生成特效来显示子弹的路径，在投射物中声明一个 UParticleSystem 和一个 UParticleSystemComponent，前者储存所用的特效，后者作为组件负责指定特效的生成位置和依附逻辑（UGameplayStatics::SpawnEmitterAttached）

### 抛弹壳（Bullet Shell）

和生成子弹一样，在对应的 Socket 处调用 World->SpawnActor ()，这个事件只在客户端上进行就好，本身就是装饰性事件

### 长按开火 GetWorldTimerManager ()

AActor:: GetWorldTimerManager ()

这里给武器添加了几个属性：bAutomatic（自动武器），bCanFire（是否可以开火），FireDelay（开火间隔）

实现逻辑和之前一样，在 Fire 方法中开启一个 FireTimer 用来计时，并且利用 bCanFire 来防止快速点击左键导致的大量垃圾指令
```cpp
void UCombatComponent::Fire()
{
if (EquippedWeapon->bCanFire) // 防止快速点击左键触发垃圾指令
{
		EquippedWeapon->bCanFire = false; // 这里关闭开火
		ServerFire(HitTarget);
		StartFireTimer();
}
```

只有当 timer 计时到时间后才会重新开启可开火
```cpp
void UCombatComponent::ResetFireTimer()
{
	EquippedWeapon->bCanFire = true; // 到时间后才重置
	if (bFireButtonPressed && EquippedWeapon->bAutomatic)
	{
		Fire();
	}
}
```

这样，就算是非自动武器，单点的时候也需要有一个 delay 的时间（只不过此时非自动武器 bAutomatic 为 false，所以到时间后不会执行）

对于全自动武器，只要松开左键，就会导致 bFireButtonPressed 设置为 false，同样不会继续触发 Fire


### HUD 和 PlayerController

### 准星

#### 显示准星和准星缩放

两个事情：
- 在屏幕上显示准星
- 根据角色的移动速度和跳跃实现准星扩散

准星缩放实现比较简单，实现准星就是将准星的 Texture 设置在 Viewport 的 Center（需要注意的就是 Texture 的位置是以 Texture 的左上角为基准的）

扩散则是在上方设置位置的基础上增加一个 Offset，然后设置在移动或者跳跃的时候把这个 offset 缩放到一个数值，可以借助角色的速度映射到 0~1 之间来作为这个缩放系数

#### 瞄准时缩放准星以及开火时扩散准星

和上边方法差不多，这里需要增加的就是一个放缩的因子：`CrosshairXXXFactor`

对于瞄准，应当缩小准星的扩散，但这里为了保持因子为正数，所以最后需要减去瞄准因子

对于开火扩散，可以在开火的位置去设置开火导致的扩散程度（从武器获取对应的开火扩散），然后在计算 HUD 扩散的位置，将这个开火因子插值到 0

#### 准星重叠在敌人身上时变红

在计算 TraceHitResult 的位置检测是否 HitActor 是否是目标角色，是则把颜色设置为红色，不是就设置回白色

此时会出现几个问题：
- 当准星从一个比较远的位置移动到一个近处物体之上时，枪口会出现明显的跳动（这里解决办法是对动画 Cpp 中的右手旋转修正那里设置一个 RInterpTo）
- 在某些情况下会出现准星错位到自己角色身上，如果此时重叠了准星也会变红
- 包括前几条，准星放在近处物体上由于会自动修正枪口朝向，这会导致右手会在一些极度靠近物体的情况出现扭曲

#### 准星的修正：移动 trace 的起始位置

准星瞄准近处物体导致的不正确旋转修正

解决办法：将 trace 的起始位置向前移动一定距离

#### 准星被角色遮挡问题

当角色后退靠近墙壁时，此时视野会被角色遮挡，这里将实现隐藏角色的效果


### 武器朝向瞄准方向

在目前实现的效果中，武器的枪口朝向和枪口到准星投射的 HitTarget 的方向不重合，这一节目的就是修正枪口的朝向并将左右手正确依附

右手骨骼 `hand_r`，这个坐标的 x 是朝向手臂内部的而不是朝外，这里是一个需要注意的点

修正思路是：获取右手骨骼的世界空间 Transform，利用它在世界空间的 Location 和准星的 HitTarget 的 Location 计算出一个从右手到准星方向的 LookAt，用到的函数为：`UKismetMathLibrary::FindLookAtRotation(Start, Target)`

另外一点，这个修正是针对本地控制的角色的，其他模拟角色精度不需要太高，所以这里可以检测一下是否是本地控制，是就修正不是就不修正。

注意，动画蓝图中调用 `IsLocallyController()` 函数不是线程安全的，不能直接用。这里的解决办法是，在 C++ 里给动画实例增加一个 bool 记录是不是本地控制，如果是，就在计算 LookAt 之前设置为真，然后动画蓝图中使用这个 bool 来混合 pose

### 瞄准时 ZoomIn

#### 实现 ZoomIn

ZoomIn 的效果：
- 画面的 ZoomIn
- 并且设置移动幅度缩放的一个系数（比如狙击枪开镜移动速度慢）

一方面，在武器上设置武器自己的 ZoomedFOV 和 ZoomInterpSpeed，前者为其 FOV 后者为两个 FOV 切换时的插值速度

另一方面，在 CombatComponent 中实现设置相机 FOV 的方法，设置默认 FOV，和当前 FOV 属性，也可以增加一个默认的 FOV 切换速度。在 BeginPlay 中设置好默认 FOV 和当前 FOV，并在 Tick 中调用更新 FOV 的方法，瞄准时插值到武器的 FOV，取消瞄准时则插值回默认的 FOV，**最重要的是将当前 FOV 设置给角色相机的 FOV 中**

#### 解决 ZoomIn 后视野物体模糊的问题

当把 FOV 设置比较大时可以以注意到视野中的物体变得模糊，可以在角色的 Camera 中设置 `DepthOfField` 来调整远处物体的锐利度，`Aperture` 来设置近处物体

### Hitting the Character

-  Projectile 碰撞到 Character 触发 Character 的 HitReactAnim
- Server 同步 Clients 的 HitReact 事件
- 将碰撞检测限制在 Mesh 而不是 Sphere 上

第一点实现起来很简单，在 Projectile 的 HitEvent 内部对 OtherActor 做一次转换，然后播放 Character 的受击动画；第二点也简单，因为这个 projectile 的 hitevent 只在 server 上绑定，所以需要 server 发送一次 Multicast，然后在 Multicast 中播放受击动画；第三点，此时设置的碰撞检测通道为 pawn，这正是 SphereCollision 所在的通道，如果要精细化分受击位置，比如头部腿部，这里选择自定义一个通道 `SkeletalMesh`，将角色 Mesh 的 CollisionObjectType 改为这个，并将 projectile 的相应从 pawn 修改为在这个通道上进行。

### RocketProjectile

继承自 Projectile，重写 OnHit，这里用到了 `UGameplayStatics::ApplyRadialDamageWithFalloff`

### 从实现 RocketTrails 出发引入 NiagaraSystem

利用 Niagara 创建了火箭尾部的烟雾轨迹

```cpp
UPROPERTY(EditAnywhere)
UNiagaraSystem* TrailSystem;
UPROPERTY()
UNiagaraComponent* TrailSystemComponent;
```


### 武器掉落后 server 和 client 的掉落运动不同

![](UE实现：多人TPS项目/Pasted%20image%2020240515160802.png)

需要在武器中开启 `SetReplicateMovement(true)` 保证运动同步，**同时要注意蓝图是否会 override 这个 value**

## Hit Scan Weapon

- 需要用到 LineTrace
- 适合 CloseRangeWeapons

检测碰撞的核心思路是：在 CombatComponent 中利用 LineTraceByChannel 生成一条射线，检测所碰到的 Actor，返回这个 Actor 的引用，然后在调用 Weapon 的 Fire 方法时，把这个 HitTarget 位置信息传过去，让 weapon 利用这个 HitTarget 位置信息去生成 projectile 并检测弹丸的碰撞，对于 HitScanWeapon 这里也是，利用这个 HitTarget 位置再生成一个从枪口到 Hit 位置长一点的地方的 LineTrace

### BeamPaticles 子弹轨迹特效

```cpp
UParticleSystemComponent* Beam = UGameplayStatics::SpawnEmitterAtLocation(World, BeamParticles, SocketTransform);
Beam->SetVectorParameter(FName("Target"), BeamEnd);
```

这里的 Target 对应这里：

![](UE实现：多人TPS项目/Pasted%20image%2020240515182305.png)

---
# 一些动作设置

## 混合空间

Running BlendSpace

Leaning and Strafing

混合空间里设置插值的，运算时会在混合空间中进行插值变化，比如从 -180 到 180，混合空间会尝试从 -180~0~180 这条路去插值，这会导致我们会经过这中间的其他节点，导致最终的动作效果会很突兀。一个解决办法是在 C++ 中使用 Interp 计算差值，它会尝试计算 -180 到 180 的最短插值路径，而不会经过这之间的节点

另外，由于这里用于计算 Lean 和 YawOffset 的数据本身是 replicated 的所以这里对这两个参数的计算自然也是 server 与 client 同步的，这部分唯一要注意的就是上边提到的插值了

## 瞄准时上半身随着视角转动：Aim Offsets

回到 UE4 中设置，

将单帧动作设置 Additive，在资产面板中设置`AdditiveAnimType`，选择`MeshSpace`，并设置`BasePostType`为准备好的`ZeroPose`，也可以可以通过属性资产批量编辑

要注意，因为这里的动画使用了这个角色的骨骼，而这个项目里这个骨骼的引用路径和 UE5 那个项目的不同，需要处理一下，这里把 UE4 中这个骨骼所对应的文件夹放到了和 UE5 项目同路径的位置


## 角度变量同步时的问题：Pitch in Multiplayer

当进行多人游戏测试时会发现，client 控制角色向下看，当角度为负数时，server 上显示的角色却朝上看，打印角度发现，server 上该角色的 pitch 变为了 360.

原因是，UE 在打包 Rotation 通过网络发送的时候会把这个 Rotation 变为无符号整数

修正左手持枪位置：FABRIK IK

解决左手在持枪状态下不在正确位置的问题

FABRIK（Forward and Backward Reaching Inverse Kinematics）正向与反向实现可逆动力学的算法

如何将设置适用于不同的武器（不同武器有不同的 mesh，左手要放到不同的位置）？
- 设置同一个名称的 socket（LefthandSocket），每次让左手连接到这个同名的 socket 上即可
- 具体实现中需要选取相对于哪个骨骼进行变换，这里选择 hand_r，利用 TransformToBoneSpace，获得这个 LeftHandSocket 相对于 hand_r 的骨骼空间的位移和旋转（返回引用参数），将返回的位移和旋转设置到 LeftHandSocket 即可

回到动画蓝图，由于这种设置主要是在装备武器时出现的，所以这里新建一个状态机，利用之前的 AimOffset cached pose 作为输入，利用节点 FABRIK 实现对这个 LeftHandSocket 的设置。点击 LeftHandSocket，在右侧面板设置执行器（相对目标骨骼 hand_r）和解算器（变换应用于谁，LeftHandSocket，选择根骨骼保证这部分骨骼都会正确计算）


## 原地小碎步转动方向
### Turning In Place

之前设置了 AimOffset，也就是在静止状态下，当角色持有武器时，如果此时视角左右移动，角色的上半身也会跟着视角转动，但我们没有处理当这个视角转动超出一个范围后的情况。这就是这节课要处理的内容

主要目的：当视角转动超出上半身可转动范围，角色会自动向视角方向调整自己的身体朝向

这里利用枚举值来标识角色要左转还是右转

这里提到一个细节：不要给文件引入一个它不需要的文件，比如上述情况，我们只需要一个枚举值，但我们不希望在这个文件中进行声明和定义，但如果在其他已有文件中声明，我们势必要引入一个大部分它都不会使用到的文件。这里选择在 VS 中新建了一个头文件用来创建枚举值
- 在 VS 中新建后，保存并关闭 VS
- 打开项目文件夹，删除：Binaries、Intermediate、Saved 文件夹
- 右键 uproject，生成 VS
- 双击打开 uproject 选择生成即可

选用枚举的原因：布尔变量表述的是两个状态，如果想要描述的情况多于两个，布尔变量也就需要再增加，进行逻辑判断的条件也就变得麻烦起来。但如果是枚举，我们就可以直接用一个枚举值描述当前状态，清晰又直观

**别忘了在构造角色的时候把相关的枚举等等变量进行初始化**

### 旋转 RootBone

上边只是旋转了上半身，并在一定角度时播放转动动画，但是角色实际上还没转动，这一节就是解决这个问题

方法是在动画蓝图中使用节点 RotateRootBone，将 AO_Yaw 设置到上边，也就是在开启控制器控制旋转的情况下，对 rootbone 使用上半身旋转的反向，从而保证下半身保持静止。

随后要设置当 AO_Yaw 达到某个角度时，触发 rootbone 的旋转。这部分在 TurningInPlace 已经设置好了，所以这里可以直接在这个函数中，增加功能，如果当前处于旋转状态，为了保持平滑，这里需要将此时的 AO_Yaw 插值到 0，并设置一个限制。此时转动已经结果，将角色状态以及部分旋转时需要的变量重置即可

## 左前方和右后方动作

同时按住 W 和 A 与 S 和 D，会发现这个方向上的动作混合效果不是很好，这里解决办法是：找到对应动作的向前和向后运动的动画，复制一份在里边修改 root 朝向（局部坐标，向左 45），选择 spine 朝向（世界坐标，向右 45），保存关键帧保存预览动画，在混合空间中的对应位置加上即可


## 平滑代理角色的运动

代理角色在转动时会出现抖动现象（原因是在动画蓝图中转动的根骨骼）：之前在设置上半身的 TurnInPlace 的时候，转动上半身超过一定角度就会触发角色的原地转向，这里会转动角色的根骨骼。对于本地角色，可以利用插值平滑过渡，但是对于依靠网络复制的代理角色，网络更新速度比本地的 Tick 慢得多，这就导致这个插值起不到平滑作用

这里的解决办法是为模拟代理角色或者是非本地控制的角色（针对 server）实现一套单独的转身逻辑，这里就不需要和 client 本地控制角色那么复杂了。

**对于动画蓝图**，要在设置旋转 RootBone 的位置设置一个 BlendPosesByBool，这意味着要在角色的 AnimInstance 中增加一个 bRotateBone，对于动画蓝图的 Cpp 文件作用其实就是在 UpdateAnim 的函数中调用 Character 更新 AnimInstance 的属性，所以这里也是一样，利用 Character 中的 bRotateBone 更新自己的属性值

**对于角色逻辑**，抖动的主要原因是 Tick 的更新速度和网络更新速度的不一致，所以这里需要在 Tick 中判断当前执行机器是否是代理角色或者是 server 上的非本地角色，如果是就需要执行这套单独逻辑。逻辑实现和本地的 client 转身逻辑差不多，都是计算当前的 Rotation 和上一帧的 Rotation 的 Delta. Yaw，如果这个 Yaw 超过一个阈值就设置对应的转身 Enum。另外，这里的逻辑实现使用了一个父类的虚函数 `OnRep_ReplicatedMovement()`，这个函数会在角色的旋转角度发生变化时自动调用。其他需要注意的就是注意角色的状态设置，比如这里设置了超出阈值向左向右转，那么在其他情况下就要注意把状态复原，比如没有超出阈值，以及跑步状态等等

## 禁止移动

```cpp
// 关闭淘汰角色的一些功能
GetCharacterMovement()->DisableMovement(); // 禁止移动
GetCharacterMovement()->StopMovementImmediately(); // 禁止相机转向
if (BlasterPlayerController)
{
	DisableInput(BlasterPlayerController); // 禁止输入
} 
```

## 武器 Dropped

设置角色淘汰后武器掉落，利用 WeaponState 的 Replicated 设置，自动同步 Client 上的武器状态并执行相关函数。这里要注意的就是再 server 上和在 client 上要关闭和设置的内容，因为 Sphere 碰撞只在 server 上开启，所以不需要再 client 上关闭。同时要注意开启和关闭网格的物理和重力以及碰撞

最关键的在于：武器被装备时，会设置 AttackToActor 和 SetOwner，丢弃时也要注意使用 DetachFromComponent（设置分离 rules）进行分离以及将所有者置空


# 游戏属性

## 生命值、伤害

生命值这里和之前 widget 的实现相同，这里专注后边伤害部分

Controller 在 ACharacter 中

UGameplayStatics:: ApplyDamage () 只会触发一个伤害事件，必须要有另一个类绑定一个回调（必须用 UFUNCTION 修饰）到上边，这里在 BeginPlay 中选择在 server 上时才绑定回调

```cpp
// 伤害回调，接收参数
UFUNCTION()
void ReceiveDamage(AActor* DamageActor, float Damage, const UDamageType* DamageType, class AController* InstigatorController, AActor* DamageCasuer);

// BeginPlay 中绑定回调
if (HasAuthority()) // 因为子弹的碰撞检测只在 Server 上进行，所以这里也只在 server 上绑定
{
	OnTakeAnyDamage.AddDynamic(this, &ABlasterCharacter::ReceiveDamage);
}
```

Replicated 变量比发送 RPC 信息更有效，这里把之前设置的 MulticastHit 删除了，把播放受击动画移动到了 ReceiveDamage 的位置

利用三元运算符，避免每次都 cast 一次，下面这样只会在原本为空的时候去 cast，这样就避免了后续的多次无意义 cast
```cpp
BlasterPlayerController = BlasterPlayerController==nullptr? Cast<ABlasterPlayerController>(Controller) : BlasterPlayerController;
```


## GameMode

大纲：
- 设置游戏模式
- 处理玩家 Elimination
- 角色的 elim 方法

记录：
- 删除 C++ 文件的方法：关掉编辑器和 IDE，在文件夹中删除目标文件，找到项目的 `.uproject` 右键重新生成 vs 项目文件，等待完成，双击 `.uproject` 选择修复，等待修复完成后，编辑器自动启动
- GameModeBase 和 GameMode 的区别？为什么视频中使用 GameMode？
- 在 GameMode 中设置 PlayerElimination 函数，形式 `	virtual void PlayerEliminated(class ABlasterCharacter* ElimmedCharacter, class ABlasterPlayerController* VictimController, class ABlasterPlayerController* AttackerController);`，执行则在 Character 中的 ReceiveDamage 内执行

### AGameMode 和 AGameModeBase

这里最重要的是这两个 GameMode 的区别：
- AGameModeBase
	- 默认的 GameMode 类
	- 生成玩家的 pawn
	- 重启玩家
	- 重启游戏
- AGameMode
	- MatchState
	- HandlingMatchStates
	- CustomMatchStates

所以，如果需要设置类似 Match 的游戏模式，推荐使用 GameMode，并重载其中和 MatchState 相关的函数来实现自定义游戏模式和不同的 Match

在 AGameMode 中：
- MatchSate
	- EnteringMap
	- WaitingToStart
	- InProgress
	- WaitingPostMatch
	- LeavingMap
	- Aborted
以及相关的 MatchState 接口：
- HasMatchState
- HasMatchEnded
- GetMatchState
- SetMatchState
- OnMatchStateSet
- StartMatch：游戏进入进行中状态，并产生默认 pawn

如果需要自定义的 MatchState，需要加在 WaitingToStart 之后和 WaitingPostMatch 之间，这里准备添加一个赛前热身时间和一个赛后冷却时间，所以要添加在 InProgress 之前和之后（并且要满足之前的条件），在 InProgress 中，则定义为 MatchTime

### 自定义 MatchState

添加自定义 MatchState 的方法：
```cpp
// 头文件中
// 这里仿照 AGameMode 头文件中的写法，并加上 extern DEMO_TPS_API
namespace MatchState
{
	extern DEMO_TPS_API const FName Cooldown;
}

UCLASS()
class DEMO_TPS_API ABlasterGameMode : public AGameMode
{
	GENERATED_BODY()
};

// 源文件中
namespace MatchState
{
	const FName Cooldown = FName("Cooldown");
}

```

### RestartGame 与禁止玩家部分操作

- 重启游戏
- Disable 玩家 action

可以使用 AGameMode 中的 RstartGame 方法，但这个方法只能在打包的时候测试。但有个方法可以不需要和其他玩家一起测试多人游戏功能。
- 找到项目文件，右键
- 点击 LanuchGame

除此之外，还希望在 cooldown 的时候禁止玩家的某些操作，比如移动开枪等，但允许玩家此时进行诸如和 HUD 或 UI 点击交互等操作



## 淘汰和重生

### 大纲 
- 玩家重生
- 淘汰计时器
- 从 GameMode 发出重生玩家请求

### 记录
- 利用 GameMode 实现玩家的淘汰和重生
- 淘汰与重生中，可以将 controller 从角色上 Unposs，这样重生的时候可以 poss 另一个，并且角色的一些重要状态不能放在角色之中，这会导致角色销毁时这些数据也被销毁
- 设置玩家重生的逻辑是：需要检查玩家控制器是否有效，获取全部的 PlayerStart 位置，随机选取一个位置，使用 RestartPlayerAtPlayerStart 重生玩家

### 问题
- 可以增加一个判断，让玩家总是重生在距离其他玩家最远的重生点上
- 此时玩家重生后，手中的武器会保持玩家被淘汰时的状态，也无法拾取（目标实现：武器从被淘汰的玩家手里掉落，并重新进入可拾取的状态）
- 玩家被淘汰并播放淘汰动画时，角色的碰撞箱仍存在直至角色动画播放完毕才消失
- 有时候玩家被淘汰后不会顺利重生，原因是在重生位置发生了碰撞，可以在蓝图中设置 SpawnCollisionHandlingMethod 来解决，也可以直接在 Cpp 中设置
- 角色血量归零后，还能继续被攻击从而一直触发淘汰动画无法顺利重生（关闭碰撞检测应该就可以了）

## GameTimer（同步 server 和 client 时间）

- Match CountDown
 - Syncing Client and Server Time

计算时间使用到了 `AActor::GetWorld()->GetTimeSeconds()`

这里有一个关键问题，就是同步 server 和 client 的时间。由于 client 加入 server 需要时间，如果在每个机器上获取自己 World 的 Time，会导致相互之间计时出现差异，所以这里要想办法让 client 从 server 那里获得正确的时间

client 和 server 之间的交互传递需要时间（这里假设往返时间相同），所以当 client 接收到 server 发来的时间后，实际上此时 server 的时间应当加上单程传递时间的修正

所以可以这样：
- Client 发送 RPC，记录发送时刻 ClientRequestTime，RPC 在 Server 上执行得到接收时刻 ServerReceiveTime
- Server 发送 RPC，将接受时刻发回 Client，并在 Client 上计算 DeltaTime，最后 Server 时间应为 ServerReceiveTime + DeltaTime

```cpp
void Server_RequestServerTime_Implementation(float ClientRequestTime) // 带着发送时间过去
{// 在服务器上执行
	float ServerReceiveTime = GetWorld()->GetTimeSeconds(); // 此时 server 的时间
	Client_ReportServerTime(ClientRequestTime, ServerReceiveTime); // 返回 server 时间
}
void Client_ReportServerTime_Implementation(float ClientRequestTime, float ServerReceiveTime)
{
	// 往返时间
	float RoundTripTime = GetWorld()->GetTimeSeconds() - ClientRequestTime;
	// client 接收到 server 这个 RPC 时 server 时间
	float CurrentServerTime = ServerReceiveTime + 0.5 * RoundTripTime;
	// Client 和 Server 的时间差
	ClientServerDelta = CurrentServerTime - GetWorld()->GetTimeSeconds();
}
```

这样，client 和 server 的时间差保存在了成员变量 `ClientServerDelta` 中了，如果需要得到当前 server 时间只需要：

```cpp
float GetServerTime()
{
	return GetWorld()->GetTimeSeconds() + ClientServerDelta;
}
```

为了提升时间的鲁棒性，必然要设置一个同步时间，每隔这么长时间就同步一次：

```cpp
void CheckTimeSync(float DeltaTime)
{
	// 记录从上次同步后经过了多久
	TimeSyncRunningTime += DeltaTime;
	// 本地控制 + 到了同步时间，开始同步
	if(IsLocallyController() && TimeSyncRunningTime > TimeSyncFrequency)
	{
		ServerRequestServerTime(GetWorld()->GetTimeSeconds());
		TimeSyncRunningTime = 0.f; // 重新记录同步经过时间
	}
}
```


## 添加一个角色淘汰时头部的机器人

- 这里使用到的有：`UParticleSystemComponent`，`UParticleSystem`，`USoundCue`
- 相关使用：使用 GameplayStatics 生成 Sound 和 ParticleSystemComponent，利用 ParticleSystemComponent 管理（销毁）Particle

```cpp
// 淘汰机器人
if (ElimBotEffect)
{
// 使用 UGameplayStatics 生成 Particle，使用 ParticleSystemComponent 管理
	FVector ElimBotSpawnPoint(GetActorLocation().X, GetActorLocation().Y, GetActorLocation().Z + 200.f);
	ElimBotEffectComponent = UGameplayStatics::SpawnEmitterAtLocation(GetWorld(),ElimBotEffect,ElimBotSpawnPoint,GetActorRotation());
}
// 使用 UGameplayStatics 播放声音
if (ElimBotSound)
{
	UGameplayStatics::SpawnSoundAtLocation(this, ElimBotSound, GetActorLocation());
}

// 销毁 Particle
ElimBotEffectComponent->DestroyComponent();
```

手动给 Particle 设置寿命

## APlayerController::OnPossess

目前存在问题，开始游戏时，角色的 HealthBar 会在 BeginPlay 更新，但这个 BeginPlay 只会在游戏开始时更新，所以角色重生后角色 HealthBar 不会更新，这里就要修改这个问题，并让角色的 HealthBar 管理交给 Controller

这里将更新角色 HealthBar 的函数放在了 APlayerController:: OnPossess 之中，但 BeginPlay 中的 UpdateHUD 没有删去，原因是 OnPossess 执行的时候 HUD 中的部分参数还没设置好，这会导致角色的 HealthBar 显示出问题（应该是因为这些 BeginPlay 有执行顺序以及时间的原因吧，这里设置 OnPossess 主要目的是解决角色重生后的 HealthBar 不显示满血的问题）

## GameState

GameState 用于维护玩家得分列表，同步各玩家信息

## PlayerState

- 负责保存玩家在游戏中的状态
- 并且要保持这些数据在角色被淘汰后仍然存在

记住在 GameMode 中想要处理玩家状态时，要利用 PlayerController，因为角色是会被销毁的，Controller 里才存放着 PlayerState 这样的永久数据，这是和玩家相关的数据。

- 利用 PlayerState 中的数据来更新 HUD 上的显示

### Score

在 BeginPlay 中，PlayerState 可能不是立刻就被设置好的（可能在第二帧，第三帧），所以不能在 Character 的 BeginPlay 中调用 PlayerState 去初始化得分，这里另外创建了一个 PollInit，在 Tick 中调用这个 Poll，判断当前 Character 中设置的成员 BlasterPlayerState 是否为空，为空则尝试获取 PlayerState，从而保证正确利用 PlayerState 初始化角色得分

### Defeats

APlayerState 中存在一个 SetScore 函数，

记住:OnRep_相关函数必须是 UFUNCTION


### WeaponAmmo

在 Weapon 中设置，让 Ammo 跟随 Weapon，这样掉落的 Weapn 的弹药会保持。同时在 Weapon 中增加两个指针，分别指向当前 Owner 角色，和当前 Owner 角色的 Controller，因为要更新 HUD。同时要注意 Drop 武器后，要把这些指针置空。以及玩家丢弃武器后要把弹药量显示调整为 0。


### CanFire

增加对弹药的检查，设置武器是否可以开火

### 可携带 Ammo、不同的武器类型、不同的 HUD

- 新建一个头文件设置武器种类枚举值（不在 Weapon. H 中设置），防止引入头文件时加入不需要的部分
- TMap 不支持 Rep，因为用到了哈希算法，可能会导致客户端和服务器上得到的结果不同

这里在 ComabtComponent 中设置了一个 Map，用来记录不同武器所能携带的默认弹药量。并通过一个 CarriedAmmo 变量，用来同步客户端的对应变量并调用 OnRep 来更新 HUD 上的显示

### Reloading

- Reload 动画蒙太奇
- Reload 的动作映射

这里要解决一个问题：之前为了保证左手位置正确，设置了左手的 IK，但这里的换弹动画又需要取消，所以结合 ECombatState 状态，来给动画蓝图设置了一个 bUseFABRIK 用来判断是否设置左手 IK

另外，Reload 同样是从 Client 产生的指令，所以需要 RPC 来发给 Server 执行，再借助 CombatState 的修改，同步其他 client 上的动作

还有，修改 ComabtState 为 Reloading 后记得修改回去，这里选择的是创建了一个 BlueprintCallable 的函数，FinishReload，修改服务端的 CombatState，利用 OnRep 来同步 Client，使用动画蒙太奇中的动画通知在动画的指定位置触发结束装填

```cpp
void UCombatComponent::FinishReload()
{
	if (Character == nullptr) return;
	if (Character->HasAuthority())
	{
		CombatState = ECombatState::ECS_Unoccupied;
	}
}
```

还要解决问题：reloading 期间不允许 fire，以及 reloadFinished 就允许 fire
- 解决办法就是在 Fire 的位置添加是不是 Reloading 的判断，注意有多个 Fire 的位置，因为涉及到 RPC 和 Multicast
- 另外，这里实现了在长按 fire 时换弹，换弹结束后重新进入 fire 的功能

### UpdatingAmmo

- 计算状态内所需要的弹药量，弹匣剩余空位置 RoomInMag，角色携带弹药 CarriedAmmo，下一次装填数量应当为：`Clamp(RoomInMag, 0, min(RoomInMag, CarriedAmmo))`
- 要注意在 Reloading 动画播放完毕后再更新弹药量，也就是在 FinishReloading 这里 UpdateAmmo
- 记得更新 HUD
- AutoReload
	- 

### ReloadEffects

- Sounds
- Reloading 期间关闭 aimoffset



---

# 材质

## 使用 C++ 创建 DissolveCurve

`UTimelineComponent`，通过该组件将回调函数绑定到委托，并利用 AddInterpFloat 将委托添加到指定的 Curve 上，通过组件控制曲线的播放

## DissolveMaterial 可溶解材质

和之前[角色淘汰联系](#淘汰和重生)

- NoiseTexture

这里可溶解材质效果的连线不复杂，但原理还没搞清楚

这里使用了 Optimized 版本的 Mesh，需要注意，这个版本没有使用 PhysicsAsset，这里要手动选一下

这里分了两个材质，一个是 UMaterialInstance 另一个是 UMaterialInstanceDynamic，前者作为创建后者动态材质的依据

当角色被淘汰时创建该动态材质并启动材质溶解曲线，在回调函数中，更新溶解程度参数










