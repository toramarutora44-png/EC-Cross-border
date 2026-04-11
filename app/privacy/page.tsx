export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-8">プライバシーポリシー</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. 収集する情報</h2>
          <p>当サービスは、サービス提供のために必要な範囲で個人情報を収集します。</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. 情報の利用目的</h2>
          <p>収集した情報は、サービスの提供・改善のみに使用し、第三者への提供は行いません。</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. SNS連携について</h2>
          <p>当サービスはThreads・Instagram等のSNSと連携します。連携時に取得するデータはコンテンツの投稿管理のみに使用します。</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. お問い合わせ</h2>
          <p>プライバシーに関するお問い合わせは、サイト内のお問い合わせフォームよりご連絡ください。</p>
        </section>
      </div>
    </div>
  );
}
