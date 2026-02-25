import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GSAP Study",
  description: "GSAP ScrollTrigger 학습 프로젝트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
