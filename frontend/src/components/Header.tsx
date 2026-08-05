import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import NavBar from "./NavBar";
import HamburgerMenu from "./HamburgerMenu";
import ThemeToggle from "./ThemeToggle";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.siteName}>{siteConfig.siteName}</span>
          <span className={styles.assessment}>{siteConfig.assessmentTitle}</span>
        </Link>
        <div className={styles.controls}>
          <NavBar />
          <ThemeToggle />
          <HamburgerMenu />
        </div>
      </div>
    </header>
  );
}
