import { prisma } from "@/lib/prisma";
import SetList from "@/components/SetList";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

export default async function Home() {
  const sets = await prisma.mCQSet.findMany({
    include: {
      _count: {
        select: { questions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize for Client Component
  const serializedSets = sets.map(set => ({
    ...set,
    createdAt: set.createdAt.toISOString(),
    updatedAt: set.updatedAt.toISOString(),
    isFavorite: set.isFavorite // Ensure defaults are handled if null, but schema says default(false)
  }));

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Your Sets</h2>
          </div>
          <Suspense fallback={<div className="text-center py-12">Loading sets...</div>}>
            <SetList initialSets={serializedSets} />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
