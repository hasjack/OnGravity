const Img = ({ path, alt }: { path: string, alt: string }) => {
    return (
        <img src={path} alt={alt} className="w-auto mb-2 lg:max-w-3xl print:w-[84%]" />
    )
}

export default Img