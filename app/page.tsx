import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>GSAP Study</h1>
      <div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <li>
            <Link
              href="/step1"
              style={{
                fontSize: "1.25rem",
                color: "#3b82f6",
                textDecoration: "underline",
              }}
            >
              Step 1
            </Link>
            <span style={{ marginLeft: "0.75rem", color: "#666" }}>— ScrollTrigger - rotate, pin</span>
          </li>
          <li>
            <Link
              href="/step2"
              style={{
                fontSize: "1.25rem",
                color: "#3b82f6",
                textDecoration: "underline",
              }}
            >
              Step 2
            </Link>
            <span style={{ marginLeft: "0.75rem", color: "#666" }}>
              — ScrollTrigger - Mask Image Zoom, element arrange, tatical scroll
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
