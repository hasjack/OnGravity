const Img = ({ path, alt, classNames = "" }: { path: string, alt: string, classNames?: string }) => {
    return (
        <img src={path} alt={alt} className={"mb-6 w-full max-w-full rounded-lg border border-neutral-200 bg-neutral-50 object-contain print:w-[84%] " + classNames} />
    )
}

export default Img
