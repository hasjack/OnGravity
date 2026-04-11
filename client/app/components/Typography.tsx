const H1 = ({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) => 
    <h1 className="w-full text-xl md:text-2xl lg:text-3xl mb-6 font-semibold" style={style}>{children}</h1>

const H2 = ({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) => 
    <h2 className="w-full text-lg lg:text-xl mb-2 font-semibold" style={style}>{children}</h2>

const H2Alt = ({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) => 
    <h2 className="w-full text-xl md:text-2xl lg:text-3xl mb-6 font-semibold" style={style}>{children}</h2>

const H3 = ({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) => 
    <h3 className="w-full text-base md:px-1 mb-2 font-semibold" style={style}>{children}</h3>

const H4 = ({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) => 
    <h4 className="w-full text-base md:px-1 mb-2 font-semibold" style={style}>{children}</h4>

const P = ({children, classNames = "mb-4", style }: {children: React.ReactNode, classNames?: string, style?: React.CSSProperties}) => 
        <p className={"w-full mx-auto text-sm sm:text-base print:text-sm lg:px-1 z-10 box-border" + " " + classNames} style={style}>
            {children}
        </p>

const Ul = ({children, classNames, style }: {children: React.ReactNode, classNames?: string | "", style?: React.CSSProperties}) => 
    <ul className={"w-full mb-2 px-4 lg:px-12 text-sm sm:text-base print:text-sm list-disc" + " " + classNames} style={style}>{children}</ul>

const Ol = ({children, classNames, style }: {children: React.ReactNode, classNames?: string | "", style?: React.CSSProperties}) => 
    <ol className={"w-full mb-2 px-8 list-decimal box-border text-sm sm:text-base print:text-sm" + " " + classNames} style={style}>{children}</ol>

const Li = ({children, classNames, style }: {children: React.ReactNode, classNames?: string | "", style?: React.CSSProperties}) => 
    <li className={"w-full mb-4 px-2" + " " + classNames} style={style}>{children}</li>

export { H1, H2, H2Alt, H3, H4, P, Ul, Ol, Li }