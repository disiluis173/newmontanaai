import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Montana AI',
  description: 'Chat con IA usando DeepSeek y Grok',
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
        <div className="flex flex-col h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
