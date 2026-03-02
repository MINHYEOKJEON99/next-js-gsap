"use client";

import { useRef, useEffect } from "react";
import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";

const BLOCK_SIZE = 80;

export default function TransitionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // 전환 블록을 담을 그리드 컨테이너
  const transitionGridRef = useRef<HTMLDivElement | null>(null);
  // 전환 블록을 담을 배열(모든 블록)
  const blocksRef = useRef<HTMLDivElement[]>([]);

  const createTransitionGrid = () => {
    if (!transitionGridRef.current) return;

    const container = transitionGridRef.current;
    container.innerHTML = "";
    blocksRef.current = [];

    const gridWidth = window.innerWidth;
    const gridHeight = window.innerHeight;

    // 그리드의 열과 행 수 계산
    // +1을 하는 이유는 특정 화면 크기에서 애니메이션 도중 하단에 작은 공백이 생기는 일반적인 문제를 해결
    const columns = Math.ceil(gridWidth / BLOCK_SIZE);
    const rows = Math.ceil(gridHeight / BLOCK_SIZE) + 1;

    const offsetX = (gridWidth - columns * BLOCK_SIZE) / 2;
    const offsetY = (gridHeight - rows * BLOCK_SIZE) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const block = document.createElement("div");
        block.className = "transition-block";
        block.style.cssText = `
          width: ${BLOCK_SIZE}px;
          height: ${BLOCK_SIZE}px;
          left: ${col * BLOCK_SIZE + offsetX}px;
          top: ${row * BLOCK_SIZE + offsetY}px;
        `;
        container.appendChild(block);
        blocksRef.current.push(block);
      }
    }

    gsap.set(blocksRef.current, { opacity: 0 });
  };

  useEffect(() => {
    createTransitionGrid();
    window.addEventListener("resize", createTransitionGrid);
    return () => window.removeEventListener("resize", createTransitionGrid);
  }, []);

  return (
    <TransitionRouter
      auto
      leave={(next) => {
        const tween = gsap.to(blocksRef.current, {
          opacity: 1,
          duration: 0.05,
          ease: "power2.inOut",
          // amount 시간, from - 블록들이 어떤 순서로 애니메이션 하는지
          stagger: { amount: 0.5, from: "random" },
          onComplete: next,
        });
        // 사용자가 빠르게 페이지를 전환할 경우 애니메이션이 중단되지 않도록 제대로 처리
        return () => tween.kill();
      }}
      enter={(next) => {
        gsap.set(blocksRef.current, { opacity: 1 });
        const tween = gsap.to(blocksRef.current, {
          opacity: 0,
          duration: 0.05,
          delay: 0.3,
          ease: "power2.inOut",
          stagger: { amount: 0.5, from: "random" },
          onComplete: next,
        });
        return () => tween.kill();
      }}>
      {/* 밑레 div 브록은 전환 애니메이션을 위한 블록입니다.
        전환 효과가 재생될 때만 블록을 표시하는 캔버스로 사용 */}
      <div ref={transitionGridRef} className="transition-grid" />
      {children}
    </TransitionRouter>
  );
}
