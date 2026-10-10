import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Groundtruth · India GCC planner",
  description:
    "Plan a first Global Capability Centre in India on numbers you can trace: city costs, the state incentives you actually qualify for, setup roadmap, source conflicts and provider evidence.",
  openGraph: {
    title: "Groundtruth · India GCC planner",
    description: "City costs, real incentive eligibility, setup roadmap and sourced answers for first-time GCC teams.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
