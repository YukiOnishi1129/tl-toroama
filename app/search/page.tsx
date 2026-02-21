import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SearchContent } from "@/components/search-content";

export const dynamic = "force-static";

export default async function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-4">
        <SearchContent />
      </main>

      <Footer />
    </div>
  );
}
