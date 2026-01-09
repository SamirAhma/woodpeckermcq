import { prisma } from "@/lib/prisma";
import SetList from "@/components/SetList";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";
import { WOODPECKER_CONFIG } from "@/lib/config";

export default async function Home() {
  const sets = await prisma.mCQSet.findMany({
    include: {
      _count: {
        select: { questions: true },
      },
      sessions: {
        orderBy: { id: "desc" },
        take: 1,
        include: {
          rounds: {
            orderBy: { id: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  }) as any; // Type assertion for Prisma include

  // Serialize for Client Component and calculate rest period
  const serializedSets = sets.map(set => {
    const latestSession = set.sessions[0];
    let restInfo = null;

    if (latestSession && latestSession.rounds.length > 0) {
      const lastRound = latestSession.rounds[0];
      if (lastRound.endTime) {
        const lastRoundEndTime = new Date(lastRound.endTime).getTime();
        const now = Date.now();
        const restPeriod = WOODPECKER_CONFIG.REST_PERIOD_MS;
        const timePassed = now - lastRoundEndTime;

        if (timePassed < restPeriod) {
          const timeRemaining = Math.ceil((restPeriod - timePassed) / 1000);
          restInfo = {
            isResting: true,
            timeRemaining,
          };
        }
      }
    }

    return {
      id: set.id,
      title: set.title,
      targetRounds: set.targetRounds,
      createdAt: set.createdAt.toISOString(),
      updatedAt: set.updatedAt.toISOString(),
      isFavorite: set.isFavorite,
      _count: set._count,
      restInfo,
    };
  });

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
