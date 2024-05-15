"use client";
import Navbar from "./components/Navbar";
import "./globals.css";
import { AuthContextProvider } from "./context/AuthContext.mjs";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900">
        <AuthContextProvider>
          <Navbar />
          {children}
        </AuthContextProvider>
      </body>
    </html>
  );
}