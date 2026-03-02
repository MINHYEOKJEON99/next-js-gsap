"use client";
import React, { useRef } from "react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger);

interface CopyProps {
  children: React.ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  blockColor?: string;
  stagger?: number;
  duration?: number;
}

export default function Copy({
  children,
  animateOnScroll = true,
  delay = 0,
  blockColor = "#000",
  stagger = 0.15,
  duration = 0.75,
}: CopyProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const splitRefs = useRef<SplitText[]>([]);
  const lines = useRef<Element[]>([]);
  const blocks = useRef<HTMLDivElement[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      splitRefs.current = [];
      lines.current = [];
      blocks.current = [];

      let elements = [];
      if (containerRef.current.hasAttribute("data-copy-wrapper")) {
        elements = Array.from(containerRef.current.children);
      } else {
        elements = [containerRef.current];
      }

      // 여러 텍스트 요소를 하나씩 처리
      elements.forEach((element) => {
        const split = SplitText.create(element, {
          // 텍스트를 줄 단위로 분리
          type: "lines",
          // "block-line++"
          // → 각 줄에 클래스 부여
          // (++는 자동 번호 증가용)
          linesClass: "block-line++",
          // → 줄을 나누는 민감도 조절 (반응형 줄 깨짐 보정)
          lineThreshold: 0.1,
        });

        // 나중에 revert() 같은 정리 작업용
        splitRefs.current.push(split);

        // 이제 줄 하나씩 감싸는 작업 시작 👇
        split.lines.forEach((line) => {
          // wrapper div 생성
          const wrapper = document.createElement("div");
          // 원래 줄 위치에 wrapper 삽입
          wrapper.className = "block-line-wrapper";
          line.parentNode!.insertBefore(wrapper, line);
          // 그 안에 line을 넣음
          wrapper.appendChild(line);

          // → overflow hidden + 애니메이션을 위해
          // → wrapper를 기준으로 블록이 움직이게 만들기 위함

          // 덮는 블록 생성 (리빌 효과용)
          const block = document.createElement("div");
          block.className = "block-revealer";
          block.style.backgroundColor = blockColor;
          wrapper.appendChild(block);

          lines.current.push(line);
          blocks.current.push(block);
        });
      });

      // ── 초기 상태 설정 ──
      // 텍스트를 숨기고, 블록(가림막)은 가로 크기 0으로 만들어 안 보이게 함
      // transformOrigin: "left center" → scaleX가 왼쪽 기준으로 커지도록 설정
      gsap.set(lines.current, { opacity: 0 });
      gsap.set(blocks.current, { scaleX: 0, transformOrigin: "left center" });

      // ── 블록 리빌 애니메이션 팩토리 함수 ──
      // block: 텍스트를 덮는 가림막 div (배경색이 있는 사각형)
      // line: 실제 텍스트 줄 요소
      // index: 몇 번째 줄인지 (stagger 계산용)
      const createBlockRevealAnimation = (block: HTMLDivElement, line: Element, index: number) => {
        // gsap.timeline()은 여러 애니메이션을 순차적으로 체이닝하는 컨테이너
        // 위치 파라미터를 안 넣으면 이전 단계가 끝난 후 다음 단계가 자동 실행됨
        //
        // delay 계산: 기본 delay + (줄 번호 × stagger)
        // 예) stagger=0.15일 때 → 0번째: 0초, 1번째: 0.15초, 2번째: 0.3초 후 시작
        const tl = gsap.timeline({ delay: delay + index * stagger });

        // ── 타임라인 시각화 (duration=0.75 기준) ──
        //
        // 시간  0s ──────── 0.75s ──────── 1.5s
        //       │            │              │
        // 단계1 │ ■■■■■■■■▶ │              │  tl.to(block, scaleX: 1)
        //       │ 블록이 왼→오로 커짐       │  블록이 텍스트를 완전히 덮음
        //       │            │              │
        // 단계2 │            ● (즉시)       │  tl.set(line, opacity: 1)
        //       │            │ 텍스트 표시   │  블록 뒤에 숨어있으므로 아직 안 보임
        //       │            │              │
        // 단계3 │            ● (즉시)       │  tl.set(block, transformOrigin: "right center")
        //       │            │ 기준점 변경   │  이제 scaleX가 오른쪽 기준으로 줄어들도록
        //       │            │              │
        // 단계4 │            │ ■■■■■■■■▶   │  tl.to(block, scaleX: 0)
        //       │            │ 블록이 오→왼   │  블록이 사라지면서 텍스트가 드러남
        //       │            │ 으로 줄어듦   │

        // 단계1: 블록이 scaleX 0→1로 커지면서 왼쪽에서 오른쪽으로 펼쳐짐
        //        transformOrigin이 "left center"이므로 왼쪽 끝이 고정되고 오른쪽으로 확장
        tl.to(block, { scaleX: 1, duration: duration, ease: "power4.inOut" });

        // 단계2: 블록이 텍스트를 완전히 덮은 상태에서 텍스트를 즉시 표시 (duration: 0)
        //        블록에 가려져 있어서 사용자에게는 변화가 안 보임
        tl.set(line, { opacity: 1 });

        // 단계3: 블록의 기준점을 오른쪽으로 변경 (즉시, duration: 0)
        //        이제 scaleX가 줄어들 때 오른쪽이 고정되고 왼쪽으로 줄어듦
        tl.set(block, { transformOrigin: "right center" });

        // 단계4: 블록이 scaleX 1→0으로 줄어들면서 오른쪽에서 왼쪽으로 사라짐
        //        블록이 사라지면서 뒤에 있던 텍스트가 순차적으로 드러남
        tl.to(block, { scaleX: 0, duration: duration, ease: "power4.inOut" });

        return tl;
      };

      // true → 스크롤 시 실행
      // false → 즉시 실행
      if (animateOnScroll) {
        // 모든 줄의 block에 대해 실행
        // index는 줄 번호
        blocks.current.forEach((block, index) => {
          const tl = createBlockRevealAnimation(block, lines.current[index], index);
          tl.pause();

          ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top 90%",
            once: true,
            onEnter: () => tl.play(),
          });
        });
      } else {
        // 스크롤 없이 바로 실행
        blocks.current.forEach((block, index) => {
          createBlockRevealAnimation(block, lines.current[index], index);
        });
      }

      // useGSAP의 클린업 함수 — 컴포넌트 언마운트 또는 dependencies 변경 시 실행
      return () => {
        // 1) SplitText가 분리한 DOM을 원래 텍스트로 복원
        //    SplitText.create()가 만든 <div class="block-line"> 들을 제거하고
        //    원본 텍스트 노드로 되돌림
        splitRefs.current.forEach((split) => split?.revert());

        // 2) 우리가 직접 만든 wrapper DOM도 수동으로 제거
        //    SplitText.revert()는 자기가 만든 것만 되돌리므로
        //    우리가 수동으로 추가한 block-line-wrapper는 직접 정리해야 함
        const wrappers = containerRef.current?.querySelectorAll(".block-line-wrapper");
        wrappers?.forEach((wrapper) => {
          if (wrapper.parentNode && wrapper.firstChild) {
            // wrapper 안의 자식(원래 line 요소)을 wrapper 앞으로 꺼냄
            // Before: <parent> → <wrapper> → <line> </wrapper> </parent>
            // After:  <parent> → <line> </parent>
            wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
            // 빈 wrapper 제거
            wrapper.remove();
          }
        });
      };
    },
    {
      scope: containerRef,
      dependencies: [animateOnScroll, delay, blockColor, stagger, duration],
    },
  );

  if (React.Children.count(children) === 1) {
    return React.cloneElement(children as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>, {
      ref: containerRef,
    });
  }

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} data-copy-wrapper="true">
      {children}
    </div>
  );
}
