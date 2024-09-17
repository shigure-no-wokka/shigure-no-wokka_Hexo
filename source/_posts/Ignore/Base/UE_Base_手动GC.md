---
title: UE 基础：手动 GC
date: 2024-05-13 09:32
description: 
cover: https://raw.githubusercontent.com/shigure-no-wokka/pic_bed/main/imgs/family_engine.jpg
categories: 软件知识
tags:
  - UE
---
# 手动 GC

## 手动添加属性到 GC

假如有如下代码，在 ATestCharacter 中存在一个变量 FMyTestStruct MyStruct 没有加 UPROPERTY 修饰

```cpp
USTRUCT(BlueprintType)
struct FMyTestStruct
{
    GENERATED_BODY()

    UPROPERTY()
    UObject* Obj = nullptr;
};

UCLASS()
class ATestCharacter : public ACharacter
{
    GENERATED_BODY()
public:
    FMyTestStruct MyStruct; // 没有声明 UPROPERTY()
};
```

如果想要手动将 `MyStruct` 加入 GC，可以在类内部声明一个静态函数 `static void AddReferencedObjects(UObject* InThis, FReferenceCollector& Collector);`


```cpp
UCLASS()
class ATestCharacter : public ACharacter
{
    GENERATED_BODY()
public:
    FMyTestStruct MyStruct; // 没有声明 UPROPERTY()

    // 
    static void AddReferencedObjects(UObject* InThis, FReferenceCollector& Collector);
};
```

当 UBT 和 UHT 会识别到这个函数，并添加到一个表中，给后续 GC 系统进行 GC 时，除了遍历使用宏声明的部分之外，还会调用该函数，因此可以在该函数中**手动将这个属性添加到 GC 中，或者是自定义 GC**

实现如下：

```cpp
void ATestCharacter::AddReferencedObjects(UObject* InThis, FReferenceCollector& Collector)
{
    Super::AddReferencedObjects(InThis, Collector);
    ATestCharacter* This = CastChecked<ATestCharacter>(InThis);
    Collector.AddReferenceObject(This->MyStruct.Obj); // 手动添加，这里传入的是一个指针引用
}
```

## 前提：结构体中的属性都被 UPROPERTY 修饰

### 手动添加全部属性到 GC

上边方式只适合处理 Struct 结构不复杂的情况，如果 Struct 存在很多属性甚至是嵌套结构，手动一个个添加不现实

并且可能这个 Struct 会在业务过程中频繁修改，我们不可能每一次修改都对应在这个函数中手动添加一次。甚至是如果这个属性是 private，也无法通过这种方式进行访问

这里需要注意**USTRUCT () 修饰的这个结构体信息已经被添加到反射系统中了，但是在这个类中我们没有对 MyStruct 对象用 UPROPERTY () 修饰，也就是说反射系统知道有这么一个 FMyTestStruct 的结构体的信息，但是不知道有这么一个 MyStruct 对象的存在**


```cpp
void ATestCharacter::AddReferencedObjects(UObject* InThis, FReferenceCollector& Collector)
{
    Super::AddReferencedObjects(InThis, Collector);
    ATestCharacter* This = CastChecked<ATestCharacter>(InThis);
    {
        FVerySlowReferenceCollectorArchiveScope Scop(Collector.GetVerySlowReferenceCollectorArchive(), This);
        FMyStruct::StaticStruct()->SerializeBin(Scop.Archive(), &This->MyStruct); // 手动序列化/GC 了该对象
    }
}
```

### 实现存放任意一种结构体（不被 UPROPERTY 修饰）的情况下，将其添加到 GC 中

分析之前手动序列化实现 GC 的过程：

```cpp
FMyStruct::StaticStruct()->SerializeBin(Scop.Archive(), &This->MyStruct);
```

利用包含 FMyStruct 结构体信息的 `UScriptStruct` 这个类，调用其中的序列化方法，将一个 FMyStrcut 类型的结构体 `This->MyStruct` 传入 `Scop.Archive()` 中，从而实现 GC。所以我们可以这么设置：

```cpp
UCLASS()
class ATestCharacter : public ACharacter
{
    GENERATED_BODY()

    UScriptStruct* StructType = nullptr;
    void* AnyStruct = nullptr;
public:
    // ...
};
```

