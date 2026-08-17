import React, { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import Post from "./Post";

function Feed({ searchTerm, topic }) {
  const [posts, setPosts] = useState([]); // state สำหรับเก็บโพสต์ที่จะแสดง
  const [loading, setLoading] = useState(true); // state สำหรับสถานะโหลดข้อมูล

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true); // เริ่มโหลด

      // ดึงข้อมูลโพสต์ทั้งหมด พร้อม join comments และ categories
      const { data, error } = await supabase
        .from("post")
        .select(
          `
          *,
          comment(id),
          categories(*)
        `
        )
        .order("created_at", { ascending: false }); // เรียงโพสต์ใหม่สุดก่อน

      if (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
        return;
      }

      let filtered = data;

      // กรองตาม topic ก่อนถ้ามี (ใช้สำหรับหน้า /categories/[topic])
      if (topic) {
        filtered = data.filter(
          (post) =>
            post.categories?.topic?.toLowerCase() === topic.toLowerCase()
        );
      }
      //  ถ้าไม่มี topic ให้ใช้ searchTerm แทน
      else if (searchTerm) {
        filtered = data.filter((post) => {
          const titleMatch = post.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
          const categoryMatch = post.categories?.topic
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
          return titleMatch || categoryMatch;
        });
      }

      //  แปลงข้อมูลโพสต์: นับจำนวนคอมเมนต์
      const postsWithCounts = filtered.map((post) => ({
        ...post,
        comments: post.comment?.length || 0,
      }));

      setPosts(postsWithCounts); // เก็บโพสต์ลง state
      setLoading(false); // เสร็จสิ้นการโหลด
    };

    fetchPosts();
  }, [searchTerm, topic]); // เมื่อ searchTerm หรือ topic เปลี่ยนให้โหลดใหม่

  return (
    <div className="mt-5 space-y-4">
      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : posts.length > 0 ? (
        // แสดงโพสต์ถ้ามี
        posts.map((post) => <Post key={post.id} post={post} />)
      ) : (
        // แสดงข้อความถ้าไม่เจอโพสต์
        <p className="text-center text-gray-400">No posts found.</p>
      )}
    </div>
  );
}

export default Feed;
