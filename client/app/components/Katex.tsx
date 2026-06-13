import { useMemo } from "react"
import katex from "katex"

type InlineMathProps = {
    math: string
}

export function InlineMath({ math }: InlineMathProps) {
    const html = useMemo(
        () => katex.renderToString(math, { throwOnError: false }),
        [math]
    )

    return <span dangerouslySetInnerHTML={{ __html: html }} />
}

type BlockMathProps = {
    math: string,
    large?: boolean,
    classNames?: string
}

export function BlockMath({ math, large, classNames = "" }: BlockMathProps) {
    const html = useMemo(
        () => katex.renderToString(math, {
            throwOnError: false,
            displayMode: true,
        }),
        [math]
    )

    return (
        <div
            className={[
                "my-5 min-w-0 w-full max-w-full overflow-x-auto rounded-md bg-neutral-50 px-3 py-4 text-neutral-950",
                large ? "text-xl md:text-2xl lg:text-3xl" : "text-sm md:text-base lg:text-lg",
                classNames,
            ].join(" ")}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}
