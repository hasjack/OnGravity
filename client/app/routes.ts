import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/about", "routes/about.tsx"),

    route("/analysis/sparc-galaxy-rotation-curves", "routes/AnalysisSparc.tsx"),
    route("/analysis/solar-system", "routes/AnalysisSolarSystem.tsx"),
    route("/preprint/a-curvature-response-model-for-weak-field-gravity", "routes/curvature-response-model.tsx"),

    route("/non-trivial-mars-bars", "routes/NonTrivialMarsBars.tsx"),
    route("/notes/quantum-gravity-phase-resolution", "routes/QuantumGravity.tsx"),
    route("/notes/natural-mathematics-bell-toy", "routes/AnalysisBellToy.tsx"),
    route("/notes/regime-gate", "routes/regime-gate.tsx"),
    route("/notes/evaluation-protocol-for-progress-state-regime", "routes/regime-gate-candles.tsx"),

    route("/notes/switching-quadratic-atlas-diagnostics", "routes/SwitchingQuadraticAtlas.tsx"),
    route("/toy-galaxy", "routes/GalaxyToy.tsx"),
    route("/gate", "routes/UpdateGate.tsx"),
    route("/rh", "routes/riemann.tsx")
] satisfies RouteConfig;
