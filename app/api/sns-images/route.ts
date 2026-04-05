import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PLATFORMS = [
  { key: "instagram", width: 1080, height: 1080, label: "Instagram" },
  { key: "tiktok",    width: 1080, height: 1920, label: "TikTok" },
  { key: "x",        width: 1200, height: 675,  label: "X" },
  { key: "threads",  width: 1080, height: 1080, label: "Threads" },
];

// グラデーション + 価格バッジをSVGで描画（フォント不要・シェイプのみ）
function buildOverlay(price: number | null, width: number, height: number): Buffer {
  const boxH = Math.round(height * 0.18);
  const badgeW = 180;
  const badgeH = 44;
  const badgeX = width - badgeW - 20;
  const badgeY = 20;

  // 価格テキスト（ASCII数字のみ・シンプルなフォント指定）
  const priceStr = price ? `JPY ${price.toLocaleString()}` : "";
  const fontSize = width > 1000 ? 48 : 34;

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.7"/>
    </linearGradient>
  </defs>
  <rect x="0" y="${height - boxH}" width="${width}" height="${boxH}" fill="url(#g)"/>
  ${priceStr ? `<text x="${Math.round(width * 0.04)}" y="${height - Math.round(boxH * 0.25)}"
    font-family="monospace" font-size="${fontSize}" font-weight="bold"
    fill="#FFB7C5" letter-spacing="2">${priceStr}</text>` : ""}
  <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="22" fill="#C9637A" opacity="0.9"/>
  <text x="${badgeX + badgeW / 2}" y="${badgeY + badgeH * 0.68}"
    text-anchor="middle" font-family="monospace" font-size="18" font-weight="bold" fill="white">HAOHAO SHOP</text>
</svg>`;

  return Buffer.from(svg);
}

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error || !product) return NextResponse.json({ error: "product not found" }, { status: 404 });

    const imageUrls: string[] = product.images || [];
    if (imageUrls.length === 0) return NextResponse.json({ error: "no images" }, { status: 400 });

    const price = product.sale_price || product.price || null;

    const imgRes = await fetch(imageUrls[0]);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    const results: Record<string, string> = {};

    for (const platform of PLATFORMS) {
      const { key, width, height } = platform;

      const resized = await sharp(imgBuffer)
        .resize(width, height, { fit: "cover", position: "center" })
        .toBuffer();

      let final: Buffer;
      try {
        const overlay = buildOverlay(price, width, height);
        final = await sharp(resized)
          .composite([{ input: overlay, top: 0, left: 0 }])
          .jpeg({ quality: 90 })
          .toBuffer();
      } catch {
        // オーバーレイ失敗時はリサイズのみ
        final = await sharp(resized).jpeg({ quality: 90 }).toBuffer();
      }

      const storagePath = `${productId}/sns_${key}.jpg`;
      await supabase.storage
        .from("products")
        .upload(storagePath, final, { contentType: "image/jpeg", upsert: true });

      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(storagePath);

      results[key] = urlData.publicUrl;
    }

    await supabase
      .from("products")
      .update({ sns_images: results })
      .eq("id", productId);

    return NextResponse.json({ success: true, sns_images: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
