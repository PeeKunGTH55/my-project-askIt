import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Post from "./Post";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const PAGE_SIZE = 20;

function Feed({ topic, searchTerm = "", userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  const fetchPosts = async (nextPage = 0, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    setError("");

    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = searchTerm
      ? supabase.rpc("search_posts", {
          search_text: searchTerm.trim().slice(0, 100),
          result_limit: PAGE_SIZE,
          result_offset: from,
        })
      : supabase.rpc("feed_posts", {
          filter_topic: topic || null,
          filter_user: userId || null,
          sort_by: sortBy,
          result_limit: PAGE_SIZE,
          result_offset: from,
        });

    const categoryRelation = topic ? "categories!inner" : "categories";
    query = query
        .select(
          `
          *,
          comment(id),
          ${categoryRelation}(id, topic),
          profiles!post_user_id_fkey(id, display_name, avatar_url),
          vote(user_id, upvote)
        `
        )
        .order("created_at", { ascending: false });

    const { data, error: queryError } = await query;

    if (queryError) {
      console.error("Error fetching posts:", queryError);
      setError("Could not load posts. Please try again.");
    } else {
      const normalized = (data || []).map((post) => ({
        ...post,
        comments: post.comment?.length || 0,
      }));
      setPosts((current) => (append ? [...current, ...normalized] : normalized));
      setPage(nextPage);
      setHasMore(normalized.length === PAGE_SIZE);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchPosts();
    const refresh = () => fetchPosts();
    window.addEventListener("askit:posts-changed", refresh);
    return () => window.removeEventListener("askit:posts-changed", refresh);
  }, [searchTerm, topic, userId, sortBy]);

  return (
    <div className="mt-5 space-y-4">
      {!searchTerm && (
        <div className="flex justify-end">
          <label className="sr-only" htmlFor={`sort-${topic || userId || "feed"}`}>Sort posts</label>
          <div className="relative">
            <select
              id={`sort-${topic || userId || "feed"}`}
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="appearance-none rounded-full border bg-white py-2 pl-4 pr-10 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="top_day">Top today</option>
              <option value="top_week">Top this week</option>
              <option value="top_all">Top all time</option>
            </select>
            <ChevronDownIcon
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>
      )}
      {loading ? (
        <div className="space-y-4" aria-label="Loading posts">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-40 animate-pulse rounded-md bg-white" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-md bg-white p-6 text-center">
          <p className="text-red-500">{error}</p>
          <button className="mt-3 rounded-full bg-purple-600 px-4 py-2 text-white" onClick={() => fetchPosts()}>
            Try again
          </button>
        </div>
      ) : posts.length > 0 ? (
        <>
          {posts.map((post) => <Post key={post.id} post={post} />)}
          {hasMore && (
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => fetchPosts(page + 1, true)}
              className="w-full rounded-full border border-purple-500 bg-white py-2 font-medium text-purple-700 disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      ) : (
        <p className="text-center text-gray-400">No posts found.</p>
      )}
    </div>
  );
}

export default Feed;
