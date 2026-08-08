import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import PostForm from "@/components/PostForm";
import styles from "../feeds.module.css";

export const metadata: Metadata = {
  title: "New post",
  description: "Publish a new post to the RSS Server's database.",
};

export default function NewPostPage() {
  return (
    <section>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Feeds", href: "/feeds" },
          { label: "New post" },
        ]}
      />
      <h1>New post</h1>
      <p className={styles.lede}>
        Publishes straight to the RSS Server&apos;s database through its API — the
        same CRUD endpoints editing and deleting a post use.
      </p>
      <PostForm mode="create" />
    </section>
  );
}
