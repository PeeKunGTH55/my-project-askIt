import Image from "next/image";
import { useState } from "react";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";

const LOGO_SRC =
  "https://cdn.discordapp.com/attachments/1083401978698276975/1538837423281274904/image.png?ex=6a842187&is=6a82d007&hm=703093e76b88858a43879997ee43e35b6634874350ebe6f4dbb669fcb32735b8&";

function Header({ onSearch }) {
  const { data: session } = useSession();
  const [term, setTerm] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(term);
  };

  const handleLogoClick = () => {
    setTerm("");
    onSearch?.("");
    router.push("/");
  };

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
            width={40}
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
            className="h-full w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </form>

        {/* Auth button */}
        {session ? (
          <button
            type="button"
            onClick={() => signOut()}
            className="hidden h-10 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white pl-2 pr-3 transition-all hover:border-gray-300 hover:shadow-sm lg:flex"
          >
            <img
              src="/google-icon.png"
              alt=""
              className="h-6 w-6 shrink-0 rounded-full"
            />
            <div className="flex min-w-0 flex-col text-left text-xs leading-tight">
              <span className="truncate font-medium text-gray-900">
                {session.user?.name}
              </span>
              <span className="text-gray-500">Sign out</span>
            </div>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-400" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => signIn()}
            className="hidden h-10 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm lg:flex"
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
