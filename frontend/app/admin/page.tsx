import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ManageFeeds from "@/components/ManageFeeds";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage the RSS Server's feeds.",
};

export default function AdminPage() {
  return (
    <section>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Admin" }]} />
      <h1>Admin</h1>
      <p className={styles.lede}>
        Administrative actions against the RSS Server&rsquo;s database, through
        its API.
      </p>
      <ManageFeeds />
    </section>
  );
}
