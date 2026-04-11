import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin?threads_error=${error}`, req.url)
    );
  }

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    // codeをアクセストークンに交換
    const tokenRes = await fetch(
      "https://graph.threads.net/oauth/access_token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.THREADS_APP_ID!,
          client_secret: process.env.THREADS_APP_SECRET!,
          grant_type: "authorization_code",
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/threads/callback`,
          code,
        }),
      }
    );

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return NextResponse.redirect(
        new URL(`/admin?threads_error=${tokenData.error.message}`, req.url)
      );
    }

    // 長期トークンに交換
    const longTokenRes = await fetch(
      `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${process.env.THREADS_APP_SECRET}&access_token=${tokenData.access_token}`
    );
    const longTokenData = await longTokenRes.json();

    // 管理画面にトークンを表示
    return NextResponse.redirect(
      new URL(
        `/admin?threads_token=${longTokenData.access_token}&threads_user_id=${tokenData.user_id}`,
        req.url
      )
    );
  } catch (err) {
    console.error("Threads callback error:", err);
    return NextResponse.json({ error: "Token exchange failed" }, { status: 500 });
  }
}
