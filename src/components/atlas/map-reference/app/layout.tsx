import type {Metadata} from 'next';
import { EB_Garamond, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'The Atlas',
  description: "An antique trader's atlas rendered digitally",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${jetbrainsMono.variable}`}>
      <body className="font-serif bg-[#1a1714]" suppressHydrationWarning>{children}</body>
    </html>
  );
}
