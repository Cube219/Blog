+++
author = "Cube219"
categories = ["2019", "EASTL"]
date = "2019-06-01"
description = ""
featured = ""
featuredalt = ""
featuredpath = ""
linktitle = ""
title = "EASTL SSO(short string optimization)"
type = "post"

+++

최근 [EASTL](https://github.com/electronicarts/EASTL)에 있는 string을 쓰면서 내부에 구현된 최적화 방법을 발견했는데, 이게 상당히 흥미로웠다.

-----

## SSO(short string optimization)

string은 보통 문자열 데이터를 담기 위해 동적 할당을 한다. 그래서 여러 string들을 합치고 빼다 보면 heap 메모리 할당/해제가 빈번하게 발생한다.

이러한 문제를 줄이기 위해, 짧은 문자열인 경우에는 동적 할당 대신에 동적 할당을 하는데 필요한 공간에다가 문자열을 넣어서 할당을 피하는 구조로 되어있다.

```cpp
struct Layout
{
    union
    {
        HeapLayout heap;
        SSOLayout sso;
        RawLayout raw;
    };
    
    ...
```

이렇게 Heap을 쓰는 경우에 사용하는 `HeapLayout`, SSO를 쓰는 경우에 사용하는 `SSOLayout`, 그리고 그냥 메모리 상태를 보여주는 `RawLayout `이 3가지가 `union`으로 묶여 있다.

```cpp
struct HeapLayout
{
    value_type* mpBegin;
    size_type mnSize;
    size_type mnCapacity;
};
```

Heap을 이용할 경우에는 할당받은 포인터(`mpBegin`), 크기(`mnSize`) 그리고 할당 크기(`mnCapacity`) 정보가 필요하다.

이럴 경우, 64비트 아키텍처 기준으로는 총 8+8+8=24byte가 사용된다.

```cpp
template <typename CharT, size_t = sizeof(CharT)>
struct SSOPadding
{
    char padding[sizeof(CharT) - sizeof(char)];
};

template <typename CharT>
struct SSOPadding<CharT, 1>
{
    // template specialization to remove the padding structure to avoid warnings on zero length arrays
    // also, this allows us to take advantage of the empty-base-class optimization.
};

// The view of memory when the string data is able to store the string data locally (without a heap allocation).
struct SSOLayout
{
    enum : size_type { SSO_CAPACITY = (sizeof(HeapLayout) - sizeof(char)) / sizeof(value_type) };

    // mnSize must correspond to the last byte of HeapLayout.mnCapacity, so we don't want the compiler to insert
    // padding after mnSize if sizeof(value_type) != 1; Also ensures both layouts are the same size.
    struct SSOSize : SSOPadding<value_type>
    {
        char mnRemainingSize;
    };

    value_type mData[SSO_CAPACITY]; // Local buffer for string data.
    SSOSize mRemainingSizeField;
};
```

SSO에서는 이 24byte를 활용해서 문자열을 집어넣는다. 남은 문자를 저장하기 위해 최소 1byte를 남겨두고 나머지를 문자열을 담을 공간으로 활용한다.

여기서는 남은 문자열 크기(`mnRemainingSize`)를 padding까지 해서 무조건 `HeapLayout`의 마지막 byte에 두는데, 이는 지금 Heap인지 SSO인지 확인하는데 이 byte를 쓰기 때문이다.

```cpp
#ifdef EA_SYSTEM_BIG_ENDIAN
    // Big Endian use LSB, unless we want to reorder struct layouts on endianness, Bit is set when we are in Heap
    static constexpr size_type kHeapMask = 0x1;
    static constexpr size_type kSSOMask  = 0x1;
#else
    // Little Endian use MSB
    static constexpr size_type kHeapMask = ~(size_type(~size_type(0)) >> 1);
    static constexpr size_type kSSOMask  = 0x80;
#endif

...

inline bool IsHeap() const EA_NOEXCEPT { return !!(sso.mRemainingSizeField.mnRemainingSize & kSSOMask); }

...

// Largest value for SSO.mnSize == 23, which has two LSB bits set, but on big-endian (BE)
// use least significant bit (LSB) to denote heap so shift.
inline size_type GetSSOSize() const EA_NOEXCEPT
{
#ifdef EA_SYSTEM_BIG_ENDIAN
    return SSOLayout::SSO_CAPACITY - (sso.mRemainingSizeField.mnRemainingSize >> 2);
#else
    return (SSOLayout::SSO_CAPACITY - sso.mRemainingSizeField.mnRemainingSize);
#endif
}

inline void SetSSOSize(size_type size) EA_NOEXCEPT
{
#ifdef EA_SYSTEM_BIG_ENDIAN
    sso.mRemainingSizeField.mnRemainingSize = (char)((SSOLayout::SSO_CAPACITY - size) << 2);
#else
    sso.mRemainingSizeField.mnRemainingSize = (char)(SSOLayout::SSO_CAPACITY - size);
#endif
}

...

inline void SetHeapCapacity(size_type cap) EA_NOEXCEPT
{
#ifdef EA_SYSTEM_BIG_ENDIAN
    heap.mnCapacity = (cap << 1) | kHeapMask;
#else
    heap.mnCapacity = (cap | kHeapMask);
#endif
}

inline size_type GetHeapCapacity() const EA_NOEXCEPT
{
#ifdef EA_SYSTEM_BIG_ENDIAN
    return (heap.mnCapacity >> 1);
#else
    return (heap.mnCapacity & ~kHeapMask);
#endif
}
```

지금 상태가 Heap인지 SSO인지는 특이하게 판단한다. Layout의 마지막 byte에 masking bit를 넣어서 판단하는데,  little endian이랑 big endian이랑 넣는 위치가 다르다. 

little endian인 경우 해당 byte의 [MSB](https://ko.wikipedia.org/wiki/최상위_비트)에다가 넣는다. 이경우 MSB가 1이면, SSO 입장에서는 `mnRemainingSize`가 음수이기 때문에 이런 상황이 나올 수가 없고, Heap 입장에서는 저 bit가 `mnCapacity`에선 매우 큰 값을 나타내기 때문에 masking에 써도 괜찮다.

big endian인 경우 해당 byte의 [LSB](https://ko.wikipedia.org/wiki/최하위_비트)에다가 넣고, 실제 값은 왼쪽으로 shifting해서 넣는다. 여기서 SSO의 `mnRemainingSize`는 왼쪽으로 2번 shifting하는데 왜 그러는지는 모르겠다. 1번만 해도 될 것 같은데?

굳이 `bool`변수를 안 넣고 이렇게 masking bit를 넣는 것은 공간 낭비를 최소화하려고 그런게 아닐까 생각한다.

```cpp
struct Layout
{
    ...
        
    inline value_type* BeginPtr() EA_NOEXCEPT { return IsHeap() ? HeapBeginPtr() : SSOBeginPtr(); }
    
    ...
        
    inline value_type* EndPtr() EA_NOEXCEPT { return IsHeap() ? HeapEndPtr() : SSOEndPtr(); }
    
    ...
```

해당 주소에 접근 할 때는 현재 상태를 확인하고 이에 맞는 포인터를 반환한다. 여기서 if 분기문을 거치기 때문에 [branch prediction](https://ko.wikipedia.org/wiki/분기_예측)이 실패할 경우 약간의 성능 오버헤드가 발생하게 된다.

## 결론

짧은 문자열들이 여러 개가 있을 경우 위의 최적화가 유용하지만, 주소에 접근을 할 때 확인을 하는 작업이 추가되기 때문에 그에 따른 성능 오버헤드가 생길 수도 있다. 그래도 할당/해제하는 것보다는 빠르지 않을까?
