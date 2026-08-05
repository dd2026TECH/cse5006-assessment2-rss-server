"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/siteConfig";
import { isActive } from "./NavBar";
import styles from "./HamburgerMenu.module.css";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Close the menu whenever the route changes — state is adjusted during
  // render (React's "adjusting state when props change" pattern).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  // Escape closes the menu and returns focus to the button
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className={styles.wrapper}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span className={`${styles.bar} ${open ? styles.barTopOpen : ""}`} />
        <span className={`${styles.bar} ${open ? styles.barMidOpen : ""}`} />
        <span className={`${styles.bar} ${open ? styles.barBotOpen : ""}`} />
      </button>

      <nav
        id="mobile-menu"
        aria-label="Mobile"
        className={`${styles.menu} ${open ? styles.menuOpen : ""}`}
      >
        <ul className={styles.list}>
          {siteConfig.nav.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.link} ${active ? styles.active : ""}`}
                  aria-current={active ? "page" : undefined}
                  tabIndex={open ? undefined : -1}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
