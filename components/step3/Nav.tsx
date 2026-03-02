import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href="/step3">Homebase</Link>
      <Link href="/step3/gateway">Gateway</Link>
      <Link href="/step3/station">Station</Link>
      <Link href="/step3/colony">Colony</Link>
    </nav>
  );
}
