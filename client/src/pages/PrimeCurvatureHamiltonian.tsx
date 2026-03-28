import Article from '../components/Article'
import { H2 } from '../components/Typography'

const AnalysisSparc = () => {
    return (
        <Article
            title={"A Prime Curvature Hamiltonian on the Logarithmic Axis with 0.657% Agreement to the Riemann Spectrum"}
            author={"Jack Pickett"}
            dateTime={"13th December 2025"}
            url={"https://doi.org/10.55277/researchhub.m2rtsaxa.1"}
        >


            <H2>References</H2>
            {/* <Ol classNames="text-sm lg:text-base mb-8">
                {references.sparcAnalysis.map((ref, i) => (
                    <Li key={i} className="list-decimal mb-4 min-w-0">
                        <div className="w-full min-w-0">
                            <p className="font-semibold">{ref.title}</p>
                            <p>
                                {ref.authors} ({ref.year})
                            </p>
                            <Link
                                to={ref.url}
                                target="_blank"
                                className="block w-full break-all underline text-xs lg:text-md"
                            >
                                {ref.url}
                            </Link>
                        </div>
                    </Li>
                ))}
            </Ol> */}


            <H2>Code and Reproducibility</H2>
            {/* <P>
                The analysis pipeline used in this study is implemented in Python and processes the SPARC mass-model
                files directly. All code used to generate the figures and statistical results presented in this work
                is available as open-source software:
            </P>
            <P classNames="text-center mb-4">
                <Link
                    to="https://github.com/hasjack/OnGravity/tree/feature/rotation-curve-analysis/python/rotation-curves"
                    target="_blank"
                    className="block w-full break-all underline text-sm lg:text-md"
                >github.com/hasjack/OnGravity/tree/feature/rotation-curve-analysis/python/rotation-curves
                </Link>
            </P>
            <P>
                This repository includes the full analysis pipeline, data ingestion routines, model fitting procedures,
                and scripts used to generate the figures presented in this paper.
            </P> */}
        </Article>
    )
}

export default AnalysisSparc