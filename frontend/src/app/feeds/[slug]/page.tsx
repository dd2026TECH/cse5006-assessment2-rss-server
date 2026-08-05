import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatDate, getPostBySlug } from "@/lib/posts";
import Breadcrumbs from "@/components/Breadcrumbs";
import CitedParagraph from "@/components/CitedParagraph";
import styles from "./post.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return {
    title: post ? post.title : "Post not found",
    description: post?.summary,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className={styles.post}>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Feeds", href: "/feeds" },
          { label: post.title },
        ]}
      />

      <header className={styles.header}>
        <p className={styles.category}>{post.category}</p>
        <h1>{post.title}</h1>
        <p className={styles.meta}>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true"> · </span>
          {post.source}
          <span aria-hidden="true"> · </span>
          By {post.author}
        </p>
      </header>

      <Image
        src={post.imageUrl}
        alt={post.imageAlt}
        width={800}
        height={450}
        className={styles.hero}
        priority
      />

      <div className={styles.body}>
        {post.body.map((paragraph, index) => (
          <CitedParagraph key={index} text={paragraph} citations={post.citations} />
        ))}
      </div>
    </article>
  );
}
