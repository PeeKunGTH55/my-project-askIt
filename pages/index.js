import Head from "next/head";
import React, { useEffect, useState } from "react";
import Feed from "../components/Feed";
import PostBox from "../components/PostBox";
import CategoriesRow from "../components/CategoriesRow";

import supabase from "../lib/supabaseClient";

function Home() {
  const [topCategories, setTopCategories] = useState([]); // สร้าง state สำหรับเก็บหมวดหมู่ยอดนิยม

  useEffect(() => {
    const fetchTopCategories = async () => {
      const { data, error } = await supabase.rpc("top_categories", {
        result_limit: 5,
      });

      if (error) console.error("Error fetching categories:", error);
      else setTopCategories(data || []);
    };

    fetchTopCategories(); // เรียกฟังก์ชันตอนโหลดครั้งแรก
  }, []); // ทำงานแค่ครั้งแรกที่โหลดหน้า

  return (
    <>
      <Head>
        <title>AskIt — Ask, share, and discover</title>
        <meta name="description" content="Ask questions, share ideas, and discover conversations in the AskIt community." />
      </Head>

      <div className="mx-auto my-7 max-w-7xl px-4"> {/* คอนเทนเนอร์หลักของหน้า */}
        <PostBox /> {/* กล่องสำหรับสร้างโพสต์ใหม่ */}

        <div className="mt-5 flex flex-col lg:flex-row gap-6"> {/* แบ่ง layout เป็นสองฝั่ง */}
          <div className="flex-1"> {/* พื้นที่ฝั่งซ้ายสำหรับโพสต์ */}
            <Feed />
          </div>

          <div className="sticky top-36 hidden h-fit w-full max-w-sm rounded-md border border-slate-300 bg-white p-4 text-slate-900 shadow-sm lg:block"> {/* กล่องฝั่งขวาแสดง top categories */}
            <p className="text-md mb-3 font-bold">Top Categories</p>
            <div>
              {topCategories.map((Categories, i) => (
                <CategoriesRow
                  key={Categories.id} // ใช้ id เป็น key
                  topic={Categories.topic} // ส่ง topic ไปแสดงใน row
                  index={i} // ส่ง index เพื่อนำไปแสดงลำดับ
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
