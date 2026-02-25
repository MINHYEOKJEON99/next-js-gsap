import "./globals.css";

export const metadata = {
  title: "Inversa Scroll Animation | Codegrid",
  description: "Inversa Scroll Animation | Codegrid",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
