import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import Avatar from "../../components/Avatar"; 
import Feed from "../../components/Feed";
import PostBox from "../../components/PostBox";

function categories() {
  // ดึง topic จาก URL (เช่น /categories/technology จะได้ topic = 'technology')
  const {
    query: { topic },
  } = useRouter();

  return (
    <div className="h-24 bg-purple-300 p-8"> {/* พื้นหลังส่วน header สีม่วง */}
      <Head>
        <title>{topic ? `${topic} | AskIt` : "Category | AskIt"}</title>
        <meta name="description" content={`Explore posts in ${topic || "this category"} on AskIt.`} />
      </Head>

      {/* กล่องแสดงข้อมูล category (avatar + ชื่อ) */}
      <div className="-mx-8 mt-10 bg-white text-slate-900">
        <div className="mx-auto flex max-w-5xl items-center space-x-4 pb-3">
          <div className="-mt-5">
            <Avatar seed={topic} large /> {/* แสดง avatar ขนาดใหญ่ตามชื่อ topic */}
          </div>
          <div className="py-2">
            <h1 className="text-3xl font-semibold">{topic}</h1> {/* ชื่อ category */}
            <p className="text-sm text-gray-400">r/{topic}</p> {/* Sub-label */}
          </div>
        </div>
      </div>

      {/* ส่วนเนื้อหาโพสต์ของหมวดนี้ */}
      <div className="mx-auto mt-5 max-w-5xl pb-10">
        <PostBox categories={topic} /> {/* กล่องสร้างโพสต์ในหมวดนี้ */}
        <Feed topic={topic} /> {/* แสดงโพสต์เฉพาะในหมวดนี้ */}
      </div>
    </div>
  );
}

export default categories;