一个 `UScriptStruct*` 类型指针获取结构体的信息，`void* AnyStruct` 来接受这个结构体，`SerializeBin` 的第二个参数类型就是 `void*`，查看源码发现这样一条说明：`Data		ointer to the location of the beginning of the struct's property data`，也就是只需要保证这个指针指向的就是这个结构体的起始位置即可，因为具体的类型信息已经在 `UScriptStruct` 之中，所以之前调用 `FMyStruct::StaticStruct()` 说明已经有了结构体的信息。

那么可以修改之前的序列化方式，利用 `UScriptStruct` 的 `SerializeBin` 方法将这个对象添加到 GC 中

```cpp
void ATestActor::AddReferencedObjects(UObject* InThis, FReferenceCollector& Collector)
{
	Super::AddReferencedObjects(InThis, Collector);
	ATestActor* This = CastChecked<ATestActor>(InThis);

	// 手动 GC
	//Collector.AddReferencedObject(This->MyStruct.Obj);
	// 手动序列化
	{
		FVerySlowReferenceCollectorArchiveScope Scope(Collector.GetVerySlowReferenceCollectorArchive(), This);
		FMyStruct::StaticStruct()->SerializeBin(Scope.GetArchive(), &This->MyStruct);
	}

	// 手动 GC
	// 并且支持任意一个 USTRCUT 修饰的结构体
	if(This->StructType && This->AnyStruct)
	{
		FVerySlowReferenceCollectorArchiveScope Scope(Collector.GetVerySlowReferenceCollectorArchive(), This);
		This->StructType->SerializeBin(Scope.GetArchive(), &This->AnyStruct);
	}
	// 这种方式能够将 class 中没有使用 UPROPERTY 修饰的 USTRUCT 添加到 GC 中
	// 但同样的，USTRUCT 中也可能存在没有使用 UPROPERTY 修饰的情况
}
```

## 如果 Struct 中存在没有被 UPROPERTY 修饰的属性

### 给 USTRUCT 添加自定义 GC 方法

上边的方法是利用结构体类型生成的 UScriptStruct 中的序列化方法将结构体对象添加到了 GC 中，但是如果这个结构体中同样存在**没有被 UPROPERTY 修饰的属性**，那这个属性是不会出现在序列化信息中的，也就是上边哪种方法只支持那个被 UPROPERTY 修饰过的属性。

所以，这里就着手解决这个问题，和 UCLASS 的方式一样，都需要**自定义它的 GC 实现方式**，即手动将这个属性添加到 GC 中


```cpp
USTRUCT(BlueprintType)
struct FMyStruct
{
	GENERATED_BODY()

	UPROPERTY()
	UObject* Obj = nullptr;

	UObject* Obj2 = nullptr;

	// UE 的 GC 都是基于 UObject 开始遍历的，所以必须要把这个结构体放到一个 UObject 之中
    // 被遍历到之后（加 UPROPERTY 或之前自定义 GC 的方式）才会执行这个函数，执行这个 struct 的自定义 GC 操作
	void AddStructReferencedObjects(FReferenceCollector&);
};

// TODO: 注意，这里要将对应的 flag 设置为真，这样 GC 遍历到之后才会去执行这个函数
// 给结构体实现自定义 GC 方法
template<>
struct TStructOpsTypeTraits<FMyStruct> : public TStructOpsTypeTraitsBase2<FMyStruct>
{
	enum
	{
		WithAddStructReferencedObjects = true
	};
};

// 实现和 UCLASS 中的那个一样
void FMyStruct::AddStructReferencedObjects(FReferenceCollector& Collector)
{
	Collector.AddReferencedObject(Obj2);
}
```

这里我增加了一个模板用来判断这个结构体中是否含有这个自定义的 GC 方法：

```cpp
template<typename T>
struct THasFunctionAddStructReferencedObjects
{
	template<typename U, void(T::* pF)(FReferenceCollector&) = &T::AddStructReferencedObjects>
	static constexpr bool Check(U*) { return true; }

	static constexpr bool Check(...) { return false; }

	enum
	{
		value = Check(static_cast<T*>(nullptr))
	};
};
constexpr bool test = THasFunctionAddStructReferencedObjects<FMyStruct>::value;
```

把 test 赋值过去就好

此时，**我们只是给这个 struct 设置了我们自定义的 GC 方式，表明要对这个 obj 2 进行指定的 GC 操作**，但是还有一个问题：obj 2 没有被序列化

在之前将 struct 序列化然后添加到了 GC 中，但 obj 2 没有 UPROPERTY 修饰，所以 obj 2 不会参与这个序列化，也就仍然没办法参与到 GC 当中

