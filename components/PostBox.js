import { PhotoIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import Avatar from "./Avatar";
import { useForm } from "react-hook-form";
import supabase from "../lib/supabaseClient";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

function PostBox({ categories, onCreated }) {
  const { user } = useAuth();
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
    let uploadedPath = "";

    try {
      let imageUrl = formData.PostImage?.trim() || "";
      const imageFile = formData.imageFile?.[0];

      if (imageFile) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(imageFile.type)) throw new Error("Unsupported image type");
        if (imageFile.size > 5 * 1024 * 1024) throw new Error("Image is larger than 5 MB");

        const extension = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(path, imageFile, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        uploadedPath = path;

        imageUrl = supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
      }

      // ตรวจสอบว่าหมวดหมู่มีอยู่หรือยัง
      const topic = (categories || formData.categories || "").trim().slice(0, 60);
      let { data: existingCategories, error: categoryLookupError } = await supabase
        .from("categories")
        .select("id")
        .ilike("topic", topic)
        .limit(1);

      if (categoryLookupError) throw categoryLookupError;

      let categories_id;

      // ถ้ายังไม่มี category นี้ใน DB ให้สร้างใหม่
      if (!existingCategories || existingCategories.length === 0) {
        const { data: newSub, error: subError } = await supabase
          .from("categories")
          .insert([{ topic }])
          .select()
          .single();

        if (subError) throw subError;
        categories_id = newSub.id;
      } else {
        categories_id = existingCategories[0].id;
      }

      // สร้างโพสต์ใหม่ในตาราง post
      const { error: postError } = await supabase.from("post").insert([
        {
          title: formData.postTitle.trim().slice(0, 200),
          body: formData.postBody?.trim().slice(0, 20000) || null,
          image: imageUrl,
          categories_id,
          user_id: user.id,
          username: user.user_metadata?.full_name || user.email,
        },
      ]);

      if (postError) throw postError;

      // ล้างค่า input หลังจากโพสต์สำเร็จ
      setValue("postBody", "");
      setValue("PostImage", "");
      setValue("imageFile", null);
      setValue("postTitle", "");
      setValue("categories", "");

      toast.success("New Post Created!", { id: notification }); // แจ้งว่าโพสต์สำเร็จ

      onCreated?.();
      window.dispatchEvent(new Event("askit:posts-changed"));
    } catch (error) {
      if (uploadedPath) await supabase.storage.from("post-images").remove([uploadedPath]);
      console.error("Create post failed:", error);
      toast.error("Whoops, something went wrong!", { id: notification }); // แจ้ง error
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)} // จัดการ submit ด้วย react-hook-form
      className="sticky top-20 z-50 rounded-md border border-slate-300 bg-white p-2 text-slate-900 shadow-sm"
    >
      {/* input บรรทัดแรก: ชื่อโพสต์ */}
      <div className="flex items-center space-x-3">
        <Avatar /> {/* แสดง avatar */}
        <input
          {...register("postTitle", { required: true })} // บังคับใส่ title
          type="text"
          disabled={!user}
          className="flex-1 rounded-md bg-slate-50 p-2 pl-5 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500"
          placeholder={
            user
              ? categories
                ? `Create a post in ${categories}`
                : "Create a post by entering a title!"
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
            <textarea
              className="m-2 min-h-24 flex-1 rounded-md bg-blue-50 p-2 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500"
              placeholder="Text (optional, Markdown supported)"
              {...register("postBody", { maxLength: 20000 })}
            />
          </div>

          {/*  input สำหรับ category (ถ้ายังไม่ได้ fix มาจาก props) */}
          {!categories && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">Category:</p>
              <input
                className="m-2 flex-1 rounded-md bg-blue-50 p-2 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500"
                type="text"
                placeholder="i.e Games"
                {...register("categories", { required: true, maxLength: 60 })}
              />
            </div>
          )}

          {/* Image upload with URL fallback */}
          {imageBoxOpen && (
            <div className="space-y-2 px-2 py-2">
              <label className="block text-sm font-medium" htmlFor="post-image-file">
                Upload image (JPEG, PNG or WebP, up to 5 MB)
              </label>
              <input
                id="post-image-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full rounded-md bg-blue-50 p-2 text-sm text-slate-700"
                {...register("imageFile")}
              />
              <input
                className="w-full rounded-md bg-blue-50 p-2 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500"
                type="url"
                placeholder="Or paste an HTTPS image URL"
                {...register("PostImage", {
                  pattern: /^https:\/\//i,
                })}
              />
            </div>
          )}

          {/* แสดง error message ถ้าไม่ได้กรอกข้อมูลจำเป็น */}
          {Object.keys(errors).length > 0 && (
            <div className="space-y-2 p-2 text-red-500">
              {errors.postTitle && <p>• A post title is required</p>}
              {errors.categories && <p>• A categories is required</p>}
              {errors.PostImage && <p>• Image URL must use HTTPS</p>}
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
