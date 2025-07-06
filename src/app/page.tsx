'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">PersonaOps Dashboard</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link href="/intel" className="bg-blue-600 text-white rounded-lg px-6 py-4 text-lg font-semibold text-center hover:bg-blue-700 transition">Intel (Company Analyzer)</Link>
        <Link href="/gtm" className="bg-emerald-600 text-white rounded-lg px-6 py-4 text-lg font-semibold text-center hover:bg-emerald-700 transition">GTM (ICP Generator)</Link>
        {/* Add more links for Lead and Campaigns after Intel/GTM are tested */}
      </div>
    </main>
  );
}
