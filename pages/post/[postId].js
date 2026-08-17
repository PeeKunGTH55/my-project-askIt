import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Post from "../../components/Post";
import Avatar from "../../components/Avatar";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import RelativeTime from "../../components/RelativeTime";
import { Jelly } from "@uiball/loaders";
import Head from "next/head";
import supabase from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";

function PostPage() {
  const router = useRouter(); // ใช้เข้าถึง URL params
  const { user } = useAuth();
  const [post, setPost] = useState(null); // state เก็บข้อมูลโพสต์
  const [loading, setLoading] = useState(true); // state สำหรับสถานะโหลด
  const [loadError, setLoadError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm(); // ตั้งค่า react-hook-form

  const fetchPost = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("post")
      .select("*, comment(*, profiles!comment_user_id_fkey(display_name, avatar_url)), categories(*), profiles!post_user_id_fkey(id, display_name, avatar_url), vote(user_id, upvote)")
      .eq("id", router.query.postId) // filter จาก postId ที่ได้จาก URL
      .single(); // เอาแค่ตัวเดียว

    if (error) {
      console.error("Error fetching post:", error);
      setLoadError("This post could not be found.");
    } else {
      setPost({
        ...data,
        categories: Array.isArray(data.categories)
          ? data.categories[0]
          : data.categories, // แปลงให้เป็น object ถ้าเป็น array
        comments: data.comment, // เก็บ comment ไว้ใน post.comments
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    if (router.isReady) {
      fetchPost(); // โหลดโพสต์เมื่อ router พร้อมและมี postId
    }
  }, [router.isReady, router.query.postId]);

  const onSubmit = async (formData) => {
    const notification = toast.loading("Posting your comment..."); // แสดง loading ขณะส่ง comment

    const { error } = await supabase.from("comment").insert([
      {
        post_id: router.query.postId, // เชื่อมกับโพสต์นี้
        user_id: user?.id,
        username: user?.user_metadata?.full_name || user?.email,
        text: formData.comment,
      },
    ]);

    if (error) {
      toast.error("Failed to post comment", { id: notification });
    } else {
      setValue("comment", ""); // ล้าง input
      toast.success("Comment posted!", { id: notification });
      fetchPost(); // โหลดโพสต์ใหม่เพื่ออัปเดต comment
    }
  };

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center p-10 text-xl">
        <Jelly size={50} color="#9C5BCC" /> {/* แสดง spinner ระหว่างโหลด */}
      </div>
    );
  }

  if (loadError || !post) {
    return <main className="mx-auto max-w-5xl p-10 text-center text-red-500">{loadError || "Post not found."}</main>;
  }

  return (
    <div className="mx-auto my-7 max-w-5xl">
      <Head>
          <title>{post.title} | AskIt</title>
          <meta name="description" content={(post.body || post.title).slice(0, 160)} />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={(post.body || post.title).slice(0, 160)} />
      </Head>

      <Post post={post} /> {/* แสดงโพสต์ */}

      {/* กล่องสำหรับพิมพ์ comment */}
      <div className="-mt-1 rounded-b-md border border-t-0 border-slate-300 bg-white p-5 pl-16 text-slate-900">
        <p className="text-sm">
          Comment as <span className="text-red-500">{user?.user_metadata?.full_name || user?.email || "guest"}</span>
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-2"
        >
          <textarea
            {...register("comment", { required: true })}
            disabled={!user}
            className="h-24 rounded-md border border-slate-300 bg-white p-2 pl-4 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100"
            placeholder={
              user ? "What are your thoughts?" : "Please sign in to comment"
            }
          />

          {errors.comment && (
            <p className="text-red-500 text-sm">• Comment is required</p>
          )}

          <button
            disabled={!user}
            type="submit"
            className="rounded-full bg-red-500 p-3 font-semibold text-white disabled:bg-gray-200"
          >
            Comment
          </button>
        </form>
      </div>

      {/* แสดงรายการ comment */}
      <div className="-my-5 rounded-b-md border border-t-0 border-slate-300 bg-white px-10 py-5 text-slate-900">
        <hr className="py-2" />

        {Array.isArray(post?.comments) && post.comments.length === 0 && (
          <p className="text-gray-400 text-sm">
            No comments yet. Be the first!
          </p>
        )}

        {Array.isArray(post?.comments) &&
          post.comments.map((comment) => (
            <div
              className="relative flex items-center space-x-2 space-y-5"
              key={comment.id}
            >
              <hr className="absolute top-10 left-7 z-0 h-16 border" />
              <div className="z-50">
                <Avatar seed={comment.profiles?.display_name || comment.username} />
              </div>
              <div className="flex flex-col">
                <p className="py-2 text-xs text-gray-400">
                  <span className="font-semibold text-slate-600">
                    {comment.profiles?.display_name || comment.username}
                  </span>{" "}
                  • <RelativeTime date={comment.created_at} />
                </p>
                <p>{comment.text}</p> {/* แสดงข้อความคอมเมนต์ */}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default PostPage;
