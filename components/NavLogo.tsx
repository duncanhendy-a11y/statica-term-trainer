import Image from "next/image";
import Link from "next/link";

export default function NavLogo() {
  return (
    <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
      <Image src="/logo.svg" alt="IDEA StatiCa" width={130} height={16} priority />
    </Link>
  );
}
