import type { Metadata } from "next";
import ThemeSettings from "@/components/ThemeSettings";
import LayoutSettings from "@/components/LayoutSettings";
import styles from "./settings.module.css";

export const metadata: Metadata = {
  title: "Settings",
  description: "Theme and layout preferences.",
};

export default function SettingsPage() {
  return (
    <section className={styles.settings}>
      <h1>Settings</h1>
      <p className={styles.lede}>
        Preferences are stored in your browser and applied across the whole
        application.
      </p>

      <section aria-labelledby="appearance-heading" className={styles.group}>
        <h2 id="appearance-heading" className="sr-only">
          Appearance
        </h2>
        <ThemeSettings />
      </section>

      <section aria-labelledby="layout-heading" className={styles.group}>
        <h2 id="layout-heading" className="sr-only">
          Feed layout
        </h2>
        <LayoutSettings />
      </section>
    </section>
  );
}
