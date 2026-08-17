import { Dialog } from "@headlessui/react";
import { useState } from "react";
import supabase from "../lib/supabaseClient";
import toast from "react-hot-toast";

// ✅ Component สำหรับแก้ไขโพสต์
export default function EditPost({ post, onClose, onPostUpdated }) {
  // ✅ state สำหรับเก็บข้อมูลที่จะแก้ไข
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [image, setImage] = useState(post.image);

  // ✅ ฟังก์ชันบันทึกข้อมูลเมื่อกด Save
  const handleSave = async () => {
    const nextPost = {
      title: title.trim().slice(0, 200),
      body: body?.trim().slice(0, 20000) || null,
      image: image?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("post")
      .update(nextPost)
      .eq("id", post.id); // เฉพาะโพสต์ที่มี id นี้

    if (error) {
      toast.error("Failed to update post"); // ❌ ถ้ามี error
    } else {
      toast.success("Post updated!"); // ✅ แจ้งเตือนว่าอัปเดตสำเร็จ
      onPostUpdated(nextPost);
      onClose(); // ✅ ปิด modal
    }
  };

  return (
    <Dialog
      open={true} // ✅ เปิด Dialog ตลอด (เพราะใช้กับ showEdit)
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="w-full max-w-md rounded-md bg-white p-6 text-slate-900 shadow-lg ring-1 ring-black/10">
          {/* ✅ Title */}
          <Dialog.Title className="text-lg font-bold mb-4">
            Edit Post
          </Dialog.Title>

          {/* ✅ Input สำหรับแก้ไข title */}
          <input
            className="mb-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />

          {/* ✅ Textarea สำหรับแก้ไข body */}
          <textarea
            className="mb-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Body"
          />

          {/* ✅ Input สำหรับแก้ไข image URL */}
          <input
            className="mb-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={image || ""}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Image URL"
          />

          {/* ✅ แสดงตัวอย่างรูปภาพถ้ามี URL */}
          {image && (
            <img
              src={image}
              alt="Preview"
              className="w-full max-h-48 object-contain mb-4 rounded"
            />
          )}

          {/* ✅ ปุ่ม Cancel / Save */}
          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="text-slate-500">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-1 rounded"
            >
              Save
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
