import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";

export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: "プライバシーポリシー" },
          ]}
        />

        <h1 className="mb-8 text-2xl font-bold text-foreground font-heading">
          プライバシーポリシー
        </h1>

        <div className="space-y-6 text-sm text-foreground/80 leading-relaxed">
          <section>
            <h2 className="mb-2 text-lg font-bold text-foreground">アクセス解析ツールについて</h2>
            <p>
              当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用しています。
              このGoogleアナリティクスはデータの収集のためにCookieを使用しています。
              このデータは匿名で収集されており、個人を特定するものではありません。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-foreground">アフィリエイトについて</h2>
            <p>
              当サイトは、DLsite・FANZAのアフィリエイトプログラムに参加しています。
              当サイト経由で商品を購入された場合、当サイトに紹介料が支払われることがあります。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-foreground">免責事項</h2>
            <p>
              当サイトに掲載された情報は正確性を保証するものではありません。
              当サイトの情報を利用して発生した損害について、一切の責任を負いません。
              価格やセール情報は変動する可能性があります。最新の情報は各販売サイトでご確認ください。
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
