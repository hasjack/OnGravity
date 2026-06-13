import { useEffect } from "react"
import { Link, useLocation } from "react-router"

type NavItem = {
    to: string
    label: string
}

type Navigation = {
    title?: string
    items: NavItem[]
}

type Props = {
    navigation: Navigation[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

const Menu = ({ navigation, open, onOpenChange }: Props) => {
    const location = useLocation()

    useEffect(() => {
        onOpenChange(false)
    }, [location.pathname, onOpenChange])

    useEffect(() => {
        if (!open) return

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onOpenChange(false)
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [onOpenChange, open])

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
                onClick={() => onOpenChange(!open)}
                className="fixed left-4 top-4 z-[70] inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm print:hidden"
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
                {navigation.map((section: Navigation, sectionIndex) => (
                    <div key={section.title || `section-${sectionIndex}`} className="flex items-center gap-3">
                        {section.title && (
                            <span className="text-xs uppercase tracking-wider text-gray-500">
                                {section.title}
                            </span>
                        )}
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

            <button
                type="button"
                className={[
                    "fixed inset-0 z-30 bg-black/35 transition-opacity duration-300 print:hidden",
                    open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
                ].join(" ")}
                onClick={() => onOpenChange(false)}
                aria-label="Dismiss menu"
                tabIndex={open ? 0 : -1}
            />

            <aside
                className={[
                    "fixed left-0 top-0 z-50 flex h-dvh w-72 flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out touch-pan-y print:hidden sm:w-80",
                    open ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
                aria-hidden={!open}
            >
                <div className="h-16 shrink-0" aria-hidden="true" />

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
                    <div className="flex flex-col gap-4 text-sm">
                        {navigation.map((section: Navigation, sectionIndex) => (
                            <div key={section.title || `section-${sectionIndex}`} className={section.title ? "" : "pt-4"}>
                                {section.title && (
                                    <div className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        {section.title}
                                    </div>
                                )}
                                <div className="flex flex-col gap-1">
                                    {section.items.map(item => {
                                        const active =
                                            location.pathname === item.to ||
                                            (item.to !== "/" && location.pathname.startsWith(item.to))

                                        return (
                                            <Link
                                                key={item.to}
                                                to={item.to}
                                                className={
                                                    "py-1.5 leading-5 transition-colors duration-200 " +
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
                </div>

                <div className="shrink-0 px-5 py-4">
                    <div className="min-h-8" aria-hidden="true" />
                </div>
            </aside>
        </>
    )
}

export default Menu
