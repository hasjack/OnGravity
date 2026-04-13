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

    // Close menu on route change
    useEffect(() => {
        setOpen(false)
    }, [location.pathname])

    // Close on ESC
    useEffect(() => {
        if (!open) return

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [open])

    return (
        <>
            {/* Mobile button */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm top-4 left-4 z-50 fixed print:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
            >
                <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>

                <span className="relative block h-4 w-5">
                    <span
                        className={[
                            "absolute left-0 top-0 block h-px w-full bg-black transition-transform duration-200",
                            open ? "translate-y-2 rotate-45" : ""
                        ].join(" ")}
                    />
                    <span
                        className={[
                            "absolute left-0 top-2 block h-px w-full bg-black transition-opacity duration-200",
                            open ? "opacity-0" : "opacity-100"
                        ].join(" ")}
                    />
                    <span
                        className={[
                            "absolute left-0 top-4 block h-px w-full bg-black transition-transform duration-200",
                            open ? "-translate-y-2 -rotate-45" : ""
                        ].join(" ")}
                    />
                </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-8 text-sm tracking-wide">
                {navigation.map((section: Navigation) => (
                    <div key={section.title} className="flex items-center gap-4">
                        <span className="text-xs uppercase tracking-wider text-gray-500">
                            {section.title}
                        </span>
                        <div className="flex items-center gap-3">
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
                                                ? "text-blue-600 font-semibold underline"
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

            {/* Overlay + drawer */}
            {open ? (
                <div className="fixed inset-0 z-50">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/30"
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                    />

                    <aside className="absolute left-0 top-0 h-full w-full max-w-xs bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
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

                        <div className="flex flex-col gap-5 text-base">
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
                                                        "py-2 border-b border-black/10 transition-colors duration-200 " +
                                                        (active
                                                            ? "text-blue-600 font-semibold"
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