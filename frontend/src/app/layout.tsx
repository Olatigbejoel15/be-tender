import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext"; // the shared cart
import CartDrawer from "@/components/CartDrawer"; // the slide-out panel

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "BE TENDER | Gym Wear",
  description: "Premium gym wear designed to move with you.",
};

// Runs before the page is painted: applies the saved navy theme right away.
const themeScript = `try{if(localStorage.getItem("theme")==="navy"){document.documentElement.dataset.theme="navy"}}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${outfit.variable} font-sans antialiased`}>
        {/* Everything inside the provider can use useCart() */}
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}