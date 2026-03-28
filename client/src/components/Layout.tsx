import { Outlet } from "react-router-dom"
import Menu from "./Menu"
import ScrollToTop from "./ScrollToTop"

const Layout = () => {
    return (
        <div>
            <ScrollToTop />
            <Menu />
            <main>
                <Outlet />
            </main>
        </div>
    )
}

export default Layout