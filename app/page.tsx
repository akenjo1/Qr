import Editor from "@/components/Editor";

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">QR Template Studio</h1>
        <p className="text-zinc-300 mt-2">
          Tạo QR poster 1:1, 100 mẫu, có thể cập nhật mẫu từ JSON online.
        </p>
      </div>
      <Editor />
    </main>
  );
}
