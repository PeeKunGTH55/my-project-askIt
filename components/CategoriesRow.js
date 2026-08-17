import React from "react";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

//  Component แสดงหมวดหมู่แต่ละอันใน Top Categories
function CategoriesRow({ index, topic }) {
  return (
    <div className="flex items-center space-x-2 border-t border-slate-200 bg-white px-4 py-2 text-slate-800 last-b">
      {/*  แสดงลำดับอันดับ เช่น 1, 2, 3... */}
      <p>{index + 1}</p>

      {/*  ไอคอนลูกศรชี้ขึ้น (เหมือนกับการ vote up) */}
      <ChevronUpIcon className="h-4 w-4 shrink-0 flex text-green-400" />

      {/*  ชื่อหมวดหมู่ ถ้ายาวจะตัดด้วย truncate */}
      <p className="flex-1 truncate">{topic}</p>

      {/*  ปุ่ม "View" สำหรับลิงก์ไปยังหน้าหมวดหมู่นั้น */}
      <Link href={`/categories/${topic}`}>
        <div className="cursor-pointer rounded-full bg-purple-500 px-3 text-white">
          View
        </div>
      </Link>
    </div>
  );
}

export default CategoriesRow;
