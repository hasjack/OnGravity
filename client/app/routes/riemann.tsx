import { Route } from './+types/riemann'
import Article from '~/components/Article';
import { H2, P } from '~/components/Typography'
import { pageMeta } from '~/lib/seo'

export function loader({ request }: Route.LoaderArgs) {
    return {
        shareUrl: request.url,
    }
}

export function meta({ location }: Route.MetaArgs) {
    return pageMeta({
        title: "Kicking the Nest | On Gravity",
        description: "A draft Natural Mathematics note on the Riemann hypothesis.",
        pathname: location.pathname,
        type: "article",
        noIndex: true,
    })
}


export default function RHTutorial({ loaderData }: Route.ComponentProps) {
    return (
        <Article
            title={"Kicking the Nest: Examination of the Riemann Hypothesis in Natural Maths"}
            author={"Jack Pickett"}
            dateTime={"22nd April 2026"}
            url={""}
            shareUrl={loaderData.shareUrl.replace("http://", "https://")}
        >
            <H2>Overview</H2>
            <P>...</P>
        </Article>
    );
}
