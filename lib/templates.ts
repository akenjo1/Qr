export type Template = {
  id: string;
  name: string;
  bg: string;
  panel: string;
  frame: string;
  accent: string;
  text: string;
  shadow: boolean;
  bubbleTitle: boolean;
  radius: number;
};

function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export function makeLocalTemplates(count = 100): Template[] {
  const arr: Template[] = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.round((360 / count) * i);
    arr.push({
      id: `auto-${i + 1}`,
      name: `Auto #${i + 1}`,
      bg: hslToHex(hue, 55, 92),
      panel: "#FFFFFF",
      frame: hslToHex(hue, 22, 45),
      accent: hslToHex(hue, 80, 55),
      text: hslToHex(hue, 28, 22),
      shadow: true,
      bubbleTitle: true,
      radius: 26
    });
  }
  return arr;
}
