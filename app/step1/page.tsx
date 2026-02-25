"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ReactLenis from "lenis/react";
import { useEffect, useRef } from "react";
import "./globals.css";

// 프로젝트 어디서든 스크롤 트리거를 사용하기 전에 반드시 필요
gsap.registerPlugin(ScrollTrigger);

export default function Step1() {
  const lenisRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }

    lenisRef.current?.lenis?.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => gsap.ticker.remove(update);
  }, []);

  //section과 container를 분리한 이유는 section은 핀 동작을 처리 / container는 기울기 애니메이션을 처리 -> 책임 분리
  // 책임을 분리해야 충돌 방지 / 더 나은 제어 가능
  useGSAP(
    () => {
      const sections = document.querySelectorAll("section");

      sections.forEach((section, index) => {
        const container = section.querySelector(".container");

        //컨테이너의 회전을 0으로 되돌리는 애니메이션
        //ease를 시행x -> 애니메이션의 스크롤 진행률과 관련
        // 스크롤할때 부드럽게 움직이는 효과때문에 표류하는거 처럼 느껴짐
        //scrub -> 애니메이션이 시간기반x , 스크롤 위 아래가 정방향 역방향 재생
        gsap.to(container, {
          rotation: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top 20%",
            scrub: true,
          },
        });

        if (index === sections.length - 1) return;

        ScrollTrigger.create({
          trigger: section,
          start: "bottom bottom",
          end: "bottom top",
          pin: true,
          pinSpacing: false,
        });
      });
    },
    { scope: containerRef },
  );
  // 범위를  containerRef로 참조해주며 gsap에게 containerRef안에 요소만 찾도록 지시
  // 그렇게 될 경우 분리, 정리 작업이 수월해짐
  return (
    <>
      <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
      <main ref={containerRef}>
        <section className="one">
          <div className="container">
            <div className="col">
              <h1>Entry Point</h1>
            </div>
            <div className="col">
              <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est laborum dolorum cumque inventore, rerum
                harum enim tempore totam doloremque provident neque molestiae impedit, dolorem amet numquam repudiandae
                vel modi quidem.
              </p>
            </div>
          </div>
        </section>
        <section className="two">
          <div className="container">
            <div className="col">
              <div className="img">
                <img src="/step1/img1.jpg" alt="gesture" />
              </div>
            </div>
            <div className="col">
              <h1>Gesture</h1>
              <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est laborum dolorum cumque inventore, rerum
                harum enim tempore totam doloremque provident neque molestiae impedit, dolorem amet numquam repudiandae
                vel modi quidem.
              </p>
            </div>
          </div>
        </section>
        <section className="three">
          <div className="container">
            <div className="col">
              <h1>Variation</h1>
              <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est laborum dolorum cumque inventore, rerum
                harum enim tempore totam doloremque provident neque molestiae impedit, dolorem amet numquam repudiandae
                vel modi quidem.
              </p>
            </div>
            <div className="col">
              <div className="img">
                <img src="/step1/img2.jpg" alt="step1/img2" />
              </div>
            </div>
          </div>
        </section>
        <section className="four">
          <div className="container">
            <div className="img">
              <img src="/step1/img3.jpg" alt="gesture" />
            </div>
            <h1>The Stance</h1>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est laborum dolorum cumque inventore, rerum
              harum enim tempore totam doloremque provident neque molestiae impedit, dolorem amet numquam repudiandae
              vel modi quidem.
            </p>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est laborum dolorum cumque inventore, rerum
              harum enim tempore totam doloremque provident neque molestiae impedit, dolorem amet numquam repudiandae
              vel modi quidem.
            </p>
          </div>
        </section>
        <section className="five">
          <div className="container">
            <div className="col">
              <h1>Stillness</h1>
            </div>
            <div className="col">
              <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est laborum dolorum cumque inventore, rerum
                harum enim tempore totam doloremque provident neque molestiae impedit, dolorem amet numquam repudiandae
                vel modi quidem.
              </p>
            </div>
          </div>
        </section>
        <section className="six">
          <div className="container">
            <div className="col">
              <h1>Release</h1>
            </div>
            <div className="col">
              <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est laborum dolorum cumque inventore, rerum
                harum enim tempore totam doloremque provident neque molestiae impedit, dolorem amet numquam repudiandae
                vel modi quidem.
              </p>
            </div>
          </div>
        </section>
        <footer>Images by pikisuperstar, upklyak, freepik on Freepik</footer>
      </main>
    </>
  );
}
