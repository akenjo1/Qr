"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { makeLocalTemplates, Template } from "../lib/templates";

type ImgState = { url?: string };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

async function fileToDataURL(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function Editor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [templates, setTemplates] = useState<Template[]>(() => makeLocalTemplates(100));
  const [templateId, setTemplateId] = useState<string>("auto-1");

  const template = useMemo(
    () => templates.find(t => t.id === templateId) ?? templates[0],
    [templates, templateId]
  );

  const [text, setText] = useState("https://example.com");
  const [title, setTitle] = useState("SCAN HERE!");
  const [subtitle, setSubtitle] = useState("My Link");
  const [qrSize, setQrSize] = useState(560);

  const [avatar, setAvatar] = useState<ImgState>({});
  const [bgImage, setBgImage] = useState<ImgState>({});
  const [busy, setBusy] = useState(false);

  const W = 1200, H = 1200; // 1:1

  async function refreshTemplates() {
    try {
      const r = await fetch("/api/templates", { cache: "no-store" });
      const data = await r.json();
      if (Array.isArray(data.templates) && data.templates.length) {
        setTemplates(data.templates);
        setTemplateId((cur) =>
          data.templates.some((t: Template) => t.id === cur) ? cur : data.templates[0].id
        );
      }
    } catch {}
  }

  useEffect(() => {
    refreshTemplates();
    const id = setInterval(refreshTemplates, 60_000); // tự cập nhật mỗi 60s
    return () => clearInterval(id);
  }, []);

  async function render() {
    const canvas = canvasRef.current;
    if (!canvas || !template) return;

    setBusy(true);
    try {
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // BG
      ctx.fillStyle = template.bg;
      ctx.fillRect(0, 0, W, H);

      // BG Image (optional)
      if (bgImage.url) {
        const img = await loadImage(bgImage.url);
        const scale = Math.max(W / img.width, H / img.height);
        const dw = img.width * scale, dh = img.height * scale;
        const dx = (W - dw) / 2, dy = (H - dh) / 2;

        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = template.bg;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      const pad = 70;
      const titleBoxY = pad;
      const titleBoxH = 160;

      // Title bubble
      if (template.bubbleTitle) {
        roundedRect(ctx, pad, titleBoxY, W - pad * 2, titleBoxH, 42);
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.fill();
        ctx.lineWidth = 10;
        ctx.strokeStyle = template.frame;
        ctx.stroke();
      }

      // Title text
      ctx.fillStyle = template.text;
      ctx.font = "900 96px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(title, W / 2, titleBoxY + 70);

      // Subtitle
      ctx.font = "600 34px ui-sans-serif, system-ui";
      ctx.fillStyle = template.accent;
      ctx.fillText(subtitle, W / 2, titleBoxY + 125);

      // Panel
      const panelY = titleBoxY + titleBoxH + 80;
      const panelX = pad;
      const panelW = W - pad * 2;
      const panelH = H - panelY - pad;

      if (template.shadow) {
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.25)";
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 16;
        roundedRect(ctx, panelX, panelY, panelW, panelH, template.radius);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.restore();
      } else {
        roundedRect(ctx, panelX, panelY, panelW, panelH, template.radius);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
      }

      ctx.lineWidth = 14;
      ctx.strokeStyle = template.frame;
      roundedRect(ctx, panelX, panelY, panelW, panelH, template.radius);
      ctx.stroke();

      // QR
      const qrDataUrl = await QRCode.toDataURL(text, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: qrSize,
        color: { dark: "#000000", light: "#FFFFFF" }
      });

      const qrImg = await loadImage(qrDataUrl);
      const qrMax = Math.min(panelW, panelH) - 140;
      const qrDraw = clamp(qrSize, 360, qrMax);
      const qrX = panelX + (panelW - qrDraw) / 2;
      const qrY = panelY + (panelH - qrDraw) / 2;

      // backing
      roundedRect(ctx, qrX - 18, qrY - 18, qrDraw + 36, qrDraw + 36, 28);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      ctx.drawImage(qrImg, qrX, qrY, qrDraw, qrDraw);

      // Avatar center
      if (avatar.url) {
        const av = await loadImage(avatar.url);
        const r = Math.floor(qrDraw * 0.115);
        const cx = qrX + qrDraw / 2;
        const cy = qrY + qrDraw / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r + 12, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();

        const scale = Math.max((r * 2) / av.width, (r * 2) / av.height);
        const dw = av.width * scale, dh = av.height * scale;
        ctx.drawImage(av, cx - dw / 2, cy - dh / 2, dw, dh);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(cx, cy, r + 12, 0, Math.PI * 2);
        ctx.lineWidth = 8;
        ctx.strokeStyle = template.frame;
        ctx.stroke();
      }
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, text, title, subtitle, qrSize, avatar.url, bgImage.url, templates.length]);

  async function pickAvatar(file?: File) {
    if (!file) return setAvatar({});
    setAvatar({ url: await fileToDataURL(file) });
  }

  async function pickBg(file?: File) {
    if (!file) return setBgImage({});
    setBgImage({ url: await fileToDataURL(file) });
  }

  function downloadPNG() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${templateId}.png`;
    a.click();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
              onClick={refreshTemplates}
              type="button"
            >
              Cập nhật mẫu
            </button>
            <div className="text-xs text-zinc-400 self-center">
              ({templates.length} mẫu)
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-300">Template</label>
            <select
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-300">Nội dung QR</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-zinc-300">Tiêu đề</label>
              <input
                className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-zinc-300">Phụ đề</label>
              <input
                className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-300">Kích thước QR</label>
            <input
              type="range"
              min={360}
              max={720}
              value={qrSize}
              onChange={(e) => setQrSize(parseInt(e.target.value, 10))}
              className="mt-2 w-full"
            />
            <div className="text-xs text-zinc-400 mt-1">{qrSize}px</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-zinc-300">Avatar</label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full text-sm"
                onChange={(e) => pickAvatar(e.target.files?.[0])}
              />
            </div>
            <div>
              <label className="text-sm text-zinc-300">Ảnh nền</label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full text-sm"
                onChange={(e) => pickBg(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              className="flex-1 rounded-xl bg-white text-black px-4 py-3 font-semibold disabled:opacity-60"
              onClick={downloadPNG}
              disabled={busy}
              type="button"
            >
              Tải PNG
            </button>
            <button
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
              onClick={render}
              disabled={busy}
              type="button"
              title="Render lại"
            >
              ↻
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-zinc-300">Preview</div>
          <div className="text-xs text-zinc-400">{busy ? "Đang render..." : "Sẵn sàng"}</div>
        </div>
        <div className="overflow-auto rounded-2xl bg-zinc-950 p-3">
          <canvas ref={canvasRef} className="mx-auto block max-w-full h-auto rounded-xl" />
        </div>
      </section>
    </div>
  );
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
