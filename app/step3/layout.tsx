import Nav from "@/components/step3/Nav";
import "./globals.css";
import TransitionProvider from "@/providers/step3/TransitionProvider";

export const metadata = {
  title: "Block Reveal Page Transition | Codegrid",
  description: "Next.js page transition, powered by next-transition-router.",
};

export default function Step3Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <TransitionProvider>
      <Nav />
      {children}
    </TransitionProvider>
  );
}
