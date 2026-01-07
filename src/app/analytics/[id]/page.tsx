import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AnalyticsResponseSchema, AnalyticsResponse } from "@/lib/schemas";

export default async function AnalyticsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Fetch analytics data
    const apiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/analytics/${id}`,
        { cache: "no-store" }
    );

    if (!apiResponse.ok) {
        notFound();
    }

    const rawData = await apiResponse.json();
    const result = AnalyticsResponseSchema.safeParse(rawData);

    if (!result.success) {
        console.error("Analytics validation error:", result.error);
        // We could show an error UI here, but for now fallback to raw data with cast if needed
        // or just throw to let Next.js handle it
    }

    const data: AnalyticsResponse = result.success ? result.data : rawData as AnalyticsResponse;

    return (
        <main className="min-h-screen p-8 max-w-6xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{data.set.title}</h1>
                    <p className="text-muted-foreground">Performance Analytics</p>
                </div>
                <Link
                    href="/"
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80"
                >
                    Back to Dashboard
                </Link>
            </header>

            {/* Mastery Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-6 rounded-2xl border border-indigo-500/20 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                            Acceleration Factor
                        </h3>
                        <p className="text-4xl font-black text-indigo-700">
                            {data.summary.avgAcceleration}x
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            How much faster you get from Round 1 to the final round on average.
                        </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 text-8xl font-black text-indigo-500/5 select-none">
                        AC
                    </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 rounded-2xl border border-emerald-500/20 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
                            Learning Velocity
                        </h3>
                        <p className="text-4xl font-black text-emerald-700">
                            {data.summary.learningVelocity > 0 ? `+${data.summary.learningVelocity}s` : `${data.summary.learningVelocity}s`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Improvement in Round 1 starting speed since your first session.
                        </p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 text-8xl font-black text-emerald-500/5 select-none">
                        LV
                    </div>
                </div>
            </div>

            {/* Session Evolution Comparison */}
            {data.sessionHistory.length > 0 && (
                <section className="mb-8 bg-card p-8 rounded-2xl border shadow-lg overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">Session Evolution</h2>
                            <p className="text-sm text-muted-foreground">Comparing your progression across sessions.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Slope Chart Representation */}
                        <div className="space-y-4">
                            {data.sessionHistory.slice(-5).map((session: any, idx: number) => (
                                <div key={session.id} className="relative group">
                                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase mb-1 px-1">
                                        <span>Session {data.sessionHistory.length - 4 + idx}</span>
                                        <span className="text-primary">{new Date(session.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 h-8">
                                        <div className="w-12 text-sm font-mono font-bold text-muted-foreground text-right border-r pr-2">
                                            {session.startSpeed}s
                                        </div>
                                        <div className="flex-1 h-full bg-muted/30 rounded-full relative overflow-hidden">
                                            <div
                                                className="absolute left-0 top-0 h-full bg-primary/20 transition-all group-hover:bg-primary/30"
                                                style={{ width: `${(session.endSpeed / session.startSpeed) * 100}%` }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-black z-10">
                                                <span className="text-primary/70">START</span>
                                                <span className="text-primary">FINISH ({session.endSpeed}s)</span>
                                            </div>
                                        </div>
                                        <div className="w-12 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded text-center">
                                            {session.accelerationFactor}x
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-muted/30 p-6 rounded-2xl flex flex-col justify-center border border-dashed">
                            <h4 className="text-sm font-bold mb-4 uppercase tracking-tighter">Insights</h4>
                            <ul className="space-y-4 text-sm">
                                <li className="flex gap-3">
                                    <span className="text-primary font-bold">↑</span>
                                    <p>Your <strong>Acceleration Factor</strong> is {data.summary.avgAcceleration}x. You typically finish {data.summary.avgAcceleration} times faster than you start.</p>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-emerald-500 font-bold">✓</span>
                                    <p>Your <strong>Learning Velocity</strong> shows a {data.summary.learningVelocity}s improvement in first-round recognition.</p>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-blue-500 font-bold">ℹ</span>
                                    <p>Typical "Woodpecker Mastery" is reached when your final round time is under <strong>5 seconds</strong> with zero errors.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            )}

            {/* Convergence Chart (Mean vs Median) */}
            {data.convergenceData.length > 0 && (
                <section className="mb-8 bg-card p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Convergence Chart (Intuition Building)</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        As you reach Cycle 7, Mean and Median times should converge at a low number (3-5s).
                    </p>
                    <div className="space-y-6">
                        {data.convergenceData.map((stat: any) => (
                            <div key={stat.round} className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Round {stat.round}</span>
                                    <span className="text-muted-foreground">{stat.count} sessions</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold uppercase w-12 text-blue-500">Mean</span>
                                        <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-blue-500 h-full transition-all"
                                                style={{ width: `${Math.min((stat.meanTime / Math.max(...data.convergenceData.map((s: any) => s.meanTime))) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono w-10">{stat.meanTime}s</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold uppercase w-12 text-purple-500">Median</span>
                                        <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                                            <div
                                                className="bg-purple-500 h-full transition-all"
                                                style={{ width: `${Math.min((stat.medianTime / Math.max(...data.convergenceData.map((s: any) => s.meanTime))) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono w-10">{stat.medianTime}s</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Knowledge Gaps (By Pattern Tag) */}
            {data.patternStats.length > 0 && (
                <section className="mb-8 bg-card p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Knowledge Gaps (By Topic)</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Topics slowing down your total cycle time.
                    </p>
                    <div className="grid gap-4">
                        {data.patternStats.map((stat: any) => (
                            <div key={stat.tag} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">{stat.tag}</h4>
                                    <p className="text-xs text-muted-foreground">{stat.avgAccuracy}% Accuracy • {stat.totalAttempts} Attempts</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-lg font-black ${stat.avgTime > 10 ? 'text-red-500' : 'text-primary'}`}>
                                        {stat.avgTime}s
                                    </span>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Avg Time</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Question Difficulty Analysis */}
            <section className="mb-8 bg-card p-6 rounded-xl border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">
                    Question Difficulty (Hardest First)
                </h2>
                <div className="space-y-2">
                    {data.questionStats.slice(0, 10).map((q: any, idx: number) => (
                        <div
                            key={q.questionId}
                            className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                        >
                            <span className="text-sm font-bold text-muted-foreground w-8">
                                #{idx + 1}
                            </span>
                            <div className="flex-1">
                                <p className="text-sm font-medium line-clamp-1">{q.question}</p>
                                {q.patternTag && (
                                    <span className="text-xs text-muted-foreground">
                                        {q.patternTag}
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold">
                                    {Math.round(q.accuracy)}% correct
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {q.totalAttempts} attempt{q.totalAttempts !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent Rounds */}
            {data.roundStats.length > 0 && (
                <section className="bg-card p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Recent Rounds</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Round</th>
                                    <th className="text-left p-2">Score</th>
                                    <th className="text-left p-2">Accuracy</th>
                                    <th className="text-left p-2">Time</th>
                                    <th className="text-left p-2">Target</th>
                                    <th className="text-left p-2">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.roundStats.slice(0, 20).map((round: any, idx: number) => (
                                    <tr key={idx} className="border-b hover:bg-muted/50">
                                        <td className="p-2">Round {round.roundNumber}</td>
                                        <td className="p-2">
                                            {round.score}/{round.totalQuestions}
                                        </td>
                                        <td className="p-2">{Math.round(round.accuracy)}%</td>
                                        <td className="p-2">
                                            {round.timeTaken ? `${round.timeTaken}s` : "—"}
                                        </td>
                                        <td className="p-2">
                                            {round.targetTime ? `${round.targetTime}s` : "—"}
                                        </td>
                                        <td className="p-2 text-muted-foreground">
                                            {new Date(round.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </main>
    );
}
