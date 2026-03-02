# GSAP Methods Guide

## 1. Core Animation Methods

### gsap.to()

현재 상태 → 목표값으로 애니메이션. 가장 많이 쓰는 메소드.

```js
gsap.to(".box", {
  duration: 1,        // 초
  x: 100,             // translateX(100px)
  y: 50,              // translateY(50px)
  opacity: 0.5,
  rotation: 360,
  scale: 1.5,
  ease: "power2.out",
  delay: 0.5,
  repeat: -1,         // -1 = 무한 반복
  yoyo: true,         // 반복 시 역재생
  onComplete: () => {},
});
```

- `target`은 CSS 셀렉터, DOM 요소, 배열, 일반 객체 모두 가능
- GSAP 전용 transform 단축 속성: `x`, `y`, `rotation`, `scale`, `scaleX`, `scaleY`, `skewX`, `skewY`, `xPercent`, `yPercent`
- CSS 속성은 camelCase: `backgroundColor` (~~background-color~~)
- `x`, `y`는 기본 px, 문자열로 `"50%"` 또는 상대값 `"+=100"` 가능

---

### gsap.from()

정의한 값에서 → 현재 CSS 상태로 애니메이션. 등장 애니메이션에 적합.

```js
gsap.from(".box", {
  duration: 1,
  opacity: 0,
  y: -50,
  ease: "power2.out",
});
```

- 현재 CSS 상태가 최종 상태, 정의한 값이 시작 상태
- **FOUC 주의**: GSAP 로드 전 잠깐 최종 상태가 보일 수 있음 → CSS에서 `visibility: hidden` 설정 후 `autoAlpha: 0` 사용으로 해결
- `immediateRender: true`가 기본값 — 타임라인에서 순차적 `.from()`을 쓸 때 주의

---

### gsap.fromTo()

시작값과 끝값을 모두 명시. 현재 CSS 상태에 의존하지 않아 가장 결정적(deterministic).

```js
gsap.fromTo(".box",
  { opacity: 0, y: -50 },                              // from
  { opacity: 1, y: 0, duration: 1, ease: "power2.out" } // to + 설정
);
```

- `duration`, `ease`, `onComplete` 등 설정은 두 번째 객체에만 넣기
- `immediateRender: true`가 기본값

---

### gsap.set()

즉시 값 적용 (duration: 0). 초기 상태 설정, 리셋에 사용.

```js
gsap.set(".box", { x: 100, opacity: 0, transformOrigin: "center center" });
```

- CSS 변수 설정 가능: `gsap.set(el, { "--my-color": "red" })`
- 여러 타겟 동시 적용: `gsap.set([".a", ".b"], { opacity: 0 })`
- 인라인 스타일 제거: `gsap.set(".box", { clearProps: "all" })`

---

### 비교표

| 메소드 | 정의하는 것 | 시작 상태 | 끝 상태 | 용도 |
|--------|-----------|----------|---------|------|
| `gsap.to()` | 끝 상태 | 현재 CSS | 정의한 값 | 퇴장, 일반 애니메이션 |
| `gsap.from()` | 시작 상태 | 정의한 값 | 현재 CSS | 등장, 리빌 |
| `gsap.fromTo()` | 둘 다 | 정의한 from | 정의한 to | 완전 제어, 반복 가능 |
| `gsap.set()` | 즉시 적용 | — | — | 초기화, 리셋 |

---

## 2. Timeline

여러 애니메이션을 순차/병렬로 조합하는 컨테이너.

### 생성

```js
const tl = gsap.timeline({
  defaults: { duration: 1, ease: "power2.out" }, // 자식 트윈 기본값
  paused: true,         // 일시정지 상태로 시작
  repeat: -1,           // 무한 반복
  yoyo: true,           // 반복 시 역재생
  repeatDelay: 0.5,
  onComplete: () => {},
  scrollTrigger: {},    // ScrollTrigger 연결 가능
});
```

### 위치 파라미터 (Position Parameter)

타임라인에서 각 트윈의 시작 시점을 제어하는 핵심 개념.

