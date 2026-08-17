import { useRouter } from "next/router";
import Feed from "../components/Feed";
import Head from "next/head";

function SearchPage() {
  const router = useRouter(); // ใช้เข้าถึง query string จาก URL
  const { q } = router.query; // ดึงค่าการค้นหาจาก query parameter ชื่อว่า q
  const query = typeof q === "string" ? q.trim().slice(0, 100) : "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Head>
        <title>{query ? `Search: ${query}` : "Search"} | AskIt</title>
        <meta name="robots" content="noindex,follow" />
      </Head>
      <h1 className="text-2xl font-bold mb-4">
        Search results for: <span className="text-blue-600">"{query}"</span>
      </h1>
      {query ? <Feed searchTerm={query} /> : <p className="text-gray-500">Enter a search term.</p>}
    </div>
  );
}

export default SearchPage;
