const skins = [
  {
    id: "classic",
    name: "经典木鱼",
    description: "传统寺庙木鱼",
    color: "#8B4513",
    bgColor: "#FFF8DC",
    sound: "dong",
    icon: "🪵"
  },
  {
    id: "cyberpunk",
    name: "赛博朋克",
    description: "霓虹灯光木鱼",
    color: "#00FFFF",
    bgColor: "#0a0a2e",
    sound: "zap",
    icon: "⚡"
  },
  {
    id: "zen",
    name: "禅意水墨",
    description: "水墨风格木鱼",
    color: "#2F4F4F",
    bgColor: "#F5F5F0",
    sound: "bell",
    icon: "🎐"
  }
];

export async function GET() {
  return Response.json({ skins });
}
