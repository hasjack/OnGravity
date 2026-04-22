import { Link } from 'react-router'

const { VITE_APP_CDN_URL } = import.meta.env
const CDN = VITE_APP_CDN_URL

export default function FurtherReading({ items }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any) => {
                const isExternal = item.to.startsWith("https://")
                return (
                    <article
                        key={item.to}
                        className="group rounded-2xl border border-gray-800/60 bg-black/20 overflow-hidden shadow-sm hover:shadow-md hover:border-gray-700 transition"
                    >
                        <div className="aspect-[16/10] bg-gray-900 relative">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
                            )}
                        </div>

                        <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs tracking-wide uppercase text-gray-800 bg-gray-800/60 border border-gray-700/60 rounded-full px-3 py-1">
                                    {item.itemType}
                                </span>
                                <span className="text-xs text-gray-900">{item.date}</span>
                            </div>

                            <h3 className="text-base leading-snug text-gray-900">
                                <Link
                                    to={item.to}
                                    target={isExternal ? "_blank" : "_self"}
                                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                                >
                                    <span className="underline decoration-gray-600 group-hover:decoration-gray-300">
                                        {item.label}
                                    </span>
                                </Link>
                            </h3>

                            <div className="text-sm text-gray-600">
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500/80" />
                                    <Link
                                        to={item.to}
                                        target={isExternal ? "_blank" : "_self"}
                                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
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