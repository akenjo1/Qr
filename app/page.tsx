import Editor from "@/components/Editor";

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">QR Template Studio</h1>
        <p className="text-zinc-300 mt-2">
          Tạo QR theo nhiều mẫu (cute / minimal / neon…). Upload ảnh nền + avatar, xuất PNG.
        </p>
      </div>
      <Editor />
      <footer className="mt-10 text-xs text-zinc-400">
        Tip: Ảnh “nhân vật” như ví dụ bạn gửi → bạn có thể tự upload ảnh nền bạn có quyền sử dụng.
      </footer>
    </main>
  );
}
