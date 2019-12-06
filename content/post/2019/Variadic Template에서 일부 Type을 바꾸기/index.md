+++
banner = ""
categories = ["C++"]
date = "2019-05-12"
description = ""
images = []
menu = ""
tags = []
title = "Variadic Template에서 일부 Parameter Type을 바꾸기"
slug = "change-some-parameter-types-in-variadic-template"
+++

개인적으로 만들고 있는 게임 엔진에서 문자열 formatting은 [{fmt}](https://github.com/fmtlib/fmt) 라이브러리를 사용하고 있다.

이게 예전 버전에서는 UTF-16 / 32(`char16_t`, `char32_t`)가 지원이 안 되어서 소스코드를 수정해서 쓰고 있었지만, C-style 문자열(`const char16_t*`, ...)을 parameter로 넘기면 컴파일 오류가 발생한다.

고치려고 했지만 너무 복잡할 것 같아서 그냥 쓰다가, 최근 버전을 보니까 자동으로 UTF-16 / 32도 지원하는 것 같아서 라이브러리를 업데이트 했다.

업데이트를 하고 Custom formatting도 설정하고 빌드를 하는데... 컴파일 오류가 난다.

찾아보니까 그냥 character랑 wide character랑 섞어서 쓰는 것을 [금지](https://github.com/fmtlib/fmt/pull/606)하고 있는데, 이게 `char16_t`와 `char32_t`도 적용이 되는 모양이다.

그래서 소스코드 수정할까 생각도 해봤지만, 그냥 wrapper 함수를 만들어서 다른 character이면 변환해서 호출해야겠다고 생각했다.

```cpp
template <typename S, typename ...Args>
inline eastl::basic_string<typename fmt::v5::char_t<S>::type> Format(const S& format_str, const Args& ...args)
{
    return fmt::format(format_str, convert_string(args)...);
}
```

 `fmt::format`함수를 참조해서 wrapper를 만들었다.

각 parameter마다 `convert_string`함수를 거쳐서 특정 type에서는 변환해 다른 타입으로 반환하게 하면 된다. 이제 구현만 하면 되는데... 여기서 문제가 발생한다.

1. 해당 type이 문자열인가? 문자열인 경우, formatting 문자열이랑 같은 type인가?
2. 위의 상황에는 다른 type을, 아닐 경우 기존의 type을 반환해야 하는데 이게 가능한가?

여러가지 방법들을 찾아보다가, [`std::enable_if`](https://en.cppreference.com/w/cpp/types/enable_if)를 이용하면 가능할 것 같았고, 실제로 구현을 했다.

enable_if에 관한 내용은 [다음](https://github.com/jwvg0425/ModernCppStudy/wiki/SFINAE)을 참고하면 될 것 같다.

------

## convert_string 함수 구현

convert_string함수는 특정 type을 parameter로 받으면 다른 type으로 변환해 반환하고, 아니면 그대로 값을 반환하는 함수로 만들어야 한다. 위와 같은 상황에서는 3가지 경우가 있다.

### 1. String이 아닌 경우

```cpp
// Not a string
template <typename S, typename T>
inline typename std::enable_if<!fmt::v5::internal::is_string<T>::value, const T&>::type
    convert_string(const T& value)
{
    return value;
}
```

`is_string<T>`는 해당 타입이 string인 경우 true가 되는 type traits이다. 내부적으로는 `string_view`를 만들 수 있는지로 확인한다.

간단하게, string이 아닌 경우 parameter의 type으로 그냥 반환한다.	

### 2. String이나, formatting string이랑 같은 type인 경우

```cpp
// Same string type
template <typename S, typename T>
inline typename std::enable_if<
fmt::v5::internal::is_string<T>::value &&
    IS_SAME_STR_TYPE(S, T), const T&>::type
    convert_string(const T& value)
{
    return value;
}
```

같은 type인지는 `IS_SAME_STR_TYPE` 매크로에서 확인한다. 구현 내용은 생략한다.

> `IS_SAME_STR_TYPE` 구현은 [여기](https://github.com/Cube219/CubeEngine/blob/master/Source/Base/Base/Format.h)에서 볼 수 있다.

역시 이 경우에도 parameter의 type으로 그냥 반환한다.

### 3. String이고, formatting string이랑 다른 type인 경우

```cpp
// Different string type
template <typename S, typename T>
inline typename std::enable_if<
fmt::v5::internal::is_string<T>::value&&
    !IS_SAME_STR_TYPE(S, T), fmt::v5::basic_string_view<S>>::type
    convert_string(const T& value)
{
    auto& tempStr = GetTempString<S>(value);
    return tempStr;
}
```

이 경우에는, `enable_if`에서 2번때 template parameter가 다른 것을 볼 수가 있다. `const T&` 대신에 `basic_string_view<S>`를 반환하게 만들어서 다른 type을 반환하게 만들었고, 내부에서는 변환한 임시 string을 반환한다.

------

## 결론

위의 경우처럼 variadic template에서 일부 parameter type을 바꾸고 싶은 경우, 특정 상황에서 type을 바꾸는 converter 함수를 만들고 각 parameter마다 해당 함수를 호출하게 만들면 된다.

converter 함수는 `std::enable_if`를 활용해 특정 상황에서 다른 type을 반환하게 만들면 된다.

