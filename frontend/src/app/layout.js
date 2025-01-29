import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata = {
  title: "Chat App",
  description: "Una aplicación de chat moderna y minimalista",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <body className={`${geist.className} antialiased bg-background`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
