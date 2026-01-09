"use client";

import SetUploadForm from "./SetUploadForm";

interface CreateSetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateSetModal({ isOpen, onClose }: CreateSetModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-background w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-muted/50">
                    <h2 className="text-lg font-bold">Create New Set</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <SetUploadForm onSuccess={onClose} />
                </div>
            </div>
        </div>
    );
}
