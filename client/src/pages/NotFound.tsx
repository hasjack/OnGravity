import { Link, useRouteError } from "react-router-dom"

const NotFound = () => {
    const error = useRouteError() as any

    // Router will use this for 404s *and* other route errors if you wire it as errorElement
    const title =
        error?.status === 404 ? "404 — Page not found" : "Something went wrong"

    const message =
        error?.status === 404
            ? "That page doesn’t exist."
            : "An unexpected error occurred."

    return (
        <div className="py-16">
            <h2 className="text-2xl font-semibold tracking-wide mb-4 text-center">
                {title}
            </h2>

            <p className="text-sm leading-relaxed mb-8 text-center">
                {message}
            </p>

            <Link to="/" className="text-sm underline block text-center">
                Back to home
            </Link>
        </div>
    )
}

export default NotFound