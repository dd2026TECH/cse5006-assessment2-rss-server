import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Same fix as frontend/next.config.ts — see the comment there. This package
  // has no client components today, so the practical symptom here is just
  // blocked-request console noise rather than broken hydration, but the
  // constraint (EC2's public DNS changes every session, so it can't be
  // hardcoded) is identical.
  allowedDevOrigins: ["**.amazonaws.com"],
};

export default nextConfig;
