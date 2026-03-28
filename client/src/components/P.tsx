const P = ({children, noMB, style }: {children: React.ReactNode, noMB?: boolean, style?: React.CSSProperties}) => 
        noMB ? 
            <p className="w-full mx-auto text-base px-4 z-10 box-border" style={style}>
                {children}
            </p>
        :
            <p className="w-full mx-auto text-base px-4 mb-8 z-10 box-border" style={style}>
                {children}
            </p>

export default P