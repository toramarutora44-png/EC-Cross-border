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

function buildOverlaySvg(name: string, price: number | null, width: number, height: number): Buffer {
  const priceText = price ? `¥${price.toLocaleString()}` : "";
  const fontSize = width > 1000 ? 44 : 32;
  const priceFontSize = width > 1000 ? 52 : 38;
  const padding = 40;
  const boxHeight = 160;

  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- 下部グラデーションオーバーレイ -->
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.75"/>
    </linearGradient>
    <style>
      @font-face { font-family: 'sans'; }
    </style>
  </defs>
  <rect x="0" y="${height - boxHeight}" width="${width}" height="${boxHeight}" fill="url(#grad)"/>

  <!-- 価格 -->
  ${priceText ? `<text x="${padding}" y="${height - 70}" font-size="${priceFontSize}" font-weight="bold" fill="#FFB7C5" font-family="Arial, sans-serif">${priceText}</text>` : ""}

  <!-- 商品名 -->
  <text x="${padding}" y="${height - 24}" font-size="${fontSize}" fill="white" font-family="Arial, sans-serif"
    textLength="${width - padding * 2}" lengthAdjust="spacingAndGlyphs">${name.slice(0, 20)}</text>

  <!-- 好好ロゴ（右上） -->
  <rect x="${width - 110}" y="20" width="90" height="36" rx="18" fill="rgba(201,99,122,0.85)"/>
  <text x="${width - 65}" y="44" text-anchor="middle" font-size="18" font-weight="bold" fill="white" font-family="Arial, sans-serif">好好</text>
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

    const name = product.name_ja || product.name || "";
    const price = product.sale_price || product.price || null;

    // 最初の画像を取得
    const imgRes = await fetch(imageUrls[0]);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    const results: Record<string, string> = {};

    for (const platform of PLATFORMS) {
      const { key, width, height } = platform;

      // リサイズ
      const resized = await sharp(imgBuffer)
        .resize(width, height, { fit: "cover", position: "center" })
        .toBuffer();

      // テキストオーバーレイ合成
      const overlay = buildOverlaySvg(name, price, width, height);
      const final = await sharp(resized)
        .composite([{ input: overlay, top: 0, left: 0 }])
        .jpeg({ quality: 90 })
        .toBuffer();

      // Supabase Storageにアップロード
      const storagePath = `${productId}/sns_${key}.jpg`;
      await supabase.storage
        .from("products")
        .upload(storagePath, final, { contentType: "image/jpeg", upsert: true });

      const { data: urlData } = supabase.storage
        .from("products")
        .getPublicUrl(storagePath);

      results[key] = urlData.publicUrl;
    }

    // DBに保存
    await supabase
      .from("products")
      .update({ sns_images: results })
      .eq("id", productId);

    return NextResponse.json({ success: true, sns_images: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
