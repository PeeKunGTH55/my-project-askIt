import React, { useEffect, useMemo, useState } from "react";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleBottomCenterIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import Avatar from "./Avatar";
import RelativeTime from "./RelativeTime";
import Link from "next/link";
import toast from "react-hot-toast"; 
import supabase from "../lib/supabaseClient";
import EditPost from "./EditPost";
import { useAuth } from "../contexts/AuthContext";
import MarkdownText from "./MarkdownText";

function Post({ post }) {
  const { user } = useAuth();
  const [currentPost, setCurrentPost] = useState(post);
  const [votes, setVotes] = useState(post.vote || []);
  const [showEdit, setShowEdit] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    setCurrentPost(post);
    setVotes(post.vote || []);
  }, [post]);

  const vote = useMemo(
    () => votes.find((item) => item.user_id === user?.id)?.upvote ?? null,
    [votes, user?.id]
  );

  const handleVote = async (isUpvote) => {
    if (!user) return toast.error("You need to sign in to vote!");
    if ((vote === true && isUpvote) || (vote === false && !isUpvote)) return; // ถ้าโหวตซ้ำแบบเดิม ไม่ต้องทำอะไร

    // หาว่าผู้ใช้โหวตไว้แล้วหรือยัง
    const existingVote = votes.find((v) => v.user_id === user.id);
    const previousVotes = votes;
    setVotes((current) => [
      ...current.filter((item) => item.user_id !== user.id),
      { user_id: user.id, upvote: isUpvote },
    ]);

    // ถ้าเคยโหวต อัปเดต, ถ้ายังไม่เคยโหวต ให้เพิ่มโหวตใหม่
    const { error } = existingVote
      ? await supabase
          .from("vote")
          .update({ upvote: isUpvote })
          .eq("post_id", currentPost.id)
          .eq("user_id", user.id)
      : await supabase
          .from("vote")
          .insert([
            {
              post_id: currentPost.id,
              user_id: user.id,
              username: user.user_metadata?.full_name || user.email,
              upvote: isUpvote,
            },
          ]);

    if (error) {
      setVotes(previousVotes);
      toast.error("Error voting!");
    } else {
      toast.success(existingVote ? "Vote updated!" : "Vote placed!");
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setCurrentPost((current) => ({ ...current, ...updatedPost }));
    window.dispatchEvent(new Event("askit:posts-changed"));
  };

  // คำนวณจำนวนโหวตสุทธิ (up - down)
  const displayVotes = () => {
    if (!votes || votes.length === 0) return 0;
    const total = votes.reduce((acc, v) => acc + (v.upvote ? 1 : -1), 0);
    return total;
  };

  if (deleted) return null;

  return (
    <>
      {/* สำหรับแก้ไขโพสต์ */}
      {showEdit && (
        <EditPost
          post={currentPost}
          onClose={() => setShowEdit(false)}
          onPostUpdated={handlePostUpdate}
        />
      )}

      {/* กล่องแสดงโพสต์ */}
      <div className="relative flex cursor-pointer rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-500">
        {/* แถบโหวตด้านซ้าย */}
        <div className="flex flex-col items-center justify-start space-y-1 rounded-l-md bg-slate-50 p-4 text-slate-500">
          <HandThumbUpIcon
            onClick={() => handleVote(true)}
            className={`voteButtons hover:text-red-400 ${
              vote === true && "text-red-400"
            }`}
          />
          <p className="text-xs font-bold text-slate-900">{displayVotes()}</p>
          <HandThumbDownIcon
            onClick={() => handleVote(false)}
            className={`voteButtons hover:text-blue-400 ${
              vote === false && "text-blue-400"
            }`}
          />
        </div>

        {/* เนื้อหาโพสต์ */}
        <div className="p-3 pb-1 flex-1">
          {/* Header: Avatar, หมวดหมู่, ผู้โพสต์, เวลา */}
          <div className="flex items-center space-x-2">
            <Avatar seed={currentPost.profiles?.display_name || currentPost.username} />
            <p className="text-xs text-gray-400">
              <Link href={`/categories/${currentPost.categories?.topic}`}>
                <span className="font-bold text-slate-900 hover:text-blue-500 hover:underline">
                  {currentPost.categories?.topic}
                </span>
              </Link>{" "}
              • Posted by {currentPost.profiles?.display_name || currentPost.username}{" "}
              <RelativeTime date={currentPost.created_at} />
            </p>

            {/* ปุ่มสามจุดแสดงเมนู Edit/Delete */}
            {user?.id === currentPost.user_id && (
              <Menu as="div" className="ml-auto relative">
                <Menu.Button className="rounded-full p-1 hover:bg-slate-100">
                  <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 z-10 mt-2 w-28 origin-top-right rounded-md bg-white text-slate-800 shadow-lg ring-1 ring-black/10 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setShowEdit(true)}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            active
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          Edit
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={async () => {
                            const confirm = window.confirm(
                              "Are you sure you want to delete this post?"
                            );
                            if (!confirm) return;

                            const { error } = await supabase
                              .from("post")
                              .delete()
                              .eq("id", currentPost.id);

                            if (error) {
                              toast.error("Failed to delete post.");
                            } else {
                              toast.success("Post deleted!");
                              setDeleted(true);
                              window.dispatchEvent(new Event("askit:posts-changed"));
                            }
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            active ? "bg-slate-100 text-red-600" : "text-red-500"
                          }`}
                        >
                          Delete
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu>
            )}
          </div>

          {/* แสดงหัวข้อและเนื้อหาโพสต์ */}
          <div className="py-4">
            <Link href={`/post/${currentPost.id}`}>
              <h2 className="text-xl font-semibold hover:underline">
                {currentPost.title}
              </h2>
            </Link>
            <MarkdownText className="mt-2 text-sm font-light">{currentPost.body}</MarkdownText>
          </div>

          {/* แสดงรูปภาพ (ถ้ามี) */}
          {currentPost.image && (
            <img
              className="w-full max-h-64 object-contain rounded"
              src={currentPost.image}
              alt=""
            />
          )}

          {/* Footer แสดงจำนวนคอมเมนต์ */}
          <div className="flex space-x-4 text-gray-400 mt-2">
            <div className="postButtons">
              <ChatBubbleBottomCenterIcon className="h-6 w-6" />
              <Link href={`/post/${currentPost.id}`}>
                <p>
                  {Array.isArray(currentPost.comments)
                    ? currentPost.comments.length
                    : currentPost.comments || 0}{" "}
                  Comments
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Post;
