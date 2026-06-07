import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import ReactQueryProvider from '@/components/ReactQueryProvider';
import AuthGate from '@/components/AuthGate';
import ErrorBoundary from '@/components/ErrorBoundary';
import SearchDialog from '@/components/SearchDialog';
import JumpDialog from '@/components/JumpDialog';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { ThemeProvider } from 'next-themes';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'NexusNotes',
  description: 'Your second brain for CS, DSA, and internship mastery.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, geistMono.variable)} suppressHydrationWarning>
      <body className={`bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex h-screen overflow-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ReactQueryProvider>
            <AuthGate>
              <ErrorBoundary>
                <ResponsiveLayout>
                  {children}
                </ResponsiveLayout>
                <SearchDialog />
                <JumpDialog />
              </ErrorBoundary>
            </AuthGate>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
