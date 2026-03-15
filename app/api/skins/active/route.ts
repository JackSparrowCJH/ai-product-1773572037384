let activeSkin = "classic";

export async function GET() {
  return Response.json({ activeSkin });
}

export async function POST(request: Request) {
  const body = await request.json();
  const valid = ["classic", "cyberpunk", "zen"];
  if (!valid.includes(body.skinId)) {
    return Response.json({ error: "Invalid skin" }, { status: 400 });
  }
  activeSkin = body.skinId;
  return Response.json({ activeSkin });
}
