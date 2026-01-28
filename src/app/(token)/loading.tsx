// app/(token)/loading.tsx
export default function Loading() {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
                <p className="text-sm text-gray-500">Checking session…</p>
            </div>
        </div>
    );
}
