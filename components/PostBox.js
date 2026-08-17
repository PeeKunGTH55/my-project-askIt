import { PhotoIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react"; 
import React, { useState } from "react";
import Avatar from "./Avatar";
import { useForm } from "react-hook-form";
import supabase from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

function PostBox({ categories }) {
  const { data: session } = useSession(); // ข้อมูลผู้ใช้ปัจจุบัน
  const router = useRouter(); // ใช้สำหรับ reload หน้า
  const [imageBoxOpen, setImageBoxOpen] = useState(false); // ควบคุมการเปิด/ปิดช่องใส่รูปภาพ

  // ดึงฟังก์ชันจาก react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  // ฟังก์ชันเมื่อผู้ใช้ submit ฟอร์ม
  const onSubmit = async (formData) => {
    const notification = toast.loading("Creating new post..."); // แจ้งเตือนกำลังโพสต์

    try {
      // ตรวจสอบว่าหมวดหมู่มีอยู่หรือยัง
      let { data: existingcategoriess } = await supabase
        .from("categories")
        .select("*")
        .eq("topic", categories || formData.categories);

      let categories_id;

      // ถ้ายังไม่มี category นี้ใน DB ให้สร้างใหม่
      if (!existingcategoriess || existingcategoriess.length === 0) {
        const { data: newSub, error: subError } = await supabase
          .from("categories")
          .insert([{ topic: formData.categories }])
          .select()
          .single();

        if (subError) throw subError;
        categories_id = newSub.id;
      } else {
        categories_id = existingcategoriess[0].id; // ใช้ id ของหมวดหมู่เดิม
      }

      // สร้างโพสต์ใหม่ในตาราง post
      const { error: postError } = await supabase.from("post").insert([
        {
          title: formData.postTitle,
          body: formData.postBody,
          image: formData.PostImage || "",
          categories_id,
          username: session?.user?.name,
        },
      ]);

      if (postError) throw postError;

      // ล้างค่า input หลังจากโพสต์สำเร็จ
      setValue("postBody", "");
      setValue("PostImage", "");
      setValue("postTitle", "");
      setValue("categories", "");

      toast.success("New Post Created!", { id: notification }); // แจ้งว่าโพสต์สำเร็จ

      // reload หน้าเพื่อแสดงโพสต์ใหม่
      setTimeout(() => {
        router.reload();
      }, 1000);
    } catch (error) {
      toast.error("Whoops, something went wrong!", { id: notification }); // แจ้ง error
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)} // จัดการ submit ด้วย react-hook-form
      className="sticky top-20 z-50 border rounded-md border-gray-300 bg-white p-2"
    >
      {/* input บรรทัดแรก: ชื่อโพสต์ */}
      <div className="flex items-center space-x-3">
        <Avatar /> {/* แสดง avatar */}
        <input
          {...register("postTitle", { required: true })} // บังคับใส่ title
          type="text"
          disabled={!session}
          className="flex-1 rounded-md bg-gray-50 p-2 pl-5 outline-none"
          placeholder={
            session
              ? categories
                ? `Create a post in ${categories}`
                : "Create a  post by entering a title!"
              : "Sign in to post"
          }
        />
        {/* ปุ่มเปิดช่องใส่รูป */}
        <PhotoIcon
          onClick={() => setImageBoxOpen(!imageBoxOpen)}
          className={`h-6 cursor-pointer text-gray-300 ${
            imageBoxOpen && "text-blue-300"
          }`}
        />
      </div>

      {/* แสดง field เพิ่มเติมเมื่อกรอก title แล้ว */}
      {!!watch("postTitle") && (
        <div className="flex flex-col py-2">
          {/* input สำหรับเนื้อหาโพสต์ */}
          <div className="flex items-center px-2">
            <p className="min-w-[90px]">Body:</p>
            <input
              className="m-2 flex-1 bg-blue-50 p-2 outline-none"
              type="text"
              placeholder="Text (optional)"
              {...register("postBody")}
            />
          </div>

          {/*  input สำหรับ category (ถ้ายังไม่ได้ fix มาจาก props) */}
          {!categories && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">Category:</p>
              <input
                className="m-2 flex-1 bg-blue-50 p-2 outline-none"
                type="text"
                placeholder="i.e Games"
                {...register("categories", { required: true })}
              />
            </div>
          )}

          {/* input สำหรับใส่ลิงก์รูปภาพ (เมื่อเปิด imageBoxOpen) */}
          {imageBoxOpen && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">Image URL:</p>
              <input
                className="m-2 flex-1 bg-blue-50 p-2 outline-none"
                type="text"
                placeholder="Optional..."
                {...register("PostImage")}
              />
            </div>
          )}

          {/* แสดง error message ถ้าไม่ได้กรอกข้อมูลจำเป็น */}
          {Object.keys(errors).length > 0 && (
            <div className="space-y-2 p-2 text-red-500">
              {errors.postTitle && <p>• A post title is required</p>}
              {errors.categories && <p>• A categories is required</p>}
            </div>
          )}

          {/* ปุ่มโพสต์ */}
          <button
            type="submit"
            className="w-full rounded-full bg-blue-400 p-2 text-white"
          >
            Create Post
          </button>
        </div>
      )}
    </form>
  );
}

export default PostBox;
