import { Link } from 'react-router'
const { VITE_APP_CDN_URL } = import.meta.env
const CDN = VITE_APP_CDN_URL || 'https://cdn.halfasecond.com/images/onGravity/'
const RH_LINK = "https://www.researchhub.com/proposal/29607/empirical-test-of-local-density-curvature-response-using-grace-fo-laser-ranging-data"

export default function License({ colorScheme="dark" }) {
    return (
        <>
            <img src={`${CDN}rh-logo${colorScheme === "dark" ? '2' : ''}.png`} className="h-8 md:h-12 mb-4 md:mb-6" />
            <p className="max-w-3xl text-xs md:text-sm text-center px-4 mb-8">
                Please consider <Link to={RH_LINK} target="_blank" className="underline">funding this research</Link> on Research Hub
            </p>
            <img src={`${CDN}cc-long.webp`} className="h-12 md:h-18 mb-2" />
            <p className="max-w-5xl text-xs md:text-sm px-4 mb-12 text-center">
                Content on this site is licensed under
                a <Link to="https://creativecommons.org/licenses/by/4.0/deed.en" target="_blank" className="underline">Creative Commons 
                Attribution 4.0 International License</Link>
            </p>
            
        </>
    )
}