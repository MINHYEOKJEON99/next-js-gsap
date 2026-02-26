"use client";

import { useRef } from "react";

import { ReactLenis } from "lenis/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Step2() {
  // useRef를 적극 이용하는건 jsx요소에 쉽게 접근하게 만들기 위함
  const containerRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const heroImgElementRef = useRef<HTMLImageElement>(null);
  const heroMaskRef = useRef<HTMLDivElement>(null);
  const heroGridOverlayRef = useRef<HTMLDivElement>(null);
  const marker1Ref = useRef<HTMLDivElement>(null);
  const marker2Ref = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const heroContent = heroContentRef.current!;
      const heroImg = heroImgRef.current!;
      const heroImgElement = heroImgElementRef.current!;
      const heroMask = heroMaskRef.current!;
      const heroGridOverlay = heroGridOverlayRef.current!;
      const marker1 = marker1Ref.current!;
      const marker2 = marker2Ref.current!;
      const progressBar = progressBarRef.current!;

      const heroContentHeight = heroContent.offsetHeight;
      const viewportHeight = window.innerHeight;
      const heroImgHeight = heroImg.offsetHeight;

      // 컨텐츠와 배경이 움직일 거리 계산
      const heroContentMovedistance = heroContentHeight - viewportHeight;
      const heroImgMovedistance = heroImgHeight - viewportHeight;

      // 기존 이징 프리셋에 의존하는 대신 직접제어,
      // 이를 통해서 스크롤에 더 자연스러운 느낌을 주고
      // 대칭적인 이징 곡선을 얻음
      // 나중에 progress bar와 매핑 해 부드럽게 가감속 될수 있음
      const ease = (x: number): number => x * x * (3 - 2 * x);

      ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: `+=${window.innerHeight * 4}px`,
        // 영역의 스크롤 지속시간 만큼 간격 추가해 페이지의
        // 나머지 부분이 갑자기 위로 이동하는것 방지
        pin: true,
        pinSpacing: true,
        // 애니메이션 시간 x 스크롤 기반
        scrub: 1,

        // onUpdate 콜백은 스크롤 트리거가 활성화 되어있는 동안 지속적으로 실행됨
        onUpdate: (self) => {
          gsap.set(progressBar, {
            // --progress: 0은 초기값이고, JS가
            // 스크롤마다 이 값을 덮어쓰는 구조
            // self.progress는  0 - 1 까지 업데이트 되며 css에 제공
            "--progress": self.progress,
          });

          // 이동될 거리를 0 - 1 까지 음수 곱을 하여 위로 올라가게 만듦
          // 초기에 top 0부터 밑으로 쭈욱 이어져있으니까
          gsap.set(heroContent, {
            y: -self.progress * heroContentMovedistance,
          });

          // 스크롤의 진행상황이 어느 부분에 있는지에 따라 다르게 맵핑
          // progress 0 → 0.45    ease 적용하며 0 → 0.65까지 부드럽게 이동
          // progress 0.45 → 0.75  0.65 고정 (멈춤)
          // progress 0.75 → 1.0   ease 적용하며
          // 0.65 → 1.0까지 부드럽게 이동
          let heroImgProgress;
          if (self.progress <= 0.45) {
            heroImgProgress = ease(self.progress / 0.45) * 0.65;
          } else if (self.progress <= 0.75) {
            heroImgProgress = 0.65;
          } else {
            heroImgProgress = 0.65 + ease((self.progress - 0.75) / 0.25) * 0.35;
          }

          gsap.set(heroImg, {
            y: heroImgProgress * heroImgMovedistance,
          });

          let heroMaskScale; //마스크 크기
          let heroImgSaturation; //이미지 채도
          let heroImgOverlayOpacity; // 이미지를 좀 어둡게 만드는 효과

          if (self.progress <= 0.4) {
            // 초기값
            heroMaskScale = 3.5;
            heroImgSaturation = 1;
            heroImgOverlayOpacity = 0.35;
          } else if (self.progress <= 0.5) {
            const phaseProgress = ease((self.progress - 0.4) / 0.1);
            heroMaskScale = 3.5 - phaseProgress * 2.5;
            heroImgSaturation = 1 - phaseProgress;
            heroImgOverlayOpacity = 0.35 + phaseProgress * 0.35;
          } else if (self.progress <= 0.75) {
            heroMaskScale = 1;
            heroImgSaturation = 0;
            heroImgOverlayOpacity = 0.7;
          } else if (self.progress <= 0.85) {
            const phaseProgress = ease((self.progress - 0.75) / 0.1);
            heroMaskScale = 1 + phaseProgress * 2.5;
            heroImgSaturation = phaseProgress;
            heroImgOverlayOpacity = 0.7 - phaseProgress * 0.35;
          } else {
            heroMaskScale = 3.5;
            heroImgSaturation = 1;
            heroImgOverlayOpacity = 0.35;
          }

          // gsap.set은 해당 요소에 애니메이션 스타일을 적용가능
          // ex) gsap.set(요소, {scale: 변수})
          gsap.set(heroMask, {
            scale: heroMaskScale,
          });

          gsap.set(heroImgElement, {
            // filter는 이미지의 시각효과 적용 saturate는 채도를 결정
            filter: `saturate(${heroImgSaturation})`,
          });

          // 배경이미지의 after속성 전체 꽉채우고 --dark가 적용되어있는 배경
          // 즉 좀 어둡게 만들어주는 효과
          gsap.set(heroImg, {
            "--overlay-opacity": heroImgOverlayOpacity,
          });

          let heroGridOpacity;
          if (self.progress <= 0.475) {
            heroGridOpacity = 0;
          } else if (self.progress <= 0.5) {
            // 0.475 즉 47.5% - 50% 까지 heroGrid를 0 - 1 opacity 스르륵
            heroGridOpacity = ease((self.progress - 0.475) / 0.025);
          } else if (self.progress <= 0.75) {
            heroGridOpacity = 1;
          } else if (self.progress <= 0.775) {
            // 0.75 - 0.775 즉 75% - 77.5% 까지 1 - 0 opacity
            heroGridOpacity = 1 - ease((self.progress - 0.75) / 0.025);
          } else {
            heroGridOpacity = 0;
          }

          gsap.set(heroGridOverlay, {
            opacity: heroGridOpacity,
          });

          // 위와 동일 마커 자체의 opacity
          let marker1Opacity;
          if (self.progress <= 0.5) {
            marker1Opacity = 0;
          } else if (self.progress <= 0.55) {
            marker1Opacity = ease((self.progress - 0.5) / 0.05);
          } else if (self.progress <= 0.7) {
            marker1Opacity = 1;
          } else if (self.progress <= 0.75) {
            marker1Opacity = 1 - ease((self.progress - 0.7) / 0.05);
          } else {
            marker1Opacity = 0;
          }

          gsap.set(marker1, {
            opacity: marker1Opacity,
          });

          let marker2Opacity;
          if (self.progress <= 0.55) {
            marker2Opacity = 0;
          } else if (self.progress <= 0.6) {
            marker2Opacity = ease((self.progress - 0.55) / 0.05);
          } else if (self.progress <= 0.7) {
            marker2Opacity = 1;
          } else if (self.progress <= 0.75) {
            marker2Opacity = 1 - ease((self.progress - 0.7) / 0.05);
          } else {
            marker2Opacity = 0;
          }

          gsap.set(marker2, {
            opacity: marker2Opacity,
          });
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <>
      <ReactLenis root />
      <div ref={containerRef}>
        {/* hero section은 전체 스크롤 시퀀스가 진행되는 곳 */}
        <section className="hero">
          {/* hero-img 배경 이미지 - 전체 애니메이션 배경역할 */}
          <div className="hero-img" ref={heroImgRef}>
            <img ref={heroImgElementRef} src="/step2/hero-img.jpg" alt="" />
          </div>

          {/* hero-mask는 img태그 사용 x - css에서 svg적용하여 생성 */}
          <div className="hero-mask" ref={heroMaskRef}></div>

          {/* 이미지는 처음에 숨겼다가 애니메이션 단계에서 서서히 나타나도록 하는 효과를 줄거임 */}
          <div className="hero-grid-overlay" ref={heroGridOverlayRef}>
            <img src="/step2/grid-overlay.svg" alt="" />
          </div>

          {/* marker와 marker1,2는 깜빡이는 효과를 줄것 / 
          두개의 마커가 동시에 나타나지 않도록 독립적인 애니메이션 효과를 적용*/}
          <div className="marker marker-1" ref={marker1Ref}>
            <span className="marker-icon"></span>
            <p className="marker-label">Anchor Field</p>
          </div>

          <div className="marker marker-2" ref={marker2Ref}>
            <span className="marker-icon"></span>
            <p className="marker-label">Drift Field</p>
          </div>

          {/* 이 컨테이너는 뷰포트보다 훨씬 더 높음
          사용자가 스크롤할때 세로로 이동하여 heroImg는 고정된 상태로
          여러 영역을 이동하는 듯한 느낌을 주는 영역 */}
          <div className="hero-content" ref={heroContentRef}>
            {/* content를 나누는 block div */}
            <div className="hero-content-block">
              {/* copy 내부래퍼는 레이아웃, 너비 및 간격을 제어하는데 도움 */}
              <div className="hero-content-copy">
                <h1>Location Framework</h1>
              </div>
            </div>
            <div className="hero-content-block">
              <div className="hero-content-copy">
                <h2>Coordinate Mapping</h2>
                <p>
                  Terrain data is interpreted through directional vectors. Movement responds to relative position rather
                  than absolute distance.
                </p>
              </div>
            </div>
            <div className="hero-content-block">
              <div className="hero-content-copy">
                <h2>Active Locations</h2>
                <p>
                  Key points are indexed within the field. Each location functions as a reference for spatial alignment
                  and transition logic.
                </p>
              </div>
            </div>
            <div className="hero-content-block">
              <div className="hero-content-copy">
                <h2>Spatial Center</h2>
                <p>
                  The system converges toward a balanced focal region. Motion decelerates as positional variance reaches
                  equilibrium.
                </p>
              </div>
            </div>
          </div>

          {/* 스크롤 트리거 진행률 바 */}
          <div className="hero-scroll-progress-bar" ref={progressBarRef}></div>
        </section>

        {/*고정된 애니메이션이 종료되고 페이지가 정상 스크롤 모드로 돌아옴 - outro section */}
        <section className="outro">
          <p>The system has reached its final spatial state.</p>
        </section>
      </div>
    </>
  );
}