```js
tl.to(".a", { x: 100 })                  // 이전 트윈 끝나고 시작 (기본)
  .to(".b", { x: 100 }, "+=0.5")         // 이전 끝나고 0.5초 후
  .to(".c", { x: 100 }, "-=0.3")         // 이전 끝나기 0.3초 전 (겹침)
  .to(".d", { x: 100 }, 2)               // 절대 시간 2초에 시작
  .to(".e", { x: 100 }, "<")             // 이전 트윈과 동시에 시작
  .to(".f", { x: 100 }, "<0.5")          // 이전 시작 후 0.5초
  .to(".g", { x: 100 }, "myLabel")       // 라벨 위치에서
  .to(".h", { x: 100 }, "myLabel+=0.5"); // 라벨 + 0.5초
```

| 위치 | 의미 |
|------|------|
| (없음) | 이전 트윈 끝난 후 (순차) |
| `"<"` | 이전 트윈과 동시 시작 |
| `">"` | 이전 트윈 끝나는 시점 |
| `"+=N"` | 이전 끝나고 N초 후 |
| `"-=N"` | 이전 끝나기 N초 전 (겹침) |
| `N` | 절대 시간 (초) |
| `"label"` | 라벨 위치 |

### 타임라인 메소드

```js
tl.to(".box", { x: 100 }, "<")
  .from(".title", { opacity: 0, y: 20 })
  .fromTo(".btn", { scale: 0 }, { scale: 1 }, "-=0.5")
  .set(".overlay", { display: "none" });
```

### 제어 메소드

```js
tl.play();           // 재생
tl.play(1.5);        // 1.5초 지점부터 재생
tl.pause();          // 일시정지
tl.reverse();        // 역재생
tl.restart();        // 처음부터 재시작
tl.resume();         // 일시정지 해제

tl.seek(2);          // 2초 지점으로 이동 (재생 안 함)
tl.progress(0.5);    // 50% 지점으로 이동
tl.timeScale(2);     // 2배속
tl.kill();           // 타임라인 제거

tl.isActive();       // 현재 재생 중인지
tl.reversed(!tl.reversed()); // 토글 (메뉴 열기/닫기 패턴)
```

---

## 3. ScrollTrigger

### 기본 — gsap.to() 안에 옵션으로

단일 애니메이션을 스크롤에 연결할 때 가장 간단한 방법.

```js
gsap.to(".box", {
  x: 500,
  rotation: 360,
  scrollTrigger: {
    trigger: ".box",
    start: "top center",   // "트리거요소위치 뷰포트위치"
    end: "bottom top",
    scrub: true,           // 스크롤과 1:1 연동
    markers: true,         // 디버깅용 (배포 시 제거)
  },
});
```

### ScrollTrigger.create()

애니메이션 없이 콜백만 필요하거나, 더 세밀한 제어가 필요할 때.

```js
ScrollTrigger.create({
  trigger: ".section",
  start: "top center",
  end: "bottom center",
  onEnter: () => {},
  onLeave: () => {},
  onEnterBack: () => {},
  onLeaveBack: () => {},
  onUpdate: (self) => {
    console.log(self.progress);   // 0~1
    console.log(self.direction);  // 1(아래) 또는 -1(위)
  },
  toggleClass: "active",
  once: true,              // 1회만 실행 후 제거
});
```

### ScrollTrigger + Timeline

```js
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".container",
    start: "top top",
    end: "+=3000",       // 3000px 스크롤
    scrub: 1,            // 1초 부드러운 추적
    pin: true,           // 요소 고정
  },
});

tl.to(".box1", { x: 500 })
  .to(".box2", { y: 300 })
  .to(".box3", { rotation: 360 });
```

### 주요 옵션

| 옵션 | 타입 | 설명 |
|------|------|------|
| `trigger` | Element/String | 트리거 요소 |
| `start` | String | 시작 시점. 기본: `"top bottom"` |
| `end` | String | 종료 시점. 기본: `"bottom top"` |
| `scrub` | Bool/Number | `true`: 스크롤 직접 연동. 숫자: 부드러운 추적 (초) |
| `pin` | Bool/Element | 스크롤 구간 동안 요소 고정 |
| `pinSpacing` | Bool | pin 시 아래 콘텐츠 밀어내기. `false`면 겹침 |
| `markers` | Bool | 디버깅 마커 표시 |
| `toggleActions` | String | 4개 액션: `onEnter onLeave onEnterBack onLeaveBack` |
| `once` | Bool | 1회 실행 후 자동 제거 |
| `onUpdate` | Function | 매 프레임 호출. `self.progress` (0~1) 제공 |
| `snap` | Number/Object | 특정 진행도에 스냅. `snap: 0.25` = 25% 단위 |
| `anticipatePin` | Number | pin 시 미세한 끊김 보정. `1` 권장 |
| `invalidateOnRefresh` | Bool | 리사이즈 시 재계산. 반응형에 필수 |

