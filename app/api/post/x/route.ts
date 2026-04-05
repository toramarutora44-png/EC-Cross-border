import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { scheduled_post_id } = await req.json();

    const { data: post, error } = await supabase
      .from("scheduled_posts")
      .select("*, products(name_ja, images)")
      .eq("id", scheduled_post_id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "post not found" }, { status: 404 });
    }

    const client = new TwitterApi({
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
      accessToken: process.env.X_ACCESS_TOKEN!,
      accessSecret: process.env.X_ACCESS_SECRET!,
    });

    const text = `${post.caption}\n\n${post.hashtags}`.slice(0, 280);

    let mediaId: string | undefined;

    // 画像があればアップロード
    if (post.image_url) {
      const imgRes = await fetch(post.image_url);
      const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
      const uploaded = await client.v1.uploadMedia(imgBuffer, { mimeType: "image/jpeg" });
      mediaId = uploaded;
    }

    const tweet = await client.v2.tweet({
      text,
      ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
    });

    // ステータス更新
    await supabase
      .from("scheduled_posts")
      .update({ status: "posted", post_url: `https://x.com/i/web/status/${tweet.data.id}` })
      .eq("id", scheduled_post_id);

    return NextResponse.json({ success: true, tweet_id: tweet.data.id });
  } catch (err: any) {
    await supabase
      .from("scheduled_posts")
      .update({ status: "failed" })
      .eq("id", req.headers.get("x-post-id") || "");

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
