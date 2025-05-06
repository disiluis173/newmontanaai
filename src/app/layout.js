import './globals.css';
import { ApiKeyProvider } from './context/ApiKeyContext';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Montana AI - Chat con múltiples modelos',
  description: 'Interfaz para chatear con múltiples modelos de IA como DeepSeek y X.AI (Grok)',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' }
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
        <ApiKeyProvider>
          <div className="flex flex-col h-full">
            {children}
          </div>
        </ApiKeyProvider>
      </body>
    </html>
  );
} 