**当然，如果给这个 MyStruct 加上 UPROPERTY 修饰，GC 会通过反射系统拿到这个属性，并根据之前设置好的 flag 判断是否执行结构体自定义的 GC**

另外，如果我们知道这个结构体的类型，比如之前我们定义的 `FMyStrcut`，其实可以直接调用（这里其实就不需要那个 flag 了）：

```cpp
void ATestActor::AddReferencedObjects(UObject* InThis, FReferenceCollector& Collector)
{
	Super::AddReferencedObjects(InThis, Collector);
	ATestActor* This = CastChecked<ATestActor>(InThis);

	{
		FVerySlowReferenceCollectorArchiveScope Scope(Collector.GetVerySlowReferenceCollectorArchive(), This);
		FMyStruct::StaticStruct()->SerializeBin(Scope.GetArchive(), &This->MyStruct);

        // 知道类型可以直接手动调用
        This->MyStruct->AddStructReferencedObjects(Collector);
	}
}
```

但如果是任意一个 USTRUCT 修饰的结构体，我们是用了 `UScriptStruct* StructType` 这么一个变量来代表这个结构体的类型，只有当运行的时候我们才能知道这个类型到底是什么，也不知道这个类型里到底有没有这个自定义实现的函数，也就是无法直接在这里调用这个 `AddStructReferencedObjects`

解决办法：**可以直接查看 `AddStructReferencedObjects` 的实现方式，将这部分逻辑拿过来进行修改，从而实现手动版调用**

```cpp
void ATestActor::AddReferencedObjects(UObject* InThis, FReferenceCollector& Collector)
{
	Super::AddReferencedObjects(InThis, Collector);
	ATestActor* This = CastChecked<ATestActor>(InThis);
	{
		FVerySlowReferenceCollectorArchiveScope Scope(Collector.GetVerySlowReferenceCollectorArchive(), This);
		FMyStruct::StaticStruct()->SerializeBin(Scope.GetArchive(), &This->MyStruct);
        This->MyStruct->AddStructReferencedObjects(Collector); // 知道类型可以直接手动调用
	}
    // 不知道类型的话会麻烦一点
    if(This->AnyStruct && This->StructType)
    {
        FVerySlowReferenceCollectorArchiveScope Scope(Collector.GetVerySlowReferenceCollectorArchive(), This);
        // UPROPERTY 属性的 GC 方式相同
        This->StructType->SerializeBin(Scope.GetArchive(), This->AnyStruct); 
        // 对于没有 UPROPERTY 的属性
        Collector.AddReferencedObject(This->StructType);
        if(This->StructType->StructFlags && STRUCT_AddStructReferencedObjects)
        {
            UScriptStruct::ICppStructOps* CppStructOps = This->StructType->GetCppStructOps();
            auto FunctionPtr = CppStructOps->AddStructReferencedObject();
            FunctionPtr(This->AnyStruct, Collector);
        }
    }
}
```

### 别忘了 StructType 同样要加入 GC

看上边实现。当然也可以直接加 UPROPERTY


## 如何让蓝图设置/访问这个任意的 struct 属性

### Set 函数的实现

首先可以确定这个 set 函数的形式

```cpp
UFUNCTION(BlueprintCallable, )
void BPSetAnyStructValue();
```

现在的问题是，要设置这个属性，必然要传入一个参数，但这个参数类型应该怎么设置？

