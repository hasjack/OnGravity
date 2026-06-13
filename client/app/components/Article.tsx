import type React from 'react'
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

const Article = ({ title, author, dateTime, url, shareUrl, children }: ArticleProps) => {
    return (
        <article className="relative bg-white px-5 py-14 font-mono text-neutral-800 print:py-0 sm:px-8 lg:py-16">
            <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)] lg:px-10">
                <aside className="min-w-0 self-start border-neutral-200 pr-0 md:sticky md:top-14 md:border-r md:pr-8">
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
                </aside>

                <div className="min-w-0">
                    <header className="relative flex w-full flex-col items-start border-b border-neutral-200 pb-6">
                        <h1 className="mb-5 w-full text-2xl font-semibold leading-snug tracking-normal text-neutral-950 sm:text-[1.7rem] lg:text-[1.85rem]">
                            {title}
                        </h1>
                    </header>

                    <div className="relative mt-6 flex w-full flex-col items-center [&>h2:first-child]:mt-0">
                        {children}
                    </div>
                </div>
            </div>
        </article>
    )
}

export default Article
