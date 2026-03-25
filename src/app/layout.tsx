import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DISCIPLINE — No Excuses Task System",
  description: "The task system that holds you accountable. No mercy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
