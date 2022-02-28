---
title: "Fracturing Search"
slug: "fracturing-search"
date: "2022-03-01T09:11:27+09:00"
categories: ["Algorithm"]
banner: "images/cow-tree-2.png"
description: ""
tags: []
---

문제들 중에 1번째 ~ k번째로 작은/큰 값을 구하는 경우가 있다. 이때 Fracturing Search를 쓰면 효율적으로 구할 수 있다.

-----

# Fracutring Search

문제에서 만들 수 있는 여러 상태들이 있고, 각 상태들은 값을 가지고 있다. 이때 다음 조건을 만족하는 상태 전이 트리를 만들 수 있다.

1. 트리에서 노드에 대응되는 모든 상태들은 겹치지 않는다.
2. 자식 노드는 부모 노드보다 값이 크거나 같다.

이때 k번째 값은 priority queue를 이용하면 다음과 같이 빠르게 구할 수 있다.

1. 처음에 가장 작은 값 노드(상태)를 priority queue에 넣는다.
2. priority queue에서 노드를 꺼낸다.
3. 해당 노드의 자식 노드들을 priority queue에 넣는다.
4. k번째 값을 찾을때까지 2-4를 반복한다.

이러면 가장 작은 값부터 차례대로 값들을 구할 수 있다. 해당 노드의 자식 노드들을 넣으면 남은 노드들은 현재 priority queue에 있는 노드들보다 무조건 크거나 같기 때문이다.

결국 위의 두 조건을 만족하는 상태 전이 트리를 잘 설계하는 것이 이 알고리즘의 핵심이다.

# K-th Smallest Spanning Tree

문제는 이름 그대로 k번째 MST를 구하면 된다.

일단 MST를 구하자. 그러면 n-1개의 edge들이 선택되었을 것이다. 이 상태가 첫 번째 상태이고, 상태 트리의 root가 된다.
이제 이 상태에서 다음 MST를 어떻게 구해야 할까? 선택된 edge들 중 하나를 제외하고 MST를 구하는 게 다음 MST라는 것을 생각할 수 있다. (이유 추가?)

![다음 상태 mst](images/mst-next-state.png)

위의 그림처럼 파란색 영역이 선택된 edge일 때, 다음 상태는 선택된 edge들 중 하나를 제외하는 것이고, 이것을 priority queue에 넣으면 된다.
여기서 주의할 점은, edge를 제외할 때 앞에 있는 edge를 무조건 MST에 포함되도록 강제해야 한다는 점이다. 이래야 상태 트리에서 노드들이 중복되지 않기 때문이다. priority queue에서 뽑을 때는 강제/제외된 edge를 반영하고, 남은 edge들로 MST를 구하면 된다.
매번 상태를 넣을때마다 MST를 구해야 하고, 전이되는 자식의 개수는 선택된 edge의 개수(N)이므로, 시간복잡도는 O(K N (logNK + Malpha(N))) (상태 개수 * (priority queue 연산 + MST 연산))이다.

# BOI 2019 - Olympiads (BOJ 17188)

