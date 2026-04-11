import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),

    route("/analysis/sparc-galaxy-rotation-curves", "routes/AnalysisSparc.tsx"),
    route("/analysis/solar-system", "routes/AnalysisSolarSystem.tsx"),
    route("/preprint/a-curvature-response-model-for-weak-field-gravity", "routes/curvature-response-model.tsx"),

    route("/non-trivial-mars-bars", "routes/NonTrivialMarsBars.tsx"),
    route("/preprint/quantum-gravity-phase-resolution", "routes/QuantumGravity.tsx"),
] satisfies RouteConfig;
