import React from 'react'

type Props = {
    text?: string
}

const Loader = (props: Props) => {
    const { text } = props
    return (
        <div>
            <div className="flex h-screen w-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <img 
                            src="/logo.png" 
                            alt="Logo" 
                            className="w-20 h-20 object-contain animate-breathe"
                        />
                    </div>
                    {text && (
                        <p className="text-[14px] font-black text-gray-900 uppercase tracking-[0.2em] animate-pulse">
                            {text}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Loader