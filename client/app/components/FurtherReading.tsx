import { Link } from 'react-router'

const { VITE_APP_CDN_URL } = import.meta.env
const CDN = VITE_APP_CDN_URL

export default function FurtherReading({ items }) {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item: any) => {
                const isExternal = item.to.startsWith("https://")
                return (
                    <article
                        key={item.to}
                        className="group overflow-hidden rounded-md border border-neutral-300 bg-neutral-50 shadow-sm transition hover:border-neutral-400 hover:bg-white hover:shadow-md"
                    >
                        <div className="relative aspect-[16/10] bg-neutral-100">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover opacity-95 transition group-hover:opacity-100"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-neutral-100" />
                            )}
                        </div>

                        <div className="space-y-3 p-5">
                            <div className="flex items-center justify-between gap-3">
                                <span className="border border-neutral-300 bg-white px-2.5 py-1 text-xs uppercase tracking-wide text-neutral-600">
                                    {item.itemType}
                                </span>
                                <span className="text-xs text-neutral-600">{item.date}</span>
                            </div>

                            <h3 className="text-base leading-snug text-neutral-950">
                                <Link
                                    to={item.to}
                                    target={isExternal ? "_blank" : "_self"}
                                    className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                    <span className="underline decoration-neutral-400 underline-offset-2 group-hover:decoration-neutral-950">
                                        {item.label}
                                    </span>
                                </Link>
                            </h3>

                            <div className="text-sm text-neutral-600">
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500/80" />
                                    <Link
                                        to={item.to}
                                        target={isExternal ? "_blank" : "_self"}
                                        className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    >Read</Link>
                                </span>
                            </div>
                        </div>
                    </article>
                )
            })}
        </div>
    )
}
