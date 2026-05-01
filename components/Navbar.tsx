"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const links = [
    { href: "/",         label: "Home"     },
    { href: "/progress", label: "Progress" },
  ];
  return (
    <nav className="sticky top-0 z-50 border-b border-[#2E2E2E] bg-[#1A1A1A]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="IDEA StatiCa" width={140} height={18} priority />
        </Link>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "bg-[#F36E22] text-white"
                  : "text-[#8A8A8A] hover:text-[#F0F0F0] hover:bg-[#2E2E2E]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
