import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, imageUrl, userId, accessToken } = await req.json();

  if (!text || !userId || !accessToken) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // ステップ1: 投稿コンテナを作成
    const containerBody: Record<string, string> = {
      media_type: imageUrl ? "IMAGE" : "TEXT",
      text,
      access_token: accessToken,
    };
    if (imageUrl) containerBody.image_url = imageUrl;

    const containerRes = await fetch(
      `https://graph.threads.net/v1.0/${userId}/threads`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(containerBody),
      }
    );
    const container = await containerRes.json();

    if (container.error) {
      return NextResponse.json({ error: container.error }, { status: 400 });
    }

    // ステップ2: 投稿を公開
    const publishRes = await fetch(
      `https://graph.threads.net/v1.0/${userId}/threads_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: accessToken,
        }),
      }
    );
    const publishData = await publishRes.json();

    if (publishData.error) {
      return NextResponse.json({ error: publishData.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: publishData.id });
  } catch (err) {
    console.error("Threads publish error:", err);
    return NextResponse.json({ error: "Publish failed" }, { status: 500 });
  }
}
