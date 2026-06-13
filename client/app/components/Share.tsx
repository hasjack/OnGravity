import { BlueskyShareButton, BlueskyIcon } from "react-share";
import { XShareButton, XIcon } from "react-share";
import { FacebookShareButton, FacebookIcon } from "react-share";
import { EmailShareButton, EmailIcon } from "react-share";
import { LinkedinShareButton, LinkedinIcon } from "react-share";
import { RedditShareButton, RedditIcon } from "react-share";

const iconSize = 22

const Share = ({ shareUrl, title }: { shareUrl: string, title: string }) => {
    return (
        <>

            <XShareButton
                title={title}
                htmlTitle="Share on X"
                url={shareUrl}
                aria-label="Share on X"
            >
                <XIcon size={iconSize} round />
            </XShareButton>

            <FacebookShareButton url={shareUrl} aria-label="Share this page on Facebook">
                <FacebookIcon size={iconSize} round />
            </FacebookShareButton>

            <BlueskyShareButton title={title} url={shareUrl} aria-label="Share on Bluesky">
                <BlueskyIcon size={iconSize} round />
            </BlueskyShareButton>



            <EmailShareButton
                subject={title}
                body="Thought you might like this:"
                url={shareUrl}
                aria-label="Share by email"
            >
                <EmailIcon size={iconSize} round />
            </EmailShareButton>

            <LinkedinShareButton
                title={title}
                summary="The κ-framework proposes that spacetime curvature responds not only to mass but also to properties of the surrounding dynamical environment. In previous work, titled “An Environmental Curvature Response for Galaxy Rotation Curves: Empirical Tests of the κ-Framework using the SPARC Dataset,” the framework was evaluated against the SPARC rotation-curve database and shown to reproduce observed galaxy rotation profiles without invoking non-baryonic dark matter."
                source="half-a-second.com"
                url={shareUrl}
                aria-label="Share on LinkedIn"
            >
                <LinkedinIcon size={iconSize} round />
            </LinkedinShareButton>

            <RedditShareButton title={title} url={shareUrl} aria-label="Share on Reddit">
                <RedditIcon size={iconSize} round />
            </RedditShareButton>

        </>
    )
}

export default Share
