type CitationMeta = {
    title: string
    author: string
    publicationDate: string
    doi?: string
}

type SeoMetaInput = {
    title: string
    description: string
    pathname: string
    image?: string
    keywords?: string
    type?: "website" | "article"
    noIndex?: boolean
    citation?: CitationMeta
}

const DEFAULT_IMAGE = "https://cdn.halfasecond.com/images/onGravity/k-framework.jpg"
const DEFAULT_KEYWORDS =
    "kappa framework, natural mathematics, weak-field gravity, galaxy rotation curves, SPARC dataset, dynamical systems, numerical diagnostics, Jack Pickett"

export function pageMeta({
    title,
    description,
    pathname,
    image = DEFAULT_IMAGE,
    keywords = DEFAULT_KEYWORDS,
    type = "website",
    noIndex = false,
    citation,
}: SeoMetaInput) {
    const url = `https://halfasecond.com${pathname}`
    const tags = [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: type },
        { property: "og:url", content: url },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        { name: "keywords", content: keywords },
    ]

    if (noIndex) {
        tags.push({ name: "robots", content: "noindex, nofollow" })
    }

    if (citation) {
        tags.push(
            { name: "citation_title", content: citation.title },
            { name: "citation_author", content: citation.author },
            { name: "citation_publication_date", content: citation.publicationDate },
            { name: "citation_language", content: "en" },
        )

        if (citation.doi) {
            tags.push({ name: "citation_doi", content: citation.doi })
        }
    }

    return tags
}
