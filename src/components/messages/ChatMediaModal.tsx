import React, { useState, useRef } from 'react';
import { X, Send, Plus, Loader2 } from 'lucide-react';

interface ChatMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    files: File[];
    onSend: (files: File[], caption: string) => void;
    isUploading: boolean;
    onRemoveFile: (index: number) => void;
    onAddFiles: (files: File[]) => void;
}

export const ChatMediaModal: React.FC<ChatMediaModalProps> = ({ isOpen, onClose, files, onSend, isUploading, onRemoveFile, onAddFiles }) => {
    const [caption, setCaption] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleSend = () => {
        if (isUploading || files.length === 0) return;
        onSend(files, caption);
        setCaption("");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onAddFiles(Array.from(e.target.files));
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Preview ({files.length}/5)</h3>
                    <div className="flex items-center gap-2">
                        {files.length < 5 && (
                            <button 
                                onClick={() => fileInputRef.current?.click()} 
                                disabled={isUploading}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-md transition-colors disabled:opacity-50"
                            >
                                <Plus className="h-4 w-4" /> Add More
                            </button>
                        )}
                        <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFileSelect} />
                        <button onClick={onClose} disabled={isUploading} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors disabled:opacity-50">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Body (Images Preview) */}
                <div className="p-4 bg-gray-100 flex-1 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {files.map((file, index) => {
                            const url = URL.createObjectURL(file);
                            return (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden shadow-sm border border-gray-200 group">
                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    {!isUploading && (
                                        <button 
                                            onClick={() => onRemoveFile(index)} 
                                            className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer (Input) */}
                <div className="p-4 bg-white flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Add a caption..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isUploading) handleSend();
                        }}
                        disabled={isUploading || files.length === 0}
                        className="flex-1 bg-gray-100 rounded-full px-5 py-2.5 outline-none text-sm text-gray-800 placeholder:text-gray-400 border border-transparent focus:border-gray-300 transition-colors disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isUploading || files.length === 0}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-transform active:scale-95 flex-shrink-0 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {isUploading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5 ml-0.5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
