import "./globals.css";

export const metadata = {
  title: "QR Template Studio",
  description: "Generate QR with templates"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-zinc-950 text-zinc-50">
        {children}
      </body>
    </html>
  );
}
