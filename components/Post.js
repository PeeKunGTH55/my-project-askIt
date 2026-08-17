import React, { useEffect, useState } from "react";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleBottomCenterIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "@headlessui/react";
import Avatar from "./Avatar";
import TimeAgo from "react-timeago"; 
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast"; 
import supabase from "../lib/supabaseClient";
import EditPost from "./EditPost";

function Post({ post }) {
  const [vote, setVote] = useState(null); // เก็บการโหวตของผู้ใช้ปัจจุบัน
  const [votes, setVotes] = useState([]); // เก็บโหวตทั้งหมดของโพสต์นี้
  const [showEdit, setShowEdit] = useState(false); // ควบคุมการแสดง Edit Modal
  const { data: session } = useSession(); // ดึงข้อมูล session ของผู้ใช้

  // ดึงข้อมูลโหวตของโพสต์เมื่อโพสต์หรือ session เปลี่ยน
  useEffect(() => {
    fetchVotes();
  }, [post.id, session]);

  const fetchVotes = async () => {
    const { data } = await supabase
      .from("vote")
      .select("*")
      .eq("post_id", post.id); // ดึงโหวตทั้งหมดที่เกี่ยวกับโพสต์นี้
    setVotes(data || []);
    const userVote = data?.find((v) => v.username === session?.user?.name); // หาว่าผู้ใช้ปัจจุบันโหวตหรือยัง
    setVote(userVote?.upvote);
  };

  const handleVote = async (isUpvote) => {
    if (!session) return toast.error("You need to sign in to vote!"); // ถ้าไม่ได้ล็อกอิน แสดง error
    if ((vote === true && isUpvote) || (vote === false && !isUpvote)) return; // ถ้าโหวตซ้ำแบบเดิม ไม่ต้องทำอะไร

    // หาว่าผู้ใช้โหวตไว้แล้วหรือยัง
    const existingVote = votes.find((v) => v.username === session.user.name);

    // ถ้าเคยโหวต อัปเดต, ถ้ายังไม่เคยโหวต ให้เพิ่มโหวตใหม่
    const { error } = existingVote
      ? await supabase
          .from("vote")
          .update({ upvote: isUpvote })
          .eq("id", existingVote.id)
      : await supabase
          .from("vote")
          .insert([
            { post_id: post.id, username: session.user.name, upvote: isUpvote },
          ]);

    if (error) {
      toast.error("Error voting!");
    } else {
      toast.success(existingVote ? "Vote updated!" : "Vote placed!");
      fetchVotes(); // รีเฟรชคะแนนโหวตใหม่
    }
  };

  const handlePostUpdate = () => {
    fetchVotes();
    if (typeof window !== "undefined") window.location.reload(); // โหลดหน้าใหม่หลังอัปเดต
  };

  // คำนวณจำนวนโหวตสุทธิ (up - down)
  const displayVotes = () => {
    if (!votes || votes.length === 0) return 0;
    const total = votes.reduce((acc, v) => acc + (v.upvote ? 1 : -1), 0);
    return total;
  };

  return (
    <>
      {/* สำหรับแก้ไขโพสต์ */}
      {showEdit && (
        <EditPost
          post={post}
          onClose={() => setShowEdit(false)}
          onPostUpdated={handlePostUpdate}
        />
      )}

      {/* กล่องแสดงโพสต์ */}
      <div className="flex cursor-pointer rounded-md border border-gray-300 bg-white shadow-sm hover:border-gray-600 relative">
        {/* แถบโหวตด้านซ้าย */}
        <div className="flex flex-col items-center justify-start space-y-1 rounded-l-md bg-gray-50 p-4 text-gray-400">
          <HandThumbUpIcon
            onClick={() => handleVote(true)}
            className={`voteButtons hover:text-red-400 ${
              vote === true && "text-red-400"
            }`}
          />
          <p className="text-black text-xs font-bold">{displayVotes()}</p>
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
            <Avatar seed={post.username} />
            <p className="text-xs text-gray-400">
              <Link href={`/categories/${post.categories?.topic}`}>
                <span className="font-bold text-black hover:text-blue-400 hover:underline">
                  {post.categories?.topic}
                </span>
              </Link>{" "}
              • Posted by {post.username} <TimeAgo date={post.created_at} />
            </p>

            {/* ปุ่มสามจุดแสดงเมนู Edit/Delete */}
            {session?.user?.name === post.username && (
              <Menu as="div" className="ml-auto relative">
                <Menu.Button className="p-1 hover:bg-gray-100 rounded-full">
                  <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 z-10 mt-2 w-28 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setShowEdit(true)}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700"
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
                              .eq("id", post.id);

                            if (error) {
                              toast.error("Failed to delete post.");
                            } else {
                              toast.success("Post deleted!");
                              if (typeof window !== "undefined") {
                                window.location.reload(); // รีโหลดหน้า
                              }
                            }
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            active ? "bg-gray-100 text-red-600" : "text-red-500"
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
            <Link href={`/post/${post.id}`}>
              <h2 className="text-xl font-semibold hover:underline">
                {post.title}
              </h2>
            </Link>
            <p className="mt-2 text-sm font-light">{post.body}</p>
          </div>

          {/* แสดงรูปภาพ (ถ้ามี) */}
          {post.image && (
            <img
              className="w-full max-h-64 object-contain rounded"
              src={post.image}
              alt=""
            />
          )}

          {/* Footer แสดงจำนวนคอมเมนต์ */}
          <div className="flex space-x-4 text-gray-400 mt-2">
            <div className="postButtons">
              <ChatBubbleBottomCenterIcon className="h-6 w-6" />
              <Link href={`/post/${post.id}`}>
                <p> 
                  {Array.isArray(post.comments)
                    ? post.comments.length
                    : post.comments || 0}{" "}
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
