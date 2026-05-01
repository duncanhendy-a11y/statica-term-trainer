import Image from "next/image";
import Link from "next/link";

export default function NavLogo() {
  return (
    <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        background: "#1C2B3A",
        borderRadius: "8px",
        padding: "6px 14px",
      }}>
        <Image src="/logo.svg" alt="IDEA StatiCa" width={130} height={16} priority />
      </span>
    </Link>
  );
}
