export type Template = {
  id: string;
  name: string;
  bg: string;          // canvas background color
  panel: string;       // QR panel color
  frame: string;       // frame stroke color
  accent: string;      // accent color (text / stickers)
  text: string;        // title text color
  shadow: boolean;
  bubbleTitle: boolean;
  radius: number;
};

export const TEMPLATES: Template[] = [
  {
    id: "cute-grey",
    name: "Cute Grey (giống vibe ảnh mẫu)",
    bg: "#ECECEC",
    panel: "#FFFFFF",
    frame: "#9A9A9A",
    accent: "#7B7B7B",
    text: "#5A5A5A",
    shadow: true,
    bubbleTitle: true,
    radius: 26,
  },
  {
    id: "soft-pink",
    name: "Soft Pink",
    bg: "#FFE7F2",
    panel: "#FFFFFF",
    frame: "#FF7DB8",
    accent: "#FF3D9A",
    text: "#8A1B57",
    shadow: true,
    bubbleTitle: true,
    radius: 28,
  },
  {
    id: "mint-cute",
    name: "Mint Cute",
    bg: "#E6FFF6",
    panel: "#FFFFFF",
    frame: "#22C55E",
    accent: "#16A34A",
    text: "#0F5132",
    shadow: true,
    bubbleTitle: true,
    radius: 26,
  },
  {
    id: "neon-night",
    name: "Neon Night",
    bg: "#0B1020",
    panel: "#0F172A",
    frame: "#22D3EE",
    accent: "#A78BFA",
    text: "#E2E8F0",
    shadow: true,
    bubbleTitle: false,
    radius: 22,
  },
  {
    id: "minimal",
    name: "Minimal White",
    bg: "#F7F7F7",
    panel: "#FFFFFF",
    frame: "#111827",
    accent: "#111827",
    text: "#111827",
    shadow: false,
    bubbleTitle: false,
    radius: 18,
  },
  {
    id: "mono-dark",
    name: "Mono Dark",
    bg: "#0A0A0A",
    panel: "#111111",
    frame: "#E5E7EB",
    accent: "#E5E7EB",
    text: "#F3F4F6",
    shadow: false,
    bubbleTitle: false,
    radius: 18,
  },
];
