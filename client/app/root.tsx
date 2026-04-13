import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router"
import Menu from "./components/Menu"

import appStylesHref from "./app.css?url"

export const links = () => [
    { rel: "stylesheet", href: appStylesHref },
]

const navigation = [
    {
        title: "Main",
        items: [
            { to: "/", label: "Home" },
            // { to: "/journal", label: "Latest News" }
        ]
    },
    {
        title: "Pre-prints",
        items: [
            { to: "/preprint/a-curvature-response-model-for-weak-field-gravity", label: "A Curvature Response Model for Weak-Field Gravity" },
            { to: "/analysis/sparc-galaxy-rotation-curves", label: "Analysis - SPARC rotation curves" },
            { to: "/analysis/solar-system", label: "Analysis - Solar System" }
        ]
    },
    {
        title: "Foundations & Logic",
        items: [
            { to: "/non-trivial-mars-bars", label: "Non-trivial Mars bars" },
            { to: "/preprint/quantum-gravity-phase-resolution", label: "Quantum Gravity Phase Resolution" },
            { to: "/preprint/natural-mathematics-mandelbrot-diagnostics", label: "Natural Maths Mandelbrot Diagnostics" },
            // { to: "/preprint/prime-curvature", label: "Prime Curvature Hamiltonian" },
            // { to: "/foundations/natural-maths-axioms", label: "Natural Maths - Core Axioms" },
            // { to: "/analysis/mandelbrot-real-analogue", label: "Natural Maths - Mandelbrot Set" }
        ]
    },
    {
        title: "Experiments & Toys",
        items: [
            { to: "/analysis/natural-mathematics-bell-toy", label: "Progress-State Bell Toy in Natural Mathematics" },
        ]
    },
]

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="shortcut icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <meta name="apple-mobile-web-app-title" content="On Gravity" />
                <link rel="manifest" href="/site.webmanifest" />
                <Meta />
                <Links />
            </head>
            <body>
                <Menu {...{ navigation }} />
                <main>
                    {children}
                </main>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    )
}

export default function App() {
    return <Outlet />
}

export function ErrorBoundary({ error }: { error: unknown }) {
    let message = "Oops"
    let details = "Something went wrong"

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "Not found" : "Error"
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details
    } else if (import.meta.env.DEV && error instanceof Error) {
        details = error.message
    }

    return (
        <main>
            <h1>{message}</h1>
            <p>{details}</p>
        </main>
    )
}