import Image from "next/image";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  BellIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Link from "next/link";
import supabase from "../lib/supabaseClient";

const LOGO_SRC =
  "https://cdn.discordapp.com/attachments/1083401978698276975/1538837423281274904/image.png?ex=6a842187&is=6a82d007&hm=703093e76b88858a43879997ee43e35b6634874350ebe6f4dbb669fcb32735b8&";

function Header() {
  const { user, loading, signIn, signOut } = useAuth();
  const [term, setTerm] = useState("");
  const [unread, setUnread] = useState(0);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = term.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
    else router.push("/");
  };

  const handleLogoClick = () => {
    setTerm("");
    router.push("/");
  };

  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .is("read_at", null)
      .then(({ count }) => setUnread(count || 0));
  }, [user]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:gap-6">
        {/* Logo */}
        <button
          type="button"
          onClick={handleLogoClick}
          aria-label="Go to home"
          className="flex h-10 w-24 shrink-0 items-center transition-opacity hover:opacity-80"
        >
          <Image
            src={LOGO_SRC}
            alt="AskIt"
            width={60}
            height={40}
            className="object-contain"
            priority
          />
        </button>

        {/* Search */}
        <form
          onSubmit={handleSubmit}
          role="search"
          className="group flex h-10 flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 transition-colors focus-within:border-gray-300 focus-within:bg-white focus-within:shadow-sm"
        >
          <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-gray-400 transition-colors group-focus-within:text-gray-600" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            type="search"
            placeholder="Search by title or category"
            aria-label="Search posts"
            className="h-full w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </form>

        {/* Auth button */}
        {!loading && user ? (
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="relative rounded-full p-2 hover:bg-slate-100" aria-label={`${unread} unread notifications`}>
              <BellIcon className="h-5 w-5" />
              {unread > 0 && <span className="absolute right-0 top-0 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] text-white">{unread > 99 ? "99+" : unread}</span>}
            </Link>
            <Link
              href={`/user/${user.id}`}
              className="hidden max-w-32 truncate text-sm font-medium text-slate-700 hover:text-purple-600 sm:block"
            >
              {displayName}
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-2 transition-all hover:border-gray-300 hover:shadow-sm sm:pr-3"
            >
              <img src="/google-icon.png" alt="" className="h-6 w-6 shrink-0 rounded-full" />
              <span className="hidden text-xs text-slate-500 sm:block">Sign out</span>
              <ChevronDownIcon className="hidden h-4 w-4 shrink-0 text-gray-400 sm:block" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={signIn}
            className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
          >
            <img
              src="/google-icon.png"
              alt=""
              className="h-5 w-5 shrink-0"
            />
            <span>Sign in</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
