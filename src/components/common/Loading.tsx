import React from 'react'

type Props = {
    text?: string
}

const Loader = (props: Props) => {
    const { text } = props
    return (
        <div>
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
                    {text && <p className="text-sm text-gray-500">{text}…</p>}
                </div>
            </div>
        </div>
    )
}

export default Loader