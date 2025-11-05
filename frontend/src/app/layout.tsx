'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from "./Components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  const queryClient = new QueryClient()
  
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Navbar/>
            {children}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}