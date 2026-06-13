const H1 = ({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) => 
    <h1 className="mb-5 w-full text-3xl font-semibold leading-tight tracking-normal text-neutral-950 md:text-4xl" style={style}>{children}</h1>

const H2 = ({ children, classNames = "mb-2", style }: { children: React.ReactNode, classNames?: string, style?: React.CSSProperties }) => 
    <h2 className={"mt-10 w-full text-xl font-semibold leading-snug tracking-normal text-neutral-950 lg:text-2xl" + " " + classNames} style={style}>{children}</h2>

const H2Alt = ({ children, classNames = "mb-6", style }: { children: React.ReactNode, classNames?: string, style?: React.CSSProperties }) => 
    <h2 className={"mt-10 w-full text-2xl font-semibold leading-snug tracking-normal text-neutral-950 md:text-3xl" + " " + classNames} style={style}>{children}</h2>

const H3 = ({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) => 
    <h3 className="mb-2 mt-7 w-full text-base font-semibold leading-snug tracking-normal text-neutral-950 md:px-1" style={style}>{children}</h3>

const H4 = ({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) => 
    <h4 className="mb-2 mt-6 w-full text-sm font-semibold uppercase leading-snug tracking-wide text-neutral-600 md:px-1" style={style}>{children}</h4>

const P = ({children, classNames = "mb-4", style }: {children: React.ReactNode, classNames?: string, style?: React.CSSProperties}) => 
        <p className={"z-10 mx-auto box-border w-full text-base leading-7 text-neutral-700 print:text-sm lg:px-1" + " " + classNames} style={style}>
            {children}
        </p>

const Ul = ({children, classNames, style }: {children: React.ReactNode, classNames?: string | "", style?: React.CSSProperties}) => 
    <ul className={"mb-4 w-full list-disc px-6 text-base leading-7 text-neutral-700 print:text-sm lg:px-10" + " " + classNames} style={style}>{children}</ul>

const Ol = ({children, classNames, style }: {children: React.ReactNode, classNames?: string | "", style?: React.CSSProperties}) => 
    <ol className={"mb-4 box-border w-full list-decimal px-8 text-base leading-7 text-neutral-700 print:text-sm" + " " + classNames} style={style}>{children}</ol>

const Li = ({children, classNames, style }: {children: React.ReactNode, classNames?: string | "", style?: React.CSSProperties}) => 
    <li className={"mb-2 w-full px-2" + " " + classNames} style={style}>{children}</li>

export { H1, H2, H2Alt, H3, H4, P, Ul, Ol, Li }
