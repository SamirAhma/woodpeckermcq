import { prisma } from "@/lib/prisma";
import SetUploadForm from "@/components/SetUploadForm";
import SetCard from "@/components/SetCard";
import LogoutButton from "@/components/LogoutButton";

export default async function Home() {
  const sets = await prisma.mCQSet.findMany({
    include: {
      _count: {
        select: { questions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-12 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">Woodpecker MCQ</h1>
          <p className="text-muted-foreground">Master any topic through repetition.</p>
        </div>
        <LogoutButton />
      </header>

      <section className="mb-12 bg-card p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Set</h2>
        <SetUploadForm />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Your MCQ Sets</h2>
        <div className="grid gap-4">
          {sets.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
              No sets found. Upload a JSON to get started.
            </p>
          ) : (
            sets.map((set) => (
              <SetCard key={set.id} set={set} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
