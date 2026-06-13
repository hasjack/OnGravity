const { VITE_APP_CDN_URL, VITE_APP_CDN } = import.meta.env

export const CDN = VITE_APP_CDN_URL || VITE_APP_CDN || "https://cdn.halfasecond.com/images/onGravity/"

export type ArticleItem = {
    itemType: string
    label: string
    to: string
    date: string
    image: string
    summary: string
}

export const articles: ArticleItem[] = [
    {
        itemType: "Note",
        label: "Methods and Evaluation Protocol for the Progress-State Regime Gate",
        to: "/notes/evaluation-protocol-for-progress-state-regime",
        date: "21st April 2026",
        image: `${CDN}bell-toy-candles-16-10.jpg`,
        summary: "A walk-forward evaluation protocol for testing the progress-state gate against market regimes.",
    },
    {
        itemType: "Note",
        label: "Switching Quadratic Atlas Diagnostics",
        to: "/notes/switching-quadratic-atlas-diagnostics",
        date: "15th April 2026",
        image: `${CDN}quadratic-atlas-16-10.jpg`,
        summary: "Diagnostics for orientation, parity, and switching behaviour in quadratic atlas dynamics.",
    },
    {
        itemType: "Note",
        label: "Progress-State Bell Toy in Natural Mathematics",
        to: "/notes/natural-mathematics-bell-toy",
        date: "12th April 2026",
        image: `${CDN}bell-toy-16-10.jpg`,
        summary: "A toy model exploring progress-state behaviour and boundary structure in natural mathematics.",
    },
    {
        itemType: "Theory (pre-print)",
        label: "A Curvature Response Model for Weak-Field Gravity",
        to: "/preprint/a-curvature-response-model-for-weak-field-gravity",
        date: "28th March 2026",
        image: `${CDN}k-framework.jpg`,
        summary: "The core κ-framework paper proposing an environmental curvature response in weak-field gravity.",
    },
    {
        itemType: "Analysis (pre-print)",
        label: "Environmental Curvature Response in Planetary Dynamics",
        to: "/analysis/solar-system",
        date: "12th March 2026",
        image: `${CDN}solar-system-analysis.jpg`,
        summary: "Solar System diagnostics testing whether the framework remains compatible with precision orbital data.",
    },
    {
        itemType: "Analysis (pre-print)",
        label: "Empirical Tests of the κ-Framework using SPARC Dataset",
        to: "/analysis/sparc-galaxy-rotation-curves",
        date: "9th March 2026",
        image: `${CDN}galaxy-rotation-curves/output/plots/kappa_vs_gbar_fit.png`,
        summary: "Rotation-curve tests of the κ-framework against the SPARC galaxy dataset.",
    },
    {
        itemType: "Exploratory",
        label: "Non-trivial Mars bars",
        to: "/non-trivial-mars-bars",
        date: "Natural maths note",
        image: `${CDN}mars-bar.jpg`,
        summary: "A playful entry point into natural mathematics through exact division, zero, and structural boundaries.",
    },
    {
        itemType: "Note",
        label: "Resolution of the Penrose Quantum-Gravity Phase Catastrophe",
        to: "/notes/quantum-gravity-phase-resolution",
        date: "13th December 2025",
        image: `${CDN}k-framework.jpg`,
        summary: "A note connecting quantum-gravity phase structure to the Riemann spectrum.",
    },
    {
        itemType: "Simulation",
        label: "Toy Galaxy - κ-Framework comparison with Newtonian physics",
        to: "/toy-galaxy",
        date: "12th November 2025",
        image: `${CDN}toy-galaxy-16-10.jpg`,
        summary: "An interactive sandbox comparing stylised Newtonian and κ-boosted disc galaxy behaviour.",
    },
]

export const latestArticles = articles.slice(0, 6)
