import type { Metadata } from "next"; // TypeScript type for page info
import { Outfit } from "next/font/google"; // loads a Google font, optimized by Next.js
import "./globals.css"; // applies our styles to the whole site

// Load Outfit and store it in a CSS variable called --font-outfit
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

// The browser tab title and the description search engines show
export const metadata: Metadata = {
  title: "BE TENDER | Gym Wear",
  description: "Premium gym wear designed to move with you.",
};

// Root layout: every page is placed inside this
export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // "children" = the page currently being shown
}) {
  return (
    <html lang="en">
      {/* outfit.variable makes the font available, font-sans uses it, antialiased smooths the text */}
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}