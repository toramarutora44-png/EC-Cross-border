import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TwitterApi } from "twitter-api-v2";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function postToX(post: any) {
  const client = new TwitterApi({
    appKey: process.env.X_API_KEY!,
    appSecret: process.env.X_API_SECRET!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessSecret: process.env.X_ACCESS_SECRET!,
  });

  const text = `${post.caption}\n\n${post.hashtags}`.slice(0, 280);

  let mediaId: string | undefined;
  if (post.image_url) {
    try {
      const imgRes = await fetch(post.image_url);
      const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
      mediaId = await client.v1.uploadMedia(imgBuffer, { mimeType: "image/jpeg" });
    } catch {
      // 画像アップロード失敗してもテキストだけ投稿
    }
  }

  const tweet = await client.v2.tweet({
    text,
    ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
  });

  return `https://x.com/i/web/status/${tweet.data.id}`;
}

export async function GET(req: NextRequest) {
  // Vercel Cronの認証チェック
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();

  // 投稿すべき予約投稿を取得
  const { data: posts, error } = await supabase
    .from("scheduled_posts")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", now)
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!posts || posts.length === 0) {
    return NextResponse.json({ message: "投稿なし", count: 0 });
  }

  const results = [];

  for (const post of posts) {
    try {
      let postUrl = "";

      if (post.platform === "x") {
        postUrl = await postToX(post);
      } else {
        // Threads等は未実装のためスキップ
        await supabase
          .from("scheduled_posts")
          .update({ status: "skipped" })
          .eq("id", post.id);
        results.push({ id: post.id, platform: post.platform, status: "skipped" });
        continue;
      }

      await supabase
        .from("scheduled_posts")
        .update({ status: "posted", post_url: postUrl })
        .eq("id", post.id);

      results.push({ id: post.id, platform: post.platform, status: "posted", url: postUrl });
    } catch (err: any) {
      await supabase
        .from("scheduled_posts")
        .update({ status: "failed" })
        .eq("id", post.id);

      results.push({ id: post.id, platform: post.platform, status: "failed", error: err.message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
