import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import Breadcrumbs from "@/components/Breadcrumbs";
import PostDetail from "@/components/PostDetail";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return {
    title: post ? post.title : "Post not found",
    description: post?.summary,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Feeds", href: "/feeds" },
          { label: post.title },
        ]}
      />
      <PostDetail post={post} />
    </>
  );
}
