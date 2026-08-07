import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js blocks cross-origin requests to dev-only assets (including the
  // HMR websocket) by default — only localhost is implicitly allowed. The
  // container is reached via the EC2 instance's public DNS, which changes
  // every Learner Lab session, so a specific hostname can't be hardcoded here
  // (see frontend/lib/apiConfig.ts for the same constraint on the API side).
  // `**.amazonaws.com` matches any AWS-assigned public DNS regardless of
  // region or how many subdomain segments precede it. Without this, the dev
  // server silently blocks the HMR socket and the client bundle never
  // hydrates — every client component (RSS Client, theme toggle, search,
  // hamburger menu) stays inert while the server-rendered HTML still looks
  // fine, which is what made this so easy to miss locally.
  allowedDevOrigins: ["**.amazonaws.com"],
};

export default nextConfig;