### start/end 값 형식

```
"top top"       — 트리거 상단이 뷰포트 상단에 닿을 때
"top center"    — 트리거 상단이 뷰포트 중앙에 닿을 때
"top bottom"    — 트리거 상단이 뷰포트 하단에 닿을 때 (기본 start)
"top 80%"       — 트리거 상단이 뷰포트 위에서 80% 지점에 닿을 때
"center center" — 트리거 중앙이 뷰포트 중앙
"+=500"         — start 기준 500px 이후 (상대적 end)
```

### scrub vs toggleActions

| | scrub | toggleActions |
|-|-------|---------------|
| 제어 방식 | 스크롤 위치가 직접 진행도 결정 | 스크롤이 재생/정지/역재생 트리거 |
| 느낌 | 스크롤 따라 1:1 움직임 | 자체 속도로 재생 |
| 용도 | 패럴렉스, 스크롤 연동 효과 | 진입 시 등장 애니메이션 |
| 되감기 | 자동 (스크롤 올리면 역재생) | toggleActions에 `"reverse"` 설정 필요 |

### 주의사항

- 개발 중 항상 `markers: true`로 시작/끝 위치 확인
- `scrub: 0.5` ~ `scrub: 2`가 프로덕션에서 부드러움
- `pin: true`는 비용이 큼 — 동시에 여러 요소 pin 피하기
- 동적 콘텐츠(이미지 로드, DOM 변경) 후 `ScrollTrigger.refresh()` 호출
- 부모에 CSS `transform`이 있으면 `position: fixed` (pin) 깨짐

---

## 4. SplitText

텍스트를 글자/단어/줄 단위로 분리하여 개별 애니메이션 가능. (Club/Business 플러그인)

### SplitText.create()

```js
const split = SplitText.create(".my-text", {
  type: "chars, words, lines", // 원하는 조합
  charsClass: "char",
  wordsClass: "word",
  linesClass: "line",
});

split.chars;  // 글자 요소 배열
split.words;  // 단어 요소 배열
split.lines;  // 줄 요소 배열

gsap.from(split.chars, {
  opacity: 0,
  y: 20,
  stagger: 0.03,
});
```

### type 옵션

| type | 설명 | 용도 |
|------|------|------|
| `"chars"` | 글자 단위 분리 | 타이핑 효과, 글자별 애니메이션 |
| `"words"` | 단어 단위 분리 | 단어별 등장 |
| `"lines"` | 줄 단위 분리 | 줄별 리빌 |
| `"chars, words"` | 글자를 단어 안에 중첩 | 글자 애니메이션 + 단어 그룹 유지 |
| `"chars, words, lines"` | 전체 중첩 | 최대 제어 |

### revert()

분리된 DOM을 원래 상태로 복원. React 클린업에 필수.

```js
split.revert();
```

### 줄 단위 리빌 패턴

```js
const split = SplitText.create(".text", { type: "lines", linesClass: "line-wrap" });
gsap.set(".line-wrap", { overflow: "hidden" });
gsap.from(split.lines, { yPercent: 100, stagger: 0.1, duration: 0.6 });
```

### 주의사항

- 각 요소를 `display: inline-block`인 `<div>`로 감쌈 → 레이아웃 영향 가능
- 반응형에서는 줄 바꿈이 달라지므로 리사이즈 시 revert + 재분리 필요
- 웹폰트 로드 전 실행하면 줄 측정이 틀림 → `document.fonts.ready.then(...)` 후 실행
- `<br>` 태그와 줄 분리는 잘 안 맞음 — 자연 텍스트 흐름 의존

---

## 5. Ticker

