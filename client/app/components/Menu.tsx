import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router"

type NavItem = {
    to: string
    label: string
}

type Navigation = {
    title: string
    items: NavItem[]
}

type Props = {
    navigation: Navigation[]
}

const Menu = ({ navigation }: Props) => {
    const [open, setOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        setOpen(false)
    }, [location.pathname])

    useEffect(() => {
        if (!open) return

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [open])

    useEffect(() => {
        if (!open) return

        const originalBodyOverflow = document.body.style.overflow
        const originalHtmlOverflow = document.documentElement.style.overflow
        const originalBodyTouchAction = document.body.style.touchAction

        document.body.style.overflow = "hidden"
        document.documentElement.style.overflow = "hidden"
        document.body.style.touchAction = "none"

        return () => {
            document.body.style.overflow = originalBodyOverflow
            document.documentElement.style.overflow = originalHtmlOverflow
            document.body.style.touchAction = originalBodyTouchAction
        }
    }, [open])

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="fixed top-4 left-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm print:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
            >
                <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>

                <span className="relative block h-4 w-5">
                    <span
                        className={[
                            "absolute left-0 top-0 block h-px w-full bg-black transition-transform duration-200",
                            open ? "translate-y-2 rotate-45" : "",
                        ].join(" ")}
                    />
                    <span
                        className={[
                            "absolute left-0 top-2 block h-px w-full bg-black transition-opacity duration-200",
                            open ? "opacity-0" : "opacity-100",
                        ].join(" ")}
                    />
                    <span
                        className={[
                            "absolute left-0 top-4 block h-px w-full bg-black transition-transform duration-200",
                            open ? "-translate-y-2 -rotate-45" : "",
                        ].join(" ")}
                    />
                </span>
            </button>

            <nav className="hidden items-center gap-6 text-xs tracking-wide">
                {navigation.map((section: Navigation) => (
                    <div key={section.title} className="flex items-center gap-3">
                        <span className="text-xs uppercase tracking-wider text-gray-500">
                            {section.title}
                        </span>
                        <div className="flex items-center gap-2">
                            {section.items.map(item => {
                                const active =
                                    location.pathname === item.to ||
                                    (item.to !== "/" && location.pathname.startsWith(item.to))

                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={
                                            "transition-colors duration-200 " +
                                            (active
                                                ? "font-semibold text-blue-600 underline"
                                                : "text-black/80 hover:text-black")
                                        }
                                    >
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {open ? (
                <div className="fixed inset-0 z-50">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                    />

                    <aside
                        className="
              absolute left-0 top-0 h-dvh w-full max-w-xs
              overflow-y-auto overscroll-contain
              bg-white p-6 shadow-xl
              touch-pan-y
            "
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <div className="text-sm font-semibold uppercase tracking-wide">
                                Menu
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="text-sm underline"
                            >
                                Close
                            </button>
                        </div>

                        <div className="flex flex-col gap-5 pb-10 text-sm">
                            {navigation.map((section: Navigation) => (
                                <div key={section.title}>
                                    <div className="mb-2 mt-5 text-sm font-semibold uppercase tracking-wide text-gray-600">
                                        {section.title}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {section.items.map(item => {
                                            const active =
                                                location.pathname === item.to ||
                                                (item.to !== "/" && location.pathname.startsWith(item.to))

                                            return (
                                                <Link
                                                    key={item.to}
                                                    to={item.to}
                                                    className={
                                                        "border-b border-black/10 py-2 transition-colors duration-200 " +
                                                        (active
                                                            ? "font-semibold text-blue-600"
                                                            : "text-black/80 hover:text-black")
                                                    }
                                                >
                                                    {item.label}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            ) : null}
        </>
    )
}

export default Menu