import { NextRequest, NextResponse } from "next/server";

// Fetch Google Trends (Japan) via RSS
async function getGoogleTrends(): Promise<string[]> {
  try {
    const res = await fetch("https://trends.google.co.jp/trending/rss?geo=JP", {
      next: { revalidate: 3600 }, // Cache 1 hour
    });
    const text = await res.text();
    const titles = text.match(/<title>(?!Daily Search Trends)(.*?)<\/title>/g) || [];
    return titles
      .map((t) => t.replace(/<\/?title>/g, ""))
      .slice(0, 20);
  } catch {
    return [];
  }
}

// SNS design best practices (AI knowledge base, updated periodically)
function getDesignTrends() {
  return {
    tiktok: {
      format: "縦型9:16、15-60秒が最適",
      hook: "冒頭0.5秒でテキストオーバーレイ+強いビジュアル",
      style: "UGC風（作り込みすぎない）、字幕必須、BGM重要",
      cta: "コメント誘導（質問形式）→ プロフへ誘導",
      timing: { jp: "12:00, 18:00-21:00", global: "17:00-21:00 local" },
      frequency: "1日1-3回",
      trends_2025: [
        "ナレーション+テキスト同時表示",
        "Before/After形式",
        "「知らなかった」系フック",
        "ASMR・開封動画",
        "3秒ルール（3秒で核心）",
      ],
    },
    instagram: {
      format: "リール: 9:16 15-30秒 / カルーセル: 1:1 最大10枚",
      hook: "1枚目で止まるビジュアル、テキストは大きく短く",
      style: "統一感のあるフィード、暖色系フィルター人気",
      cta: "「保存してね」が最強（保存率がアルゴリズムに影響）",
      timing: { jp: "7:00-8:00, 12:00, 20:00-22:00", global: "11:00, 14:00 local" },
      frequency: "1日1-2回（リール+フィード/ストーリー）",
      trends_2025: [
        "カルーセル教育コンテンツ",
        "テキスト多めのリール",
        "ミニVlog形式",
        "問題提起→解決の構成",
        "共感系キャプション",
      ],
    },
    x: {
      format: "テキスト+画像1-4枚、140字以内で完結",
      hook: "断定形・数字入り・逆張り",
      style: "短文+インパクト画像、スレッド形式で詳細",
      cta: "リプ・RT誘導、リンクは2ツイート目に",
      timing: { jp: "7:00-8:00, 12:00, 20:00-23:00", global: "9:00, 12:00 local" },
      frequency: "1日2-4回",
      trends_2025: [
        "実体験ベースの投稿",
        "比較画像（Before/After）",
        "「〇〇な人だけRT」形式",
        "数字で語るインパクト",
        "引用RT狙いの議論喚起",
      ],
    },
    threads: {
      format: "テキスト主体、画像1枚、500字以内",
      hook: "会話的なトーン、質問から入る",
      style: "カジュアル、Instagram連携で画像共有",
      cta: "コメント誘導、意見を聞く形式",
      timing: { jp: "8:00, 12:00, 21:00", global: "10:00, 19:00 local" },
      frequency: "1日1-2回",
      trends_2025: [
        "日常の気づき系",
        "短いストーリーテリング",
        "Instagram投稿の裏話",
        "コミュニティ対話型",
        "連投スレッド",
      ],
    },
    lp: {
      trends_2025: [
        "ファーストビューに動画 or GIF",
        "スクロールで情報が段階的に開示",
        "口コミ・UGCセクション強化",
        "「残り○個」リアルタイム在庫表示",
        "チャットボット型CTA",
        "ページ速度3秒以内",
        "スマホファースト（PCは後回し）",
        "色は最大3色、CTAボタンだけ目立つ色",
        "写真は生活感のあるシーン写真",
        "レビューに顔写真付き",
      ],
      colors: "暖色系CTA（赤/オレンジ）+ 白ベース + グレーアクセント",
      typography: "見出し24-28px太字、本文14-16px、行間1.6-1.8",
      conversion: [
        "CTAは画面下部固定",
        "価格は大きく赤字",
        "信頼バッジはファーストビュー内",
        "「〇人が購入」社会的証明",
        "返品保証を目立つ位置に",
      ],
    },
  };
}

export async function GET(req: NextRequest) {
  const googleTrends = await getGoogleTrends();
  const designTrends = getDesignTrends();

  return NextResponse.json({
    google_trends_jp: googleTrends,
    design: designTrends,
    updated_at: new Date().toISOString(),
  });
}
