---
title: "SCPC 2020 Round1 후기"
slug: "scpc-2020-round1-review"
date: "2020-08-23T01:46:53+09:00"
categories: ["Algorithm", "SCPC"]
banner: "cover.jpg"
description: ""
tags: []
---

2일 전에 [SCPC](https://research.samsung.com/scpc) 2020 Round 1이 열렸다. SCPC라는 대회의 존재를 작년에 군대에 있었을 때 알았다.

실은 PS를 중학생때까지 열심히 했는데, 고등학생이 되니까 경기도에서는 도저히 정올 예선을 뚫을 수가 없어서 포기를 했었다. 그 이후로는 따로 PS공부를 하지 않고, 대학생때 그냥 대회 있으면 참가하는 마음으로 몇몇 대회를 참가했었다. 작년 SCPC도 별 생각없이 신청을 했는데, 문제를 풀다 보니 옛날에 열심히 PS공부를 하던 것이 생각이 나고 다시 공부해볼까 하는 마음이 생겼다. 그래서 요즘 PS 공부를 조금씩 하고는 있다.

잡설이 많았는데, 필자는 이번 대회에서 3문제 + 1문제 Case1(부분점수)을 풀었다.

# 1. 다이어트

메뉴를 k개만 고를 수 있기 때문에 메뉴들을 정렬한 뒤에 k번째를 넘어가는 메뉴들은 버려도 된다.

그리고 이제 메뉴들을 골라야 하는데, 고르는 방법은

A식당에서 가장 큰 메뉴 + B식당에서 가장 작은 메뉴

A식당에서 2번째로 큰 메뉴 + B식당에서 2번째로 작은 메뉴

...

이런식으로 합치고 합친 것중에 가장 큰 값을 출력하면 된다.

솔직히 이렇게 풀면 맞지 않을까? 해서 작성하고 제출했는데 맞았다. 아마 증명이 있을 것 같긴 한데 잘 모르겠다...

```c++
#define _CRT_SECURE_NO_WARNINGS 1

#include <iostream>
#include <cstdio>
#include <utility>
#include <algorithm>
using namespace std;

using lli = long long int;

int tNum;
int n, k, a[200001], b[200001];

int main(void)
{
    // freopen("input.txt", "r", stdin);
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    cin >> tNum;
    for(int tt = 0; tt < tNum; tt++) {
        cin >> n >> k;
        for(int i = 0; i < n; i++) {
            cin >> a[i];
        }
        for(int i = 0; i < n; i++) {
            cin >> b[i];
        }

        sort(a, a + n);
        sort(b, b + n);

        lli res;

        lli max = 0;
        for(int i = 0; i < k; i++) {
            if(max < a[i] + b[k - i - 1]) {
                max = a[i] + b[k - i - 1];
            }
        }
        res = max;

        cout << "Case #" << tt + 1 << "\n";
        cout << res << "\n";
    }

    return 0;
}
```

# 2. 카드 게임

이와 비슷한 문제를 최근에 풀어봐서 똑같이 DP로 푸니까 시간초과가 났다. 

dp\[i]\[j]를 a\[i]번째, b\[j]번째 카드까지 있을 때 해당 턴 사람이 이기면 1, 지면 -1로 정의를 하고 문제를 풀었다. 여기까지는 O(N^2)이다.

그런데 해당 턴에 이기는지 지는지를 파악하려면 카드를 1장부터 k값을 초과하지 않는 장수만큼 가져갔을 때 지는 경우(상대의 턴이니까)가 있으면 이기게 된다. 즉,

dp\[i]\[j] = { dp\[i-1]\[j], dp\[i-2]\[j], ... , dp\[i-xx]\[j], dp\[i]\[j-1], dp\[i]\[j-2], ... , dp\[i]\[j-yy] 중에 -1이 있으면 1 / 없으면 -1}

(xx는 현재 상황에서 A더미에서 가져갈 수 있는 최대 개수 / yy는 현재 상황에서 B더미에서 가져갈 수 있는 최대 개수)

이런 식이 나오게 되는데, 이 식이 최악의 경우 O(n)이기 때문에 총 시간복잡도는 O(N^3)이 되고, N이 3000까지 있기 때문에 당연히 시간초과가 나오게 된다. 그러면 저 식을 잘 처리해서 O(1)로 만들어야 하는데... 하다가 문득 생각이 떠올랐다.

어차피 가져갈 수 있는 범위 내에서 -1이 하나라도 있는지 확인하면 되고, 범위는 카드 더미의 각 위치마다 정해져 있으니까 미리 계산이 가능하다. 그리고 -1은 해당 범위 안에 -1이 몇 개 있는지를 prefix sum을 이용하면 O(1)만에 구할 수 있다.

아래 코드에서는 prefix sum을 2차원 배열 2개로 나누어서 풀었는데(A전용, B전용), 지금 생각해보니까 하나로 합쳐서 풀수도 있었다. 결국 [이 문제](https://www.acmicpc.net/problem/2167)처럼 2차원 배열의 부분합을 구하는 것과 같기 때문이다. 이런걸 보면 나는 아직 배워야 할 게 많다는 생각이 들었다. 이런 기초적인 것도 생각 못하다니...

```c++
#define _CRT_SECURE_NO_WARNINGS 1

#include <iostream>
#include <cstdio>
#include <utility>
using namespace std;

using lli = long long int;

int tNum;
int n, k;
int a[3001], b[3001];
int numX[3001][3001];
int numY[3001][3001];
int rangeX[3001];
int rangeY[3001];

void init()
{
    for(int i = 0; i <= n; i++) {
        for(int j = 0; j <= n; j++) {
            numX[i][j] = 0;
            numY[i][j] = 0;
        }
    }

    int sum = 0, start = 1;
    for(int i = 1; i <= n; i++) {
        sum += a[i];
        while(sum > k) {
            sum -= a[start];
            start++;
        }

        rangeX[i] = start;
    }
    sum = 0;
    start = 1;
    for(int i = 1; i <= n; i++) {
        sum += b[i];
        while(sum > k) {
            sum -= b[start];
            start++;
        }

        rangeY[i] = start;
    }
}

int main(void)
{
    // freopen("input.txt", "r", stdin);
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    cin >> tNum;
    for(int tt = 0; tt < tNum; tt++) {
        cin >> n >> k;
        for(int i = 1; i <= n; i++) {
            cin >> a[i];
        }
        for(int i = 1; i <= n; i++) {
            cin >> b[i];
        }

        init();

        int resA = 0, resB = 0;

        for(int x = 0; x <= n; x++) {
            for(int y = 0; y <= n; y++) {
                if(x == 0 && y == 0) continue;

                int canWin = -1;

                int st, num;

                if(x > 0) {
                    st = rangeX[x];
                    num = numX[x - 1][y];
                    if(st > 1) num -= numX[st - 2][y];
                    if(num > 0) {
                        canWin = 1;
                    }
                }
                
                if(canWin == -1 && y > 0) {
                    st = rangeY[y];
                    num = numY[x][y - 1];
                    if(st > 1) num -= numY[x][st - 2];
                    if(num > 0) {
                        canWin = 1;
                    }
                }

                if(canWin == -1) {
                    resB++;
                    numX[x][y] = 1;
                    numY[x][y] = 1;
                } else {
                    resA++;
                }
                if(x > 0)
                    numX[x][y] += numX[x - 1][y];
                if(y > 0)
                    numY[x][y] += numY[x][y - 1];
            }
        }
        resA++;

        cout << "Case #" << tt + 1 << "\n";
        cout << resA << " " << resB << "\n";
    }

    return 0;
}
```

실제로 어거지로 고치고 그래서 코드가 깔끔하지 않다. 끝나고 다른 후기의 풀이를 봤더니 그리디로도 푸는 방법도 있는것 같다...

# 3. 사다리 게임

처음에는 잘못된 방향으로 문제를 풀었는데 틀려가지고 멘탈이 박살나서 좀 쉬었다가 다시 생각해봤더니 깔끔한 풀이가 생각나서 다행히 풀 수 있었다.

이 문제 역시 DP로 풀 수 있다. 먼저 구하고자 하는 시작 지점을 st라고 할 때, dp 배열을 다음과 같이 정의할 수 있다.

dp\[i] = st에서 i로 가는데 지워야 하는 가로선의 최소 개수

일단 가로선이 전부 없다고 생각하자. 이러면 dp[st] = 0이고 나머지는 갈 수 없으니까 아주 큰 수(본인은 987654321을 넣었다)를 넣는다.

이제 가로선을 위에서부터 하나씩 추가를 한다. 이때 서로 연결되는 세로선을 e1, e2라고 하면, e1과 e2를 제외한 나머지 세로선들은 이 가로선에 영향을 안 받기 때문에 값에 변화가 없다. 영향을 받는 두 세로선은 다음을 고려할 수 있다.

1. 추가한 가로선을 타고 가는 경우
2. 추가한 가로선을 타고 가지 않는 경우 (지우는 경우)

1번처럼 추가한 가로선을 타고 갈 경우, 경로가 서로 바뀌기 때문에(e1으로 가던게 e2로 가고, e2로 가던게 e1으로 가게 된다.) 반대편에 있는 dp값을 가져오면 된다.

2번처럼 가로선을 타고 가지 않을 경우, 그냥 내려가는 것이므로 자신의 dp값을 유지하면 되는데, 가로선을 제거한 경우이기 때문에 +1을 해줘야 한다.

이제 이 2가지 경우 중 작은 것을 값으로 채택하면 된다. 이것을 식으로 요약하면

dp[e1] = min(dp[e2], dp[e1]+1), dp[e2] = min(dp[e1], dp[e2]+1)

이다. 이때 주의할 점은 비교할 때 쓰는 dp[e1], dp[e2]가 가로선을 깔기 전의 값이기 때문에 앞에 dp[e1]의 값이 변경되면 뒤에 dp[e2]가 잘못된 값이 나올 수도 있다. 그래서 계산하기 전에 미리 다른 변수에다가 담아서 그 변수를 이용해 계산해야 한다.

이것을 모든 가로선에 대해서 연산을 하면 st에서 출발한 모든 경로의 값들을 구할 수 있다. 이러면 같은 st가 또 입력으로 들어왔을 때 바로 값을 낼 수 있도록 따로 배열을 만들어서 캐싱해두면 시간을 더 아낄 수 있다.

```c++
#define _CRT_SECURE_NO_WARNINGS 1

#include <iostream>
#include <cstdio>
#include <utility>
using namespace std;

using lli = long long int;

int tNum;
int n, k, m;
int d[1501];
int cache[1501][1501];
pair<int, int> edges[2001];

void init()
{
    for(int i = 1; i <= n; i++) {
        d[i] = -1;
        for(int j = 1; j <= n; j++) {
            cache[i][j] = -1;
        }
    }
}

void calc(int st)
{
    for(int i = 1; i <= n; i++) {
        d[i] = 987654321;
    }
    d[st] = 0;

    for(int i = 0; i < k; i++) {
        int e1 = edges[i].first;
        int e2 = edges[i].second;

        int oldde1 = d[e1];
        int oldde2 = d[e2];

        // e1 -> e2
        if(oldde1 < oldde2 + 1) {
            d[e2] = oldde1;
        } else {
            d[e2] = oldde2 + 1;
        }

        // e2 -> e1
        if(oldde2 < oldde1 + 1) {
            d[e1] = oldde2;
        } else {
            d[e1] = oldde1 + 1;
        }
    }

    for(int i = 1; i <= n; i++) {
        if(d[i] == 987654321) {
            cache[st][i] = -1;
        } else {
            cache[st][i] = d[i];
        }
    }
}

int main(void)
{
    // freopen("input.txt", "r", stdin);
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    cin >> tNum;
    for(int tt = 0; tt < tNum; tt++) {
        cin >> n >> k >> m;

        init();

        for(int i = 0; i < k; i++) {
            int a, b;
            cin >> a >> b;
            edges[i] = { a, b };
        }

        int res = 0;
        for(int kk = 0; kk < m; kk++) {
            int s, e;
            cin >> s >> e;

            if(cache[s][s] == -1) {
                calc(s);
            }

            res += cache[s][e];
        }

        cout << "Case #" << tt + 1 << "\n";
        cout << res << "\n";
    }

    return 0;
}
```

# 4. 범위 안의 숫자

2, 3번 문제를 푸는데 너무 많은 힘을 써서 4번은 풀 힘이 안 났다. 그리고 문제가 확 어려워지기도 해서... 그냥 생각 없이 직관적으로 풀었다.

숫자를 골라 1을 만들 때마다 만들어지는 수들이 변경되기 때문에 수들의 집합이 자주 변하게 된다. 그래서 삽입/삭제가 빠른 BST이고 중복이 가능한, 즉 [multiset](https://en.cppreference.com/w/cpp/container/multiset)을 이용했다.

주어진 문자열에서 숫자들을 뽑아내 multiset에다가 전부 넣고, two pointer를 이용해 구간을 넘지 않게 움직이면서 최대 값을 찾는다.

그리고 숫자를 골라 1로 만든다. 그러면 바뀌는 숫자들이 최대 k개가 생기게 되는데, multiset에 바뀌기 전 숫자들을 지우고 바뀐 숫자들을 넣는다. 그리고 이 상태에서 값을 찾는다. 그리고 원래대로 되돌린다. 이것을 모든 숫자들에 대해 반복한다.

보면 알겠지만 그냥 무식하게 짰다. 제한 시간이 10초라서 어느 정도는 되겠지 라는 마음가짐으로 한건데 다행히? 부분점수는 받을 수 있었다.

이외에도 [map](https://en.cppreference.com/w/cpp/container/map)을 쓰는게 더 빠르지 않을까? 생각을 해서 map으로 바꿔보고, 구간 계산을 바뀐 수들에 대해서만 하면 되지 않을까? 해서 그렇게 해보고 해도 안 돼서 그냥 포기했다...

```c++
#define _CRT_SECURE_NO_WARNINGS 1

#include <iostream>
#include <cstdio>
#include <utility>
#include <set>
#include <vector>
using namespace std;

using lli = long long int;

int tNum;
int n, k, m;
int mod;
char t[50001];
multiset<int> d;
vector<pair<int, int>> changedNums;

void init()
{
    d.clear();
    mod = 1;
    for(int i = 1; i < k; i++) {
        mod *= 10;
    }

    int current = 0;
    for(int i = 0; i < k; i++) {
        current *= 10;
        current += t[i] - '0';
    }
    d.insert(current);

    for(int i = k; i < n; i++) {
        current = current % mod;
        current *= 10;
        current += t[i] - '0';

        d.insert(current);
    }
}

int calc()
{
    int res = 0;

    auto left = d.cbegin();
    auto right = left;
    int cnt = 1;
    res = 1;
    while(1) {
        right++;
        if(right == d.cend()) break;

        cnt++;
        while(*left + m < *right) {
            cnt--;
            left++;
        }

        if(res < cnt) res = cnt;
    }

    return res;
}

void Change(int idx)
{
    changedNums.clear();
    int current = 0;
    int left = idx - k + 1;
    if(left < 0) left = 0;

    for(int i = 0; i < k; i++) {
        current *= 10;
        current += t[left + i] - '0';
    }

    changedNums.push_back({ current, 0 });

    for(int i = left + k; i < n; i++) {
        if(i - k >= idx) break;

        current = current % mod;
        current *= 10;
        current += t[i] - '0';
        
        changedNums.push_back({ current , 0 });
    }

    //

    char old = t[idx];
    t[idx] = '1';
    int cIdx = 0;

    current = 0;
    for(int i = 0; i < k; i++) {
        current *= 10;
        current += t[left + i] - '0';
    }

    changedNums[cIdx++].second = current;

    for(int i = left + k; i < n; i++) {
        if(i - k >= idx) break;

        current = current % mod;
        current *= 10;
        current += t[i] - '0';

        changedNums[cIdx++].second = current;
    }

    t[idx] = old;

    for(int i = 0; i < changedNums.size(); i++) {
        auto findIter = d.find(changedNums[i].first);
        d.erase(findIter);
        d.insert(changedNums[i].second);
    }
}

void Rollback()
{
    for(int i = 0; i < changedNums.size(); i++) {
        auto findIter = d.find(changedNums[i].second);
        d.erase(findIter);
        d.insert(changedNums[i].first);
    }
}

int main(void)
{
    // freopen("input.txt", "r", stdin);
    ios_base::sync_with_stdio(false);
    // cin.tie(NULL);

    cin >> tNum;
    for(int tt = 0; tt < tNum; tt++) {
        cin >> n >> k >> m >> t;

        init();
        int res = calc();

        for(int i = 0; i < n; i++) {
            if(t[i] == '1') continue;

            Change(i);
            int r2 = calc();
            Rollback();

            if(r2 > res) res = r2;
        }

        cout << "Case #" << tt + 1 << "\n";
        cout << res << endl;
    }

    return 0;
}
```

---

Round 1은 커트라인이 널널하기 때문에 개인적인 생각으로는 1문제 + 다른문제 부분점수면 무난하게 통과할 것 같다.

Round 2가 2주일 정도 뒤에 열리는데 솔직히 통과할 수 있을지는 모르겠다. 이번에 문제 풀 때도 생각이 빠르게 나지 않았고, 쓸때없는 것에 시간낭비도 했다. 지금 하고 있는게 많긴 한데... 그래도 열심히 준비해야겠다.