import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import Share from '../components/Share'
import { Link } from 'react-router'

type ArticleProps = {
  title: string
  author: string
  dateTime: string
  url: string
  shareUrl?: string
  children: React.ReactNode
}

type SectionLink = {
  id: string
  label: string
}

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section'

const Article = ({ title, author, dateTime, url, shareUrl, children }: ArticleProps) => {
    const contentRef = useRef<HTMLDivElement | null>(null)
    const [sections, setSections] = useState<SectionLink[]>([])
    const [activeSection, setActiveSection] = useState<string>("")

    useEffect(() => {
        const root = contentRef.current
        if (!root) return

        const seen = new Map<string, number>()
        const nextSections = Array.from(root.querySelectorAll("h2"))
            .map((heading) => {
                const label = heading.textContent?.trim() || ""
                if (!label) return null

                const baseId = heading.id || slugify(label)
                const count = seen.get(baseId) || 0
                seen.set(baseId, count + 1)

                const id = count === 0 ? baseId : `${baseId}-${count + 1}`
                heading.id = id

                return { id, label }
            })
            .filter((section): section is SectionLink => section !== null)

        setSections(nextSections)
        setActiveSection((current) => current || nextSections[0]?.id || "")
    }, [children])

    useEffect(() => {
        if (!sections.length) return

        const updateActiveSection = () => {
            const candidates = sections
                .map((section) => {
                    const element = document.getElementById(section.id)
                    if (!element) return null

                    return {
                        id: section.id,
                        top: element.getBoundingClientRect().top,
                    }
                })
                .filter((section): section is { id: string; top: number } => section !== null)

            const visibleOffset = 140
            const passedSections = candidates.filter((section) => section.top <= visibleOffset)
            const nextActive =
                passedSections.at(-1)?.id ||
                candidates.find((section) => section.top > visibleOffset)?.id ||
                sections[0]?.id ||
                ""

            setActiveSection(nextActive)
        }

        updateActiveSection()
        window.addEventListener("scroll", updateActiveSection, { passive: true })
        window.addEventListener("resize", updateActiveSection)

        return () => {
            window.removeEventListener("scroll", updateActiveSection)
            window.removeEventListener("resize", updateActiveSection)
        }
    }, [sections])

    const scrollToSection = useCallback((event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        const element = document.getElementById(id)
        if (!element) return

        event.preventDefault()
        element.scrollIntoView({ behavior: "smooth", block: "start" })
        history.replaceState(null, "", `#${id}`)
        setActiveSection(id)
    }, [])

    return (
        <article className="relative bg-white px-5 py-14 font-mono text-neutral-800 print:py-0 sm:px-8 lg:py-16">
            <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)] lg:px-10">
                <aside className="min-w-0 self-start overflow-y-auto border-neutral-200 pr-0 md:sticky md:top-14 md:max-h-[calc(100dvh-7rem)] md:border-r md:pr-8">
                    <img src="/logo.png" alt="" className="h-14 w-14" />
                    <div className="mt-5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Research object
                    </div>
                    <div className="mt-3 text-base font-semibold leading-snug text-neutral-950">
                        {author}
                    </div>
                    <time className="mt-1 block text-sm text-neutral-500">{dateTime}</time>
                    {shareUrl && (
                        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
                            <Share {...{ shareUrl, title }} />
                        </div>
                    )}

                    {url !== '' && (
                        <Link
                            to={url}
                            target="_blank"
                            className="mt-5 block max-w-sm break-all text-xs leading-5 text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950"
                        >
                            {url.replace('https://', '')}
                        </Link>
                    )}

                    {sections.length > 0 && (
                        <nav className="mt-7 border-t border-neutral-200 pt-5 print:hidden" aria-label="Article sections">
                            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                Sections
                            </div>
                            <div className="mt-3 flex flex-col gap-1">
                                {sections.map((section) => {
                                    const active = activeSection === section.id

                                    return (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            onClick={(event) => scrollToSection(event, section.id)}
                                            className={[
                                                "border-l py-1.5 pl-3 text-xs leading-5 transition-colors duration-200",
                                                active
                                                    ? "border-neutral-950 font-semibold text-neutral-950"
                                                    : "border-neutral-200 text-neutral-500 hover:border-neutral-500 hover:text-neutral-950",
                                            ].join(" ")}
                                        >
                                            {section.label}
                                        </a>
                                    )
                                })}
                            </div>
                        </nav>
                    )}
                </aside>

                <div className="min-w-0">
                    <header className="relative flex w-full flex-col items-start border-b border-neutral-200 pb-6">
                        <h1 className="mb-5 w-full text-2xl font-semibold leading-snug tracking-normal text-neutral-950 sm:text-[1.7rem] lg:text-[1.85rem]">
                            {title}
                        </h1>
                    </header>

                    <div ref={contentRef} className="relative mt-6 flex w-full flex-col items-center scroll-smooth [&>h2:first-child]:mt-0 [&_h2]:scroll-mt-10">
                        {children}
                    </div>
                </div>
            </div>
        </article>
    )
}

export default Article
