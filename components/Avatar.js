import React from "react";
import { useAuth } from "../contexts/AuthContext";

function Avatar({ seed, large }) {
  const { user } = useAuth();

  //  สร้างชื่อ seed สำหรับใช้สร้างรูป avatar จาก DiceBear
  // ถ้ามี prop seed ให้ใช้เลย, ถ้าไม่มีใช้ชื่อผู้ใช้จาก session, ถ้าไม่มีอีกใช้ "placeholder"
  const nameSeed = encodeURIComponent(
    seed || user?.user_metadata?.full_name || user?.email || "placeholder"
  );

  return (
    //  กล่องรูป Avatar: ปรับขนาดตาม prop `large`, มี border และเป็นวงกลม
    <div className={`relative overflow-hidden rounded-full border border-slate-300 bg-white ${ large ? "h-20 w-20" : "h-10 w-10"}`}>
      <img
        alt="User Avatar"
        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${nameSeed}`}
        className="object-cover w-full h-full" //  ให้รูปเต็มพื้นที่กล่อง
      />
    </div>
  );
}

export default Avatar;