GSAP의 내부 requestAnimationFrame 루프에 콜백을 등록/제거.

### gsap.ticker.add()

매 프레임 실행할 함수 등록. 패럴렉스, 물리 시뮬레이션, 커스텀 렌더링에 사용.

```js
function update(time, deltaTime, frame) {
  // time: 경과 시간 (초)
  // deltaTime: 이전 프레임 이후 경과 (밀리초)
  // frame: 프레임 번호
}
gsap.ticker.add(update);
```

### gsap.ticker.remove()

등록한 콜백 제거. 클린업에 필수.

```js
gsap.ticker.remove(update);
```

### gsap.ticker.lagSmoothing()

랙 스파이크(탭 비활성, CPU 과부하) 처리 방식 제어.

```js
gsap.ticker.lagSmoothing(500, 33);
// 500ms 이상 프레임이 걸리면 33ms로 간주

gsap.ticker.lagSmoothing(0); // 랙 보정 비활성화
```

### 프레임 레이트 제한

```js
gsap.ticker.fps(30); // 30fps로 제한
```

### 활용 — Lenis 연동 (이 프로젝트 step1 패턴)

```js
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.lagSmoothing(0);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
```

---

## 6. React/Next.js — useGSAP

### 기본 사용

```jsx
import { useGSAP } from "@gsap/react";

function MyComponent() {
  const container = useRef(null);

  useGSAP(() => {
    // 여기서 만든 GSAP 애니메이션은 언마운트 시 자동 클린업
    gsap.to(".box", { x: 100, duration: 1 });
  }, { scope: container }); // scope: 셀렉터 범위를 이 컨테이너로 제한

  return (
    <div ref={container}>
      <div className="box">Box</div>
    </div>
  );
}
```

### dependencies — 상태 변화에 반응

```jsx
const [count, setCount] = useState(0);

useGSAP(() => {
  gsap.to(".box", { x: count * 50 });
}, { dependencies: [count], scope: container });
```

### contextSafe — 이벤트 핸들러에서 애니메이션

```jsx
const { contextSafe } = useGSAP({ scope: container });

const handleClick = contextSafe(() => {
  gsap.to(".box", { rotation: "+=360" });
});

return <button onClick={handleClick}>Spin</button>;
```

### 옵션

| 옵션 | 설명 |
|------|------|
| `scope` | ref를 지정하면 `".box"` 같은 셀렉터가 이 컨테이너 내로 제한됨 |
| `dependencies` | 변경 시 애니메이션 재실행. 생략하면 마운트 시 1회만 |
| `revertOnUpdate` | dependencies 변경 시 이전 애니메이션 되돌리기. 기본: `true` |

### 주의사항

- **항상 `scope` 사용** — 없으면 `gsap.to(".box")`가 문서 전체의 `.box`를 타겟팅
- `useEffect`와 `useGSAP`를 혼용하지 않기 — 하나만 선택
- `dependencies` 생략 = 마운트 시 1회 (useEffect와 다르게 생략해도 매 렌더 실행 아님)
- Next.js App Router에서는 반드시 `"use client"` 컴포넌트에서 사용

---

## 7. Easing

### 방향

| 방향 | 설명 | 체감 |
|------|------|------|
| `.in` | 느리게 시작 → 빠르게 끝 | 가속 |
| `.out` | 빠르게 시작 → 느리게 끝 | 감속 |
| `.inOut` | 느림 → 빠름 → 느림 | S자 곡선 |

### Power 이징

| ease | 강도 | 별칭 |
|------|------|------|
| `"none"` / `"power0"` | 등속 (linear) | — |
| `"power1"` | 부드러움 | Quad |
| `"power2"` | 자연스러움 | Cubic |
| `"power3"` | 극적 | Quart |
| `"power4"` | 매우 극적 | Quint |

기본값: `"power1.out"`

### 특수 이징

```js
// 탄성 — 스프링처럼 튕김
ease: "elastic.out(1, 0.3)"
// amplitude: 진폭 (기본 1), period: 주기 (기본 0.3, 작을수록 많이 흔들림)

// 바운스 — 공 튀기듯
ease: "bounce.out"

// 백 — 살짝 뒤로 갔다가 앞으로
ease: "back.out(1.7)"
// overshoot: 넘어가는 정도 (기본 1.7)

// 스텝 — 뚝뚝 끊기는 프레임 느낌
ease: "steps(5)"

// 지수 — 매우 극적
ease: "expo.out"

// 사인 — 부드럽고 자연스러운
ease: "sine.inOut"
```

