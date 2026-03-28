import type React from 'react'
import Share from '../components/Share'
import { H1, P } from '../components/Typography'
import { Link } from 'react-router'

const Article = ({ title, author, dateTime, url, children }: {
    title: string,
    author: string,
    dateTime: string,
    url: string,
    children: React.ReactNode
}) => {
    return (
        <>
            <div className="absolute top-4 right-4 z-10 flex gap-1 print:hidden">
                <Share shareUrl={window.location.href} title={title} />
            </div>
            <section className="relative flex flex-col items-center text-gray-800 bg-white py-24 print:py-0">

                <div className="relative max-w-5xl flex flex-col items-center px-4">
                    <H1>{title}</H1>
                    <div className="flex mb-8 w-full border-b-2 border-gray-200 pb-4">
                        <img src="/logo.png" className="h-6 mr-2" />
                        <P classNames="mb-0 font-bold">
                            {author} - {dateTime}
                        </P>
                        <P classNames="mb-0 text-right hidden lg:block">
                            {!(url === '') && (
                                <Link
                                    to={url}
                                    target="_blank"
                                    className="block w-full break-all underline text-sm"
                                >{url.replace('https://', '')}</Link>
                            )}
                        </P>
                    </div>
                    {children}
                </div>
            </section>
        </>
    )
}

export default Article