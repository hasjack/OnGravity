import { createBrowserRouter } from "react-router-dom"
import AnalysisSolarSystem from "./pages/AnalysisSolarSystem"
import AnalysisSparc from "./pages/AnalysisSparc"
import Layout from "./components/Layout"
import Homepage from "./pages/Homepage"
// import Journal from "./pages/Journal"
import NotFound from "./pages/NotFound"
// import ElectroMagneticCoupling from "./pages/ElectroMagneticCoupling"
// import NonTrivialMarsBars from "./pages/NonTrivialMarsBars"
import PaperV4 from './pages/PaperV4'
// import PrimeDistribution from "./pages/PrimeDistribution"
// import Theory from './pages/Theory'
// import ToyGalaxy from "./pages/ToyGalaxy"

const routes = [
    { 
        path: "/",
        element: <Layout />,
        errorElement: <Layout />,
        children: [
            { index: true, element: <Homepage /> },
            { path: "*", element: <NotFound /> }
        ]
    },
    // {
    //     path: "/journal",
    //     element: <Layout />,
    //     errorElement: <Layout />,
    //     children: [
    //         { index: true, element: <Journal /> },
    //     ]
    // },
    {
        path: "/a-curvature-response-model-for-weak-field-gravity",
        element: <Layout />,
        errorElement: <Layout />,
        children: [
            { index: true, element: <PaperV4 /> },
        ]
    },
    {
        path: "/analysis",
        element: <Layout />,
        errorElement: <Layout />,
        children: [
            // { index: true, element: <Theory /> },
            { path: "/analysis/sparc-galaxy-rotation-curves", element: <AnalysisSparc /> },
            { path: "/analysis/solar-system", element: <AnalysisSolarSystem /> }
        ]
    },
    // {
    //     path: "/non-trivial-mars-bars",
    //     element: <Layout />,
    //     errorElement: <Layout />,
    //     children: [
    //         { index: true, element: <NonTrivialMarsBars /> },
    //     ]
    // },
    // {
    //     path: "/prime-distribution",
    //     element: <Layout />,
    //     errorElement: <Layout />,
    //     children: [
    //         { index: true, element: <PrimeDistribution /> },
    //     ]
    // },
    // {
    //     path: "/electromagnetic-coupling",
    //     element: <Layout />,
    //     errorElement: <Layout />,
    //     children: [
    //         { index: true, element: <ElectroMagneticCoupling /> },
    //     ]
    // },
    // {
    //     path: "/toy-galaxy-simulator",
    //     element: <Layout />,
    //     errorElement: <Layout />,
    //     children: [
    //         { index: true, element: <ToyGalaxy /> },
    //     ]
    // }
]

const router = createBrowserRouter(routes, { basename: '/' })

export default router