import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Avatar from "../../components/Avatar";
import Feed from "../../components/Feed";
import { useAuth } from "../../contexts/AuthContext";
import supabase from "../../lib/supabaseClient";

export default function UserProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const userId = typeof router.query.userId === "string" ? router.query.userId : "";

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, bio, created_at")
      .eq("id", userId)
      .single()
      .then(({ data, error: queryError }) => {
        if (queryError) setError("Profile not found.");
        else {
          setProfile(data);
          setBio(data.bio || "");
        }
      });
  }, [userId]);

  const saveBio = async () => {
    const nextBio = bio.trim().slice(0, 500);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ bio: nextBio, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (updateError) setError("Could not update profile.");
    else {
      setProfile((current) => ({ ...current, bio: nextBio }));
      setEditing(false);
      setError("");
    }
  };

  if (error && !profile) return <main className="mx-auto max-w-5xl p-6 text-center text-red-500">{error}</main>;
  if (!profile) return <main className="mx-auto max-w-5xl p-6"><div className="h-40 animate-pulse rounded-md bg-white" /></main>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-7">
      <Head>
        <title>{profile.display_name} | AskIt</title>
        <meta name="description" content={profile.bio || `Posts by ${profile.display_name} on AskIt.`} />
      </Head>
      <section className="rounded-md bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar seed={profile.display_name} large />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{profile.display_name}</h1>
            <p className="text-sm text-slate-500">Joined {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
          {user?.id === profile.id && !editing && (
            <button className="rounded-full border px-4 py-2 text-sm" onClick={() => setEditing(true)}>Edit profile</button>
          )}
        </div>
        {editing ? (
          <div className="mt-4 space-y-2">
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} className="w-full rounded-md border bg-transparent p-3" aria-label="Profile bio" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="px-4 py-2">Cancel</button>
              <button onClick={saveBio} className="rounded-full bg-purple-600 px-4 py-2 text-white">Save</button>
            </div>
          </div>
        ) : (
          <p className="mt-4 whitespace-pre-wrap text-slate-600">{profile.bio || "No bio yet."}</p>
        )}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </section>
      <h2 className="mt-8 text-xl font-semibold">Posts</h2>
      <Feed userId={profile.id} />
    </main>
  );
}