这里涉及到了泛型蓝图节点，通配符的知识，参考链接：
- [UE4C++ 泛型蓝图节点](https://blog.csdn.net/weixin_56946623/article/details/123982505)
- [UE 反射实现分析：反射代码生成（一）](https://imzlp.com/posts/9780/)

总之就是，可以在 meta 元数据说明符中指明：`meta = (CustomStructureParam = "ParamName")`，并将参数类型设置为 `const int32& ParamName` 作为一个输入类型的泛型参数，`int32& ParamName` 会作为一个输出类型的泛型参数，这里的 `int32` 的类型只代表一个占位符，可以任意变换形式。也可以标记多个占位符，变量要用逗号隔开，`CustomStructureParam = "Value1, Value2, Value3"`

以及另一个知识：`CustomThunk`，这个标记表示不需要 UHT 自动生成这个 UFUNCTION 的 exec 版本，而是手动实现

对于这个 exec 版本的函数如何实现，可以参考 UHT 自动生成的版本进行修改，路径为：`ProjectName\Intermediate\Build\Win64\UE4Editor\Inc\ProjectName\ThisFileName.gen.cpp`

这里直接给出最后的版本：

```cpp
UFUNCTION(BlueprintCallable, CustomThunk, meta=(CustomStructureParam = "Other"))
void BPSetAnyStructValue(const int32& Other);
DECLARE_FUNCTION(execBPSetAnyStructValue)
{
	Stack.StepCompiledIn<FProperty>(nullptr);
	uint8* DataAddress = Stack.MostRecentPropertyAddress;
	FStructProperty* FSP = Cast<FStructProperty>(Stack.MostRecentProperty);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->SetAnyStructValue(FSP->Struct, DataAddress);
	P_NATIVE_END;
}
```

这里我们参照 exec 的实现方式，作为一个代理函数，在其内部调用真正进行设置的函数，实现如下：

```cpp
// 设置这个 AnyStruct
void SetAnyStructValue(UScriptStruct* Struct, void* Data)
{
	if (Struct == StructType) // 输入参数和属性的类型一致
	{
		if (!AnyStruct) // 判断 AnyStruct 是否为空
		{// 如果是空的，需要初始化一下
			AnyStruct = FMemory::Malloc(StructType->GetStructureSize());
			StructType->InitializeStruct(AnyStruct);
		} // 如果不为空，因为类型一样，占用空间一样，所以直接拷贝
		StructType->CopyScriptStruct(AnyStruct, Data);
	}
	else // 如果不一致
	{
		if (!StructType) // 首先判断类型对象是否是空的
		{ // 空的类型对象就给他赋值，并对这个 AnyStruct 初始化
			StructType = Struct;
			AnyStruct = FMemory::Malloc(StructType->GetStructureSize());
			StructType->InitializeStruct(AnyStruct);
			StructType->CopyScriptStruct(AnyStruct, Data);
		}
		else // 不空，并且类型不一致
		{
			if (AnyStruct) // 要考虑 AnyStruct 是否已经有数据
			{
				StructType->DestroyStruct(AnyStruct); // 有就需要根据类型信息进行销毁
				FMemory::Free(AnyStruct); // 记得释放，因为两种类型的空间大小很可能不同
			}// 接下来就是常规操作了
			StructType = Struct; // 类型更新
			AnyStruct = FMemory::Malloc(StructType->GetStructureSize()); // 申请空间
			StructType->InitializeStruct(AnyStruct); // 初始化空间
			StructType->CopyScriptStruct(AnyStruct, Data); // 拷贝数据
		}
	}
}
```

整体思路就是：
- 从栈上拿到输入参数的地址
  - `Stack.StepCompiledIn<FProperty>(nullptr);`
  - `uint8* DataAddress = Stack.MostRecentPropertyAddress;` 这里拿到地址
- 获取这个参数的类型的对象
  - `FStructProperty* FSP = Cast<FStructProperty>(Stack.MostRecentProperty);`
- 用这个输入的参数的类型以及地址去设置类中的这个类型对象 `StructType` 和具体的属性 `AnyStruct`
- 这里涉及到一系列逻辑判断，见上方代码注释


### Get 函数的实现

和 set 函数的实现逻辑一样，都是自己重新写一个 exec 版本

```cpp
UFUNCTION(BlueprintCallable, CustomChunk, meta=(CustomStructureParam = "Other"))
bool BPGetAnyStruct(int32& Other); // int32& 会被设置成蓝图的右侧节点
DECLARE_FUNCTION(execBPGetAnyStruct)
{
	Stack.StepCompiledIn<FProperty>(nullptr);
	uint8* DataAddress = Stack.MostRecentPropertyAddress;
	FStructProperty* FSP = Cast<FStructProperty>(Stack.MostRecentProperty);
	P_FINISH;
	P_NATIVE_BEGIN;
	if(DataAddress && FSP && FSP->Struct == StructType)
	{
		*(bool*)Z_Param_Result = P_THIS->GetAnyStruct(DataAddress);
	}
	else
	{
		*(bool*)Z_Param_Result = false;
	}
	P_NATIVE_END;
}
bool GetAnyStruct(void* DataAddress)
{
	StructType->InitializeStruct(DataAddress);
	StructType->CopyScriptStruct(DataAddress, AnyStruct);
	return true;
}
```

原理和 set 差不多，只是利用 `int32&` 类型将节点放在右边，然后增加了返回值利用 `Z_Param_Result` 来接收