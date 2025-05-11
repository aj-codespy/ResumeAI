import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'ResumAI - AI Powered Resume Builder',
  description: 'Create and revamp your resume with the power of AI. Build your future, faster.',
  icons: {
    // icon: "/favicon.ico", // If you add a favicon later
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased flex flex-col min-h-screen bg-background text-foreground"
        )}
      >
        <Header />
        <main className="flex-grow container mx-auto px-4">
          {/* The py-8 from previous main is removed, pages will control their own top/bottom padding */}
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
