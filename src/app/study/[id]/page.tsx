import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import QuizManager from "@/components/QuizManager";
import Navbar from "@/components/Navbar";

export default async function StudyPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ rounds?: string }>;
}) {
    const { id } = await params;

    const set = await prisma.mCQSet.findUnique({
        where: { id },
        include: {
            questions: true,
        },
    });

    if (!set) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Navbar />
            <main className="p-8 max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">{(set as any).title}</h1>
                    <p className="text-muted-foreground">
                        Woodpecker Session • {set.questions.length} Questions • {(set as any).targetRounds} Rounds
                    </p>
                </header>

                <QuizManager set={set as any} targetRounds={(set as any).targetRounds} />
            </main>
        </div>
    );
}
