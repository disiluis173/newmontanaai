'use client'

import Chat from './components/Chat';

export default function Home() {
  return (
    <main className="flex flex-col flex-1 h-full bg-gray-50 dark:bg-gray-900">
      <Chat />
    </main>
  );
} 