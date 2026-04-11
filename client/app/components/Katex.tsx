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
    large?: boolean
}

export function BlockMath({ math, large }: BlockMathProps) {
    const html = useMemo(
        () => katex.renderToString(math, {
            throwOnError: false,
            displayMode: true,
        }),
        [math]
    )

    return <div className={large ? "text-xl md:text-2xl lg:text-3xl" : "text-xs md:text-base xl:text-xl"} dangerouslySetInnerHTML={{ __html: html }} />
}