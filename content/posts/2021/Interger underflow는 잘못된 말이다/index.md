---
title: "Integer underflow는 잘못된 말이다"
slug: "integer-underflow-is-a-wrong-sentence"
date: "2021-03-01T23:09:12+09:00"
categories: ["Programming", "Etc"]
banner: "images/banner.png"
description: ""
tags: []
---

최근 톡방을 보다가 underflow라는 단어가 나왔다. 정수가 음수 범위를 넘어갈 때 underflow라고 설명하던데, 이게 잘못된 말이다고는 알고 있었다. 하지만 underflow가 막연히 정수에는 없고 실수에만 있는 개념이다는 것만 알고, 정확히 뭔지는 잘 몰랐다. 그래서 찾아봤다.

# Underflow in float

Underflow를 설명하기 전에, 먼저 **float** (floating point, 부동 소수점)가 컴퓨터에서 어떻게 표현되는지 알아야 한다. 실수 값을 표현할 때는 `부호 * 지수 * 가수`로 나누고, 이 3부분을 일정 비트 할당해서 표현한다. 예를 들어 `32bit float`의 경우 부호에 `1bit`, 지수에 `8bits`, 가수에 `23bits`를 할당해서 표현한다. 그렇기 때문에 실수의 모든 값을 표현할 수 없고 지수+가수에 의해 정의된 간격 근처로만 표현 가능하다. (흔히 말하는 소수점 오차가 이 이유 때문에 발생한다.)

Underflow라고 하면 보통 arithmetic underflow를 말하는데, 위키피디아에 있는 정의는

> The term **arithmetic underflow** (also **floating point underflow**, or just **underflow**) is a condition in a computer program where the **result of a calculation** is a number of **smaller absolute value** than the computer **can** actually **represent in memory** on its central processing unit (CPU).

즉, **계산의 절대값**이 **표현**할 수 있는 **가장 작은 값**보다 **작을 때** 발생한다고 적혀있다.

예를 들어 지수의 최소값이 -98이고 가수가 3자리로 정의되어있다고 하자. 이때 `x = 6.87 * 10^-97`, `y = 6.81 * 10^-97`라는 수들은 위의 정의에 만족하는 수들이다. 하지만 이상한 특징이 있는데, `x != y`인데 `x - y = 0`이 된다는 점이다. 이는 `x - y = 0.06 * 10^-97 = 6.00 * 10^-99`라서 정규화 된 수로 표현하기에는 너무 작아서 0이 되어버리기 때문이다. 이 현상을 **Underflow**라고 부른다.

이 현상을 완화하기 위해 IEEE 754에서는 만약 지수의 값이 최소값이면, 가수는 정규화를 하지 않고 그대로 두는 예외를 추가했다. 이를 **비정규화된 수(Denormalized numbers)** 라고 부른다. 즉, 위의 값도 `6.00 * 10^-99`으로 정규화하지 않고 `0.60 * 10^-98` 그대로 두는 것이다. 이럴 경우 정규화된 수보다 더 작은 수들도 표현할 수 있어서 underflow현상을 어느정도 막아줄 수 있다. 이러한 동작을 **점진적 underflow(Gradual underflow)** 라고 부른다.

# Underflow in integer?

하지만 이러한 현상은 정수에서는 발생하지 않는다. 일반적으로 8bit 정수인 경우, 127에서 1을 더해 -128이 되는 것을 overflow,  -128에 1을 빼면 127이 되는 것을 underflow라고 말하는 경우가 많지만, 후자의 경우도 **overflow**라고 말해야 한다.  둘다 표현할 수 있는 수 범위를 넘어가는 경우이기 때문이다. 실제로 CPU안에 있는 [overflow flag](https://en.wikipedia.org/wiki/Overflow_flag)에서도 두 경우 다 1로 set된다.

> an **integer overflow** occurs when an arithmetic operation attempts to create a numeric value that is **outside of the range** that can be represented with a given number of digits – **either higher** than the maximum or **lower** than the minimum representable value.

Wikipedia에서도 integer overflow의 정의를 **큰쪽/작은쪽** 둘 다 포함한다고 적혀있다. 따라서 integer underflow라는 말은 잘못된 말이고, 두 경우 다 overflow라고 불러야 맞다.

하지만 검색해보면 수많은 곳에서 위와 같은 현상을 underflow라고 말하는 걸 발견할 수 있다. 의미야 통하겠지만, 그래도 단어의 정의들은 정확하게 아는 것이 좋지 않을까...

# 참고한 사이트

[Arithmetic underflow - Wikipedia](https://en.wikipedia.org/wiki/Arithmetic_underflow)

[Integer overflow - Wikipedia](https://en.wikipedia.org/wiki/Integer_overflow)

[모든 컴퓨터 과학자가 알아야 할 부동 소수섬의 모든 것(What Every Computer Scientists Should Know About Floating Point Arithmetic)](https://modoocode.com/199)

[Unsigned integer underflow in C - Stack Overflow](https://stackoverflow.com/questions/50900370/unsigned-integer-underflow-in-c)