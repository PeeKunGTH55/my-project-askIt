import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import RelativeTime from "../components/RelativeTime";
import { useAuth } from "../contexts/AuthContext";
import supabase from "../lib/supabaseClient";

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("notifications")
      .select("id, kind, read_at, created_at, post_id, profiles!notifications_actor_id_fkey(display_name)")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (queryError) setError("Could not load notifications.");
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadNotifications();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  const markAllRead = async () => {
    const readAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("recipient_id", user.id)
      .is("read_at", null);
    if (!updateError) setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at || readAt })));
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-7">
      <Head><title>Notifications | AskIt</title><meta name="robots" content="noindex,nofollow" /></Head>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {user && <button onClick={markAllRead} className="rounded-full border px-4 py-2 text-sm">Mark all as read</button>}
      </div>
      {!user && !authLoading ? (
        <p className="rounded-md bg-white p-6 text-center">Sign in to view notifications.</p>
      ) : loading ? (
        <div className="h-32 animate-pulse rounded-md bg-white" />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : items.length === 0 ? (
        <p className="rounded-md bg-white p-6 text-center text-slate-500">No notifications yet.</p>
      ) : (
        <div className="overflow-hidden rounded-md border">
          {items.map((item) => (
            <Link key={item.id} href={`/post/${item.post_id}`} className={`block border-b p-4 last:border-0 ${item.read_at ? "bg-white" : "bg-purple-50"}`}>
              <span className="font-medium">{item.profiles?.display_name || "Someone"}</span> commented on your post
              <span className="ml-2 text-xs text-slate-500"><RelativeTime date={item.created_at} /></span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