### 실전 선택 가이드

| 상황 | 추천 ease |
|------|----------|
| UI 일반 (버튼, 모달) | `"power2.out"` |
| 상태 전환 | `"power2.inOut"` |
| 장난스러운 등장 | `"back.out(1.7)"` |
| 블록 리빌 | `"power4.inOut"` |
| 스크롤 연동 | `"none"` (scrub이 자체 보간) |

---

## 8. Stagger

여러 요소에 시간차를 두고 순차적으로 애니메이션.

### 단순 숫자

```js
gsap.to(".box", {
  y: -50,
  stagger: 0.1, // 각 요소 사이 0.1초 간격
});
```

### 객체 형태 (세부 제어)

```js
gsap.to(".box", {
  y: -50,
  stagger: {
    each: 0.1,          // 요소 간 간격 (초)
    // amount: 1,        // 전체 stagger 총 시간 (each 대신 사용)
    from: "start",       // 시작점
    grid: "auto",        // 그리드 레이아웃 자동 감지
    ease: "power2.in",  // stagger 자체의 이징
  },
});
```

### each vs amount

| 속성 | 설명 | 10개 요소일 때 |
|------|------|---------------|
| `each: 0.1` | 요소 사이 0.1초 고정 | 총 stagger 0.9초 |
| `amount: 1` | 총 1초를 요소 수로 분배 | 각 0.11초 간격 |

### from 옵션

| 값 | 설명 |
|----|------|
| `"start"` | 첫 번째부터 (기본) |
| `"end"` | 마지막부터 |
| `"center"` | 가운데에서 양쪽으로 |
| `"edges"` | 양 끝에서 가운데로 |
| `"random"` | 랜덤 순서 |
| `0, 1, 2...` | 특정 인덱스부터 |

### 그리드 stagger

```js
stagger: {
  grid: [rows, cols], // 명시적 그리드 크기
  // 또는
  grid: "auto",       // 레이아웃에서 자동 감지
  from: "center",     // 가운데에서 방사형으로
  axis: "x",          // x축만 ("x", "y", 또는 null = 둘 다)
}
```

### 실전 팁

- `stagger: 0.05` ~ `0.15`가 대부분의 UI 애니메이션에 적합
- `from: "center"` + `grid: "auto"` = 아름다운 방사형 리빌
- `ease`는 stagger 타이밍 분배에 적용됨 (애니메이션 ease와 별개)

---

## 9. Plugin Registration

### gsap.registerPlugin()

사용할 플러그인을 한 번 등록. 트리셰이킹 지원 — 등록한 플러그인만 번들에 포함.

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);
```

### 주요 플러그인

| 플러그인 | 패키지 | 용도 |
|---------|--------|------|
| `ScrollTrigger` | `gsap/ScrollTrigger` | 스크롤 기반 애니메이션 |
| `SplitText` | `gsap/SplitText` | 텍스트 분리 (유료) |
| `Flip` | `gsap/Flip` | FLIP 레이아웃 애니메이션 |
| `Draggable` | `gsap/Draggable` | 드래그 인터랙션 |
| `MotionPathPlugin` | `gsap/MotionPathPlugin` | SVG 경로 따라 이동 |
| `TextPlugin` | `gsap/TextPlugin` | 텍스트 교체 애니메이션 |
| `Observer` | `gsap/Observer` | 크로스 디바이스 이벤트 감지 |
| `ScrollSmoother` | `gsap/ScrollSmoother` | 부드러운 스크롤 (유료) |
| `CustomEase` | `gsap/CustomEase` | 커스텀 이징 곡선 |
| `useGSAP` | `@gsap/react` | React 통합 훅 |

### Next.js 권장 패턴

```ts
// lib/gsap.ts
"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
export { gsap, ScrollTrigger, useGSAP };
```

앱 전체에서 이 파일을 import하면 플러그인 등록이 항상 보장됨.
