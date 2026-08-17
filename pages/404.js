import Head from "next/head";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <Head><title>Page not found | AskIt</title></Head>
      <p className="text-7xl font-bold text-purple-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-slate-500">The page may have moved or no longer exists.</p>
      <Link href="/" className="mt-6 rounded-full bg-purple-600 px-5 py-2 text-white">Back to AskIt</Link>
    </main>
  );
}
