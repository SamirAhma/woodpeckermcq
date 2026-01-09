import { Question } from "@prisma/client";

interface QuestionCardProps {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
    selectedOption: string | null;
    showFeedback: boolean;
    onAnswer: (option: string) => void;
    disabled: boolean;
}

export default function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    selectedOption,
    showFeedback,
    onAnswer,
    disabled,
}: QuestionCardProps) {
    const getOptionStyle = (option: string) => {
        const baseStyle = "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 font-medium";

        if (!showFeedback) {
            return `${baseStyle} ${selectedOption === option
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50"
                }`;
        }

        if (option === question.answer) {
            return `${baseStyle} border-emerald-500 bg-emerald-50 text-emerald-700`;
        }

        if (selectedOption === option && option !== question.answer) {
            return `${baseStyle} border-red-500 bg-red-50 text-red-700`;
        }

        return `${baseStyle} border-slate-200 bg-slate-100 text-slate-500`;
    };

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                    Question {questionNumber} of {totalQuestions}
                </p>
                <h3 className="text-xl font-semibold text-slate-800 leading-relaxed">
                    {question.question}
                </h3>
            </div>

            <div className="space-y-3">
                {question.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => onAnswer(option)}
                        disabled={disabled}
                        className={getOptionStyle(option)}
                    >
                        <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}
