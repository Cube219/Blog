---
title: "Competitive Programming을 위한 코딩 스타일"
slug: "coding-style-for-competitive-programming"
date: "2022-01-31T15:11:27+09:00"
categories: ["Programming", "Etc"]
banner: "images/banner.png"
description: ""
tags: []
---

Competitive Programming은 서로 누가 빨리 문제를 푸냐 경쟁하기 때문에, 빠르게 코드를 짜는 것이 중요하다. 그래서 일반적인 코드 스타일과는 다른 코드 스타일들을 볼 수 있다. 전역변수를 쓰고, 대부분의 내용을 main 함수에 넣고, 미리 매크로를 만들어서 코드를 쓰는 시간을 단축시키기도 한다.

이중에서 본인이 CP를 할 때 쓰는 코딩 스타일을 정리해 써본다.

-----

# 전역 변수 사용 X

CP를 하는 사람들은 보통 전역변수를 많이 사용한다. 기본값으로 0으로 초기화가 되고, 다른 함수에서 바로 접근이 가능하기 때문이다.
하지만 본인은 가능하면 전역 변수를 안 쓰고 지역 변수를 필요할 때마다 정의해서 쓰려고 한다. 그 이유는

* 전역 변수는 코드 윗부분에 정의되어 있기 때문에, 코드를 작성하는 도중 새로운 변수를 추가하려면 코드 위로 올라가서 추가하고 다시 내려가야 한다. 지역 변수만 쓰면 이러한 스크롤을 줄일 수 있다.
* 특정 기능을 하는 변수들이 모여있어서 가독성이 증가한다. 오류가 있을 것이라고 추정되는 구간만 집중적으로 볼 수 있어서 빠르게 수정을 할 수 있다. 밑에서 설명하는데, 람다를 쓰면 함수까지도 그때그때 정의해서 모을 수 있다.

하지만 지역 변수를 쓰면 배열 선언이 힘들어지고, 함수가 복잡해진다. 배열을 지역 변수로 선언하면 스택 영역에 배열이 만들어져서 함수 호출에 불이익을 받게 된다 (명령어 캐시 미스가 발생하기 쉬워지기 때문). 또한 함수를 호출할 때 쓸 변수들을 전부 파라미터로 넘겨야 한다. 이러한 단점을 해결하기 위해서 아래 두 가지 방식을 이용한다.

## 배열 대신에 vector

배열 `int a[100]`대신에 `vector<int> a(100)`를 사용하는 것이다. vector는 내부에서 배열을 힙 영역에 할당하기 때문에 위의 문제를 해결할 수 있다. 이것 말고도, CP에서 vector를 쓰는 것은 좋은 이점들이 있다.

1. 배열 크기 선언에 신경을 안 써도 된다.

그냥 배열을 사용하기 위해서는 문제마다 input 데이터의 제한을 보고 수동으로 넣어야 하는데, 이 과정에서 실수가 발생할 수 있다. n 제한이 100,000인데 입력을 n * 2로 받는 경우, 습관대로

```cpp
int a[100001];
...
for(int i = 0; i < n * 2; ++i) cin >> a[i];
```

코드를 작성하면 n이 작은 경우에는 잘 돌아간다. 하지만 n이 50,000보다 커지면 a배열 바깥쪽을 접근하게 되고, 보통은 undefined behavior라서 원하는 대로 돌아가지 않는다. 운이 좋다면 runtime error가 뜨겠지만, wrong answer가 뜬다면 로직이 잘못됬나 확인하면서 삽질할 가능성이 높다. 대신에 vector를 사용한다면

```cpp
vector<int> a(n * 2);
for(auto& v : a) cin >> v;
```

이렇게 n의 크기에 따라 알맞게 크기를 조절한다. 이제 배열 크기 선언에 신경을 안 써도 된다.
> 추가적으로 저렇게 range-based for를 써서 코드를 단축시킬 수도 있다.

2. Debug 모드에서 out of index를 체크할 수 있다.

vector를 쓰면 접근할 때마다 out of index를 체크하기 때문에 배열 바깥 범위에 접근하는 것을 쉽게 알 수 있다. MSVC에서는 Debug 모드에서 이 기능이 기본으로 켜져있고, gcc에서는 _GLIBCXX_DEBUG 매크로를 추가하면 된다. 이 기능을 키면 당연히 속도가 느려지기 때문에 큰 데이터를 테스트할 때는 비활성화 해야한다.

3. DP 토글링(이 이름이 맞나?)할 때 편하다

DP 토글링이란 DP값을 채울 때 바로 이전 값만 확인하는 경우, 배열을 2개만 쓰고 서로 번갈아가면서 써서 메모리를 아끼는 기법이다. 이때 vector를 사용하면 연산하고 나서 마지막에

```cpp
swap(dp0, dp1);
```

만쓰면 된다. swap할 때 vector 내부에 할당된 포인터만 바꾸기 때문에 바로 된다.

물론 전역 변수 배열과는 달리 vector는 따로 초기화를 해줘야 하기 때문에 조금 느릴 순 있다. 하지만 속도 차이는 거의 없어서 무시할 만하다.

