import { BlockMath } from "react-katex";

const Latex = ({ math }: { math: string }) => {
    return (
        <div className="text-xs md:text-base xl:text-xl">
            <BlockMath math={String.raw`${math}`} />
        </div>
    )
}

export default Latex