import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import Anthropic from "@anthropic-ai/sdk";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API });

const PLATFORMS = [
  { key: "instagram", width: 1080, height: 1080, label: "Instagram" },
  { key: "tiktok",    width: 1080, height: 1920, label: "TikTok" },
  { key: "x",        width: 1200, height: 675,  label: "X" },
  { key: "threads",  width: 1080, height: 1080, label: "Threads" },
];

// フォントをjsDelivrから取得（woff形式、satori対応）
let fontCache: ArrayBuffer | null = null;
async function getFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const res = await fetch(
    "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-400-normal.woff"
  );
  fontCache = await res.arrayBuffer();
  return fontCache;
}

// Claude Visionで中国語テキストを検出・日本語翻訳
async function detectAndTranslateChinese(imageUrl: string): Promise<string | null> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "url", url: imageUrl },
          },
          {
            type: "text",
            text: `この画像に中国語のテキストが含まれていますか？
含まれている場合、その内容を自然な日本語に翻訳して20文字以内で返してください。
含まれていない場合は「なし」とだけ返してください。
翻訳のみ返し、説明不要。`,
          },
        ],
      }],
    });
    const result = message.content[0].type === "text" ? message.content[0].text.trim() : "なし";
    if (result === "なし" || result === "" || result.includes("なし")) return null;
    return result.slice(0, 30);
  } catch {
    return null;
  }
}

// satori + resvg で日本語テキストオーバーレイPNGを生成
async function buildJapaneseOverlay(text: string, width: number, height: number): Promise<Buffer> {
  const font = await getFont();
  const fontSize = width > 1000 ? 42 : 30;
  const boxHeight = Math.round(height * 0.15);

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          alignItems: "flex-end",
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: "transparent",
        },
        children: {
          type: "div",
          props: {
            style: {
              display: "flex",
              width: `${width}px`,
              height: `${boxHeight}px`,
              background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.75))",
              alignItems: "center",
              paddingLeft: "32px",
              paddingRight: "32px",
            },
            children: {
              type: "span",
              props: {
                style: {
                  fontFamily: "NotoSansJP",
                  fontSize: `${fontSize}px`,
                  fontWeight: 400,
                  color: "#FFFFFF",
                  textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                },
                children: text,
              },
            },
          },
        },
      },
    },
    {
      width,
      height,
      fonts: [{ name: "NotoSansJP", data: font, weight: 400, style: "normal" }],
    }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  return Buffer.from(resvg.render().asPng());
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

    // 中国語テキスト検出・翻訳
    const japaneseText = await detectAndTranslateChinese(imageUrls[0]);

    const imgRes = await fetch(imageUrls[0]);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    const results: Record<string, string> = {};

    for (const platform of PLATFORMS) {
      const { key, width, height } = platform;

      const resized = await sharp(imgBuffer)
        .resize(width, height, { fit: "cover", position: "center" })
        .toBuffer();

      let final: Buffer;
      if (japaneseText) {
        try {
          const overlay = await buildJapaneseOverlay(japaneseText, width, height);
          final = await sharp(resized)
            .composite([{ input: overlay, top: 0, left: 0 }])
            .jpeg({ quality: 90 })
            .toBuffer();
        } catch {
          final = await sharp(resized).jpeg({ quality: 90 }).toBuffer();
        }
      } else {
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

    return NextResponse.json({ success: true, sns_images: results, translated_text: japaneseText });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