또다른 단점으로는 3차원 이상의 배열을 선언하기가 불편하다는 점이다. 2차원 까지는

```cpp
vector<vector<int>> g(n, vector<int>(m, 0));
```

이렇게 초기화하면 되지만 3차원 이상은
```cpp
vector<vector<vector<int>>> d(a, vector<vector<int>>(b, vector<int>(c, 0)));
```

이렇게 길이가 점점 길어져서 불편하다. 그래서 본인은 3차원 이상은 그냥 배열을 쓰거나

```cpp
vector<vector<vector<int>>> d(a);
for(auto& v1 : d) {
    v1.resize(b);
    for(auto& v2 : d) {
        v2.resize(c, 0);
    }
}
```

이렇게 for문을 써서 초기화한다.

## 함수 대신에 람다

위에서 말했듯이 지역 변수만 사용하면 함수를 사용하기가 불편해진다. 이것을 해결하기 위해 람다의 캡처 기능을 사용한다.

```cpp
int a, b;
...
auto sum = [&](int c) {
  return a + b + c;
};
...
cout << sum(10);
```

람다에 있는 `[&]`가 람다 위에 있는 변수들을 레퍼런스로 캡쳐한다는 뜻이다. 그래서 람다 안에서 캡쳐한 변수들을 그냥 사용하면 된다.

재귀 함수를 람다로 구현하려면 조금 특별한 방식을 써야 한다.

```cpp
vector<vector<int>> g(n);
auto dfs = [&](auto&& self, int cur, int pre) -> void {
    for(int nxt : g[cur]) {
        if(nxt == pre) continue;
        self(self, nxt, cur);
    }
};
dfs(dfs, 0, -1);
```

람다 함수 입장에서는 람다가 들어간 변수를 알 수 없으므로, 호출할 때 해당 변수를 넣어줘야 한다. 이를 self로 넣고, 호출할 때 self를 호출하면 된다. 주의할 점은 람다 함수의 반환형(`-> void`)을 반드시 명시해야 한다. 그래야 self가 추론이 되기 때문이다.

트리를 dfs로 방문한 순서를 출력하는 코드를 지역 변수 + vector + 람다로 바꾼 예시이다.

```cpp
int n, res[100001], dNum;
vector<int> g[100001];

void dfs(int cur, int pre)
{
    res = ++dNum;
    for(int nxt : g[cur]) {
        if(nxt == pre) continue;
        dfs(nxt, cur);
    }
}

int main(void)
{
    cin >> n;
    for(int i = 0; i < n - 1; ++i) {
        int u, v;
        cin >> u >> v;
        u--; u--;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    
    dfs(0, -1);

    for(int v : res) cout << v << " ";

    return 0;
}
```

```cpp
int main(void)
{
    int n;
    cin >> n;
    vector<vector<int>> g(n);
    for(int i = 0; i < n - 1; ++i) {
        int u, v;
        cin >> u >> v;
        u--; v--;
        g[u].push_back(v);
        g[v].push_back(u);
    }

    int dNum = 0;
    vector<int> res(n);
    auto dfs = [&](auto&& self, int cur, int pre) -> void {
        d[cur] = ++dNum;
        for(int nxt : g[cur]) {
            if(nxt == pre) continue;
            self(self, nxt, cur);
        }
    };
    dfs(dfs, 0, -1);

    for(int v : res) cout << v << " ";

    return 0;
}
```

# Structured Bindings

Structured bindings는 C++17에서 새로 생긴 기능인데, pair나 tuple같이 여러 변수가 있는 구조체의 값을 각각 변수에 넣는 기능이다.

```cpp
pair<int, float> p = { 1, 2.0f };

auto [p1, p2] = p;
// p1 = 1, p2 = 2.0f
```

문법은 이렇게 사용하면 된다. 더이산 std::tie나 수동으로 값을 넣을 필요가 없다. 이것은 특히 간선 비용이 있는 그래프를 탐색할 때

```cpp
vector<vector<pair<int, ll>>> g;
...
for(auto [nxt, cost] : g[cur]) {
    ...
}
```

편하게 사용할 수 있다.

# 유용한 STL 함수들

STL 함수들을 잘 쓰면 자주 쓰는 작업들을 더 편하기 할 수 있다. sort나 unique, next_permutation

STL 함수들
- numeric
  - iota
    - dsu 초기화할 때 유용
  - accumulate
  - reduce (써본적은 없음)
    - parallel 할 때만 유용해서 쓸 일은 없을 듯?
  - partial_sum
- algorithm
  - all_of / any_of
  - count / count_if
  - find / find_if
  - adjacent_find

위에는 개인적으로 추천하는 코딩 스타일이고, 이 밑에는 개인적인 취향이다.

pair 대신에 struct 사용
- first, second로 나오는 것보다 직접 지정한 변수 이름으로 하는 것이 가독성에 좋음
- 정렬같은 경우 sort함수에 compare 람다를 넣거나 operator<를 정의
- 값을 넣을때는 {}

변수명을 미리 생각해놓은 규칙대로 짓거나, 의미를 담게 짓기?
