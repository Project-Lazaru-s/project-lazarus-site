"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/content/site";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type Props = { className: string; label: string; linkClassName?: string };

export function NavLinks({ className, label, linkClassName = "text-sm" }: Props) {
  const pathname = usePathname();
  return (
    <nav aria-label={label}>
      <ul className={className}>
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${linkClassName} transition hover:text-plate ${active ? "text-sunset" : "text-plate/70"}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