[BOJ 링크](https://www.acmicpc.net/problem/17188)

위의 문제와 거의 똑같이 접근하면 된다. 가장 큰 점수를 가지는 참가자 그룹은 각 event마다 아직 안 골라진 참가자 중에 가장 큰 점수를 가지는 참가자를 고르면 된다. 이렇게 고른 상태에서, 선택한 참가자를 하나씩 제외한 상태를 넣으면 된다. 시간복잡도는 O(CK (logCK + NK))이다.

(K를 땔수가 있나???)

[소스 코드](https://github.com/Cube219/PS/blob/main/BOJ/17000%7E18000/17188%20-%20Olympiads.cpp)

# USACO 2016 December - Robotic Cow Herd (BOJ 14166)

[BOJ 링크](https://www.acmicpc.net/problem/14166)

가장 작은 상태는 각 location에서 가장 작은 model을 선택하면 된다. 다음 상태는 i-1번째까지 location은 고정시키고, i번째 locaiton의 다음으로 작은 model을 선택하는 것으로 넣으면 된다. (이게 되는 이유 추가ㅏ?) 이러면 시간복잡도는 O(KN log(KN))으로, KN때문에 시간 안에 나올수가 없다.

![상태 트리 1](images/cow-tree-1.png)

model의 개수가 각각 2, 2, 3개 있는 데이터의 상태 트리이다. 결국 문제가 되는 부분은 자식 노드의 개수가 최대 n개가 되는 부분이다. 초록색 부분을 살펴보면, 자식들로 나누어지는 경우는

1. 현재 자기 location의 다음 model을 선택
2. 자기 location을 고정하고 다음 location ~ 끝 location의 다음 model(0번째->1번째)을 선택 (초록색 영역)

이다. 여기서 0번째->1번째 model로 가는 증가 비용을 기준으로 location을 정렬하면, 2번 경우에서 다음 location의 1번째 모델만 선택하고 나머지 location의 경우는 나중으로 미뤄도 된다. 왜냐하면 정렬을 하면서 i번째 location을 선택한 것이 그 이후 location을 선택한 것 보다 비용이 작거나 같기 때문이다.

![상태 트리 2](images/cow-tree-2.png)

빨간색이 나중으로 미루는 경우이다. 이러면 자식으로 나누어지는 경우는

1. 현재 자기 location의 다음 model 선택
2. 자기 location을 고정하고 다음 location의 다음 model(0번째->1번째) 선택
3. 만약 자기 location의 model이 1번째라면 0번째로 바꾸고 다음 location의 model(0번째->1번째) 선택 (빨간색)

자식의 개수가 최대 3개가 되고, 시간복잡도는 O(K logK)가 되어서 시간 내에 충분히 나온다.

[소스 코드](https://github.com/Cube219/PS/blob/main/BOJ/14000~15000/14166%20-%20Robotic%20Cow%20Herd(priority_queue).cpp)

# CCO 2020 - Shopping Plans (BOJ 19616)

[BOJ 링크](https://www.acmicpc.net/problem/19616)

위의 문제에 여러 개를 선택할 수 있고, 상/하한까지 있는 문제다. 일단 문제를 작은 것 부터 차례대로 풀어보자.

## 타입 1개에 상/하한 X

상/하한이 없다면 가장 작은 값은 당연히 아무 것도 안 고른 상태이다. 이제 MST와는 반대로 무조건 한 개의 값을 고르는 방식으로 하면 된다. 물론 이전 값들은 절대로 고르지 않도록 고정해야 한다. 이러면 시간복잡도는 O(NK logNK)고, 위에서 사용한 최적화를 적용하면 O(KlogK)가 된다.

![4개 있을 때 상태 트리](images/no-bound.png)

## 타입 1개에 상/하한 O

상한은 상태에 고른 개수를 저장하고 상한보다 크면 컷하는 방식으로 하면 된다.
문제는 하한인데, 하한이 있을 때 경우를 생각해보자. 하한이 3일 때, 가장 작은 상태는 (0, 1, 2)다. 그다음 상태는 (0, 1, 3)이고, 그다음 상태는 (0, 1, 4), (0, 2, 3)... 이렇게 이어진다. 이것은 base로 (0, 1, 2)인 상태에서 뒤에서부터 대체하는 방식을 사용하면 된다. 시작을 3부터 시작하고, 만약 앞에 넣을 수 있을 때 앞에 넣는 상태를 추가하면 된다.

![5개 있고 상/하한이 [2, 4]일때 상태 트리](images/has-bound.png)

파란색이 앞에 넣는 상태이다. 잘 보면 현재 크기에 따라 앞에 넣는 값이 같은 것을 볼 수 있다.

## 타입 M개

위의 방식으로 각 타입별 k번째로 작은 값을 구할 수 있다. 이러면 위의 문제와 동일해지므로, 같은 방법으로 풀면 된다. 다만 각 타입별로 미리 c번째까지 구할 수 없기 때문에, 필요할 때마다 동적으로 구해야 한다. 로직상 타입별로 k번째는 순서대로 접근(무조건 0번째 -> 1번째 -> 2번째 -> ...)하게 된다.

총 시간복잡도는 O(K(logK)^2)이다.

[소스 코드](https://github.com/Cube219/PS/blob/main/BOJ/19000~20000/19616%20-%20Shopping%20Plans.cpp)

-----

# 참고 자료

https://usaco.guide/adv/fracturing-search

https://koosaga.com/275
