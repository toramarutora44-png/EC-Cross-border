import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const OPTIMAL_HOURS: Record<string, number[]> = {
  instagram: [7, 12, 21],
  tiktok: [12, 19],
  x: [8, 12, 21],
  threads: [8, 12, 21],
};

function getNextOptimalTime(platform: string): Date {
  const hours = OPTIMAL_HOURS[platform] || [12];
  const now = new Date();
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const currentHour = jstNow.getUTCHours();

  const nextHour = hours.find((h) => h > currentHour + 1) ?? hours[0];
  const scheduled = new Date(jstNow);

  if (nextHour <= currentHour + 1) {
    scheduled.setUTCDate(scheduled.getUTCDate() + 1);
  }
  scheduled.setUTCHours(nextHour, 0, 0, 0);

  return new Date(scheduled.getTime() - 9 * 60 * 60 * 1000);
}

export async function POST(req: NextRequest) {
  try {
    const { product_id, platforms, captions, image_url, video_url } = await req.json();

    if (!product_id || !platforms?.length) {
      return NextResponse.json({ error: "product_id and platforms required" }, { status: 400 });
    }

    const rows = platforms.map((platform: string) => ({
      product_id,
      platform,
      caption: captions?.[platform]?.caption || "",
      hashtags: captions?.[platform]?.hashtags || "",
      image_url: image_url || null,
      video_url: video_url || null,
      scheduled_at: getNextOptimalTime(platform).toISOString(),
      status: "pending",
    }));

    const { data, error } = await supabase
      .from("scheduled_posts")
      .insert(rows)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, posts: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("scheduled_posts")
      .select("*, products(name_ja, images)")
      .order("scheduled_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ posts: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
