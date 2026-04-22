import { Link } from 'react-router'
import { BlockMath, InlineMath } from '../components/Katex'
import Article from '../components/Article'
import FurtherReading from '~/components/FurtherReading'
import License from '~/components/License'
import { H2, H3, P, Ul, Ol, Li } from '../components/Typography'
import { references } from '../lib/references'
import { Route } from './+types/AnalysisSparc'

const { VITE_APP_CDN_URL } = import.meta.env
const CDN = VITE_APP_CDN_URL || 'https://cdn.halfasecond.com/images/onGravity/'

export function loader({ request }: Route.LoaderArgs) {
    return {
        shareUrl: request.url,
    }
}

export function meta() {
    return [
        { title: "Analysis - SPARC rotation curves" },
        {
            name: "description",
            content: "The κ-Framework naturally reproduces the Radial Acceleration Relation observed in SPARC galaxies. Including velocity shear tightens the residuals dramatically.",
        },
    ]
}

export default function AnalysisSparc({ loaderData }: Route.ComponentProps) {
    return (
        <Article
            title={"An Environmental Curvature Response for Galaxy Rotation Curves: Empirical Tests of the κ-Framework using the SPARC Dataset"}
            author={"Jack Pickett"}
            dateTime={"9th March 2026"}
            url={"https://doi.org/10.55277/researchhub.53yst6oa.1"}
            shareUrl={loaderData.shareUrl.replace("http://", "https://")}
        >
            <H2>Abstract</H2>
            <P classNames="mb-0">
                Galaxy rotation curves systematically deviate from the predictions of Newtonian gravity when only baryonic mass
                components are considered. The conventional interpretation introduces dark matter halos to reconcile these discrepancies.
                In this work an alternative empirical description is explored in which the Newtonian velocity field is modified by a
                multiplicative environmental response term characterised by a curvature parameter κ. The framework expresses the observed
                velocity profile as
            </P>

            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`v_{\mathrm{obs}}(r) = v_{N}(r)\exp\left(\frac{\kappa(r)\, r}{2}\right)`} />
            </div>

            <P>
                Using the SPARC galaxy rotation curve dataset, empirical κ profiles are computed directly from observed and
                baryonic Newtonian velocities. Investigation then looks at whether κ can be described by simple environmental
                functions of baryonic dynamical quantities. Across 165 galaxies a linear relation
                between <InlineMath math="κr / 2" /> and <InlineMath math={String.raw`\log_{10}(g_{\text{bar}})`} />,
                where <InlineMath math={String.raw`g_{\text{bar}}`} /> is the baryonic acceleration found that systematically
                improves rotation-curve fits relative to baryons-only Newtonian predictions. A second model including baryonic
                shear provides a small additional improvement. Repeated train/test splits demonstrate that these relations
                generalise across the SPARC sample. The results suggest that a simple environmental curvature response may
                capture much of the phenomenology traditionally attributed to dark matter halos, and provide a new empirical
                framework for describing galaxy rotation curves.
            </P>

            <P classNames="mb-8">
                Empirical κ profiles are extracted directly from observed rotation curves and stacked across the SPARC galaxy
                sample to explore environmental correlations. A simple predictive model relating κ to baryonic acceleration
                is then fitted and tested using repeated random train-test splits of the galaxy sample. The
                resulting <InlineMath math={String.raw`\kappa(g_{\text{bar}})`} /> model systematically improves rotation-curve
                fits relative to baryons-only Newtonian predictions for <b>approximately 85-90% of galaxies in the SPARC
                    dataset</b>. These results suggest that galaxy rotation-curve discrepancies may be closely linked to baryonic
                dynamical properties through an environmental curvature response encoded in κ.
            </P>

            <H2>Introduction</H2>
            <P>
                The discrepancy between observed galaxy rotation curves and the predictions of Newtonian gravity based solely
                on baryonic mass has been a central problem in astrophysics for several decades. Observed rotation velocities
                remain approximately flat at large radii, whereas Newtonian predictions derived from luminous matter generally
                decline with distance from the galactic center. The prevailing interpretation attributes this discrepancy to
                extended dark matter halos surrounding galaxies.
            </P>
            <P>
                Alternative approaches have attempted to modify the effective gravitational response in low-acceleration
                regimes. One prominent example is Modified Newtonian Dynamics (MOND), which introduces a characteristic
                acceleration scale at which the gravitational law transitions away from the Newtonian form.
            </P>
            <P>
                This paper explores a different empirical approach. Rather than modifying the gravitational law directly,
                it is considered whether the observed velocity field can be represented as a Newtonian baryonic velocity
                multiplied by an environmental correction term. This correction is parameterised through a curvature-response
                variable κ that may depend on local dynamical properties of the baryonic system.
            </P>
            <P classNames="mb-0">
                The κ-framework expresses the observed velocity profile as
            </P>

            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`v_{\mathrm{obs}}(r) = v_{N}(r)\exp\left(\frac{\kappa(r)\, r}{2}\right)`} />
            </div>

            <P>
                where <InlineMath math={String.raw`v_N`} /> is the Newtonian circular velocity generated by baryonic mass
                components. The quantity κ(r) represents an environmental curvature response that modifies the effective
                velocity field.
            </P>
            <P classNames="mb-8">
                The primary goal of this study is empirical: to determine whether  can be described by simple environmental
                functions that systematically account for rotation-curve discrepancies across the SPARC galaxy sample.
            </P>

            <H2>Data</H2>
            <P>
                The analysis uses the SPARC (Spitzer Photometry and Accurate Rotation Curves) database, which provides
                high-quality rotation curves and baryonic mass models for nearby galaxies.
            </P>
            <P>
                Each galaxy entry includes
            </P>

            <Ul>
                <Li>observed rotation velocities</Li>
                <Li>uncertainties on observed velocities</Li>
                <Li>baryonic mass model components derived from photometry</Li>
            </Ul>

            <P>
                The baryonic mass model typically includes gas, stellar disk, and bulge contributions. The SPARC mass-model
                files contain columns such as
            </P>

            <code>Rad Vobs errV Vgas Vdisk Vbul</code>

            <P>
                Some files additionally provide a precomputed baryonic velocity <InlineMath math={String.raw`v_{\text{bar}}`} />.
            </P>

            <P>
                The SPARC dataset currently contains more than 170 galaxies spanning a wide range of masses, morphologies,
                and dynamical environments.
            </P>

            <H3>Baryonic Newtonian Rotation Curves</H3>
            <P classNames="mb-0">The baryons-only circular velocity profile is constructed from the SPARC mass model components as</P>

            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    v_N = \sqrt{ V_{\text{gas}}^2 + \left(\sqrt{\Upsilon_d}\,V_{\text{disk}}\right)^2 + \left(\sqrt{\Upsilon_b}\,V_{\text{bul}}\right)^2 }
                `} />
            </div>

            <P>
                where <InlineMath math={String.raw`Y_d`} /> and <InlineMath math={String.raw`Υ_b`} /> are the stellar
                mass-to-light ratios for the disk and bulge components. Common SPARC analyses yields:
            </P>

            <Ul>
                <Li><InlineMath math={String.raw`Y_d`} /> = 0.5</Li>
                <Li><InlineMath math={String.raw`Υ_b`} /> = 0.7</Li>
            </Ul>

            <P>
                If the SPARC data file provides <InlineMath math={String.raw`v_{\text{bar}}`} /> directly, that value is used
                as the baryonic Newtonian velocity.
            </P>


            {/* Figures 1 & 2 */}
            <div className="flex flex-wrap gap-y-4 md:gap-x-[4%] w-[90%] mb-4">
                <img
                    src={CDN + "galaxy-rotation-curves/output/galaxies/UGCA444_rotmod_rotation.png"}
                    className="w-full md:w-[48%]"
                />
                <img
                    src={CDN + "galaxy-rotation-curves/output/galaxies/NGC5985_rotmod_rotation.png"}
                    className="w-full md:w-[48%]"
                />
            </div>
            {/* Figures 3 & 4 */}
            <div className="flex flex-wrap gap-y-4 md:gap-x-[4%] w-[90%] mb-4">
                <img
                    src={CDN + "galaxy-rotation-curves/output/galaxies/F563-1_rotmod_rotation.png"}
                    className="w-full md:w-[48%]"
                />
                <img
                    src={CDN + "galaxy-rotation-curves/output/galaxies/CamB_rotmod_rotation.png"}
                    className="w-full md:w-[48%]"
                />
            </div>

            <P classNames="mb-8 text-sm">
                <b>Figures 1-4:</b> show representative rotation curves from the SPARC sample, including the baryonic Newtonian
                prediction, the observed velocities, and the κ-framework reconstruction.
            </P>

            <H3>Empirical κ Profiles</H3>
            <P classNames="mb-0">
                Given observed velocities <InlineMath math={String.raw`v_{\text{obs}}`} /> and baryonic Newtonian
                velocities <InlineMath math={String.raw`v_N`} />, the κ-framework relation
            </P>

            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`v_{\mathrm{obs}} = v_{N}\exp\left(\frac{\kappa\, r}{2}\right)`} />
            </div>

            <P classNames="mb-0">
                can be inverted to obtain an empirical estimate of <InlineMath math={String.raw`\kappa`} />:
            </P>

            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    \kappa(r) = \frac{2}{r}\ln!\left(\frac{v_{\text{obs}}}{v_N}\right)    
                `} />
            </div>

            <P classNames="mb-0">For practical analysis the dimensionless quantity</P>

            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    \frac{\kappa\, r}{2} = \ln!\left(\frac{v_{\text{obs}}}{v_N}\right)
                `} />
            </div>

            <P>
                is used, which directly represents the logarithmic discrepancy between observed and baryonic Newtonian velocities.
                This quantity can be computed for every radius in each galaxy rotation curve.
            </P>

            <H3>Environmental Quantities</H3>
            <P classNames="mb-0">
                To explore possible dependencies of <InlineMath math={String.raw`\kappa`} />, two baryonic dynamical quantities
                are considered. Baryonic acceleration is defined as
            </P>

            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    g_{\text{bar}} = \frac{v_N^2}{r}    
                `} />
            </div>

            <P classNames="mb-0">
                This quantity has been widely studied in rotation-curve phenomenology and appears prominently in the radial
                acceleration relation. Baryonic shear is estimated as the radial velocity gradient
            </P>

            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    \frac{dv}{dr}
                `} />
            </div>

            <P>computed from the baryonic velocity profile using a smoothed numerical derivative.</P>

            <H3>Empirical Stacking</H3>
            <P classNames="mb-0">
                Empirical <InlineMath math={String.raw`\kappa`} /> values are computed for each radius in each SPARC galaxy.
                These measurements are then stacked across the full galaxy sample to explore possible correlations between
            </P>

            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    \frac{\kappa\, r}{2}
                `} />
            </div>

            <P>and several physical variables:</P>
            <Ul>
                <Li>radius</Li>
                <Li>normalised radius <InlineMath math={String.raw`r / r_{\text{last}}`} /></Li>
                <Li>baryonic acceleration <InlineMath math={String.raw`g_{\text{bar}}`} /></Li>
                <Li>baryonic shear <InlineMath math={String.raw`dv/dr`} /></Li>
            </Ul>
            <P>Scatter plots of these relations allow visual identification of potential environmental dependencies.</P>

            {/* Figure 5 */}
            <img src={CDN + 'galaxy-rotation-curves/output/plots/kappa_stack.png'} className="w-auto mb-2 lg:max-w-3xl lg:max-w-3xl" />

            <P classNames="mb-8 text-sm">
                <b>Figure 5:</b> Empirical κ structure across the SPARC sample. Each point represents a measurement of κr/2
                at a radius within a galaxy.
            </P>

            <H3>Predictive κ Models</H3>

            <P classNames="mb-0">
                Based on the observed correlations, simple predictive parameterisations
                of <InlineMath math={String.raw`\kappa`} /> are tested. The first model
                assumes <InlineMath math={String.raw`\kappa`} /> depends only on baryonic acceleration:
            </P>

            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    \frac{\kappa r}{2} = a + b \log_{10}\!\left(g_{\text{bar}}\right)
                `} />
            </div>

            <P classNames="mb-0">The second model additionally includes baryonic shear:</P>

            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    \frac{\kappa r}{2} = a + b \log_{10}\!\left(g_{\text{bar}}\right) + c \log_{10}\!\left(\left|\frac{dv}{dr}\right|\right)
                `} />
            </div>

            <P>These models are fitted using least-squares regression on the training galaxy set.</P>
            <P classNames="mb-0">Predicted velocities are then computed as</P>
            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    v_{\mathrm{pred}} = v_{N}\exp\left(\frac{\kappa r}{2}\right)
                `} />
            </div>


            {/* Figure 6 */}
            <img src={CDN + 'galaxy-rotation-curves/output/plots/kappa_vs_gbar.png'} className="w-auto mb-2 lg:max-w-3xl" />
            <P classNames="mb-8 text-sm">
                <b>Figure 6:</b> reveals a clear correlation between κr/2 and baryonic acceleration across the stacked SPARC sample.
            </P>

            <H3>Model Evaluation</H3>

            <P classNames="mb-0">
                Model performance is evaluated using the reduced <InlineMath math={String.raw`\chi^2`} /> statistic:
            </P>
            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    \chi^2_{\text{red}} = \frac{1}{N} \sum \left(\frac{v_{\text{model}} - v_{\text{obs}}}{\sigma_v}\right)^2
                `} />
            </div>

            <P>Three models are compared:</P>
            <Ul>
                <Li>baryons-only Newtonian prediction</Li>
                <Li><InlineMath math={String.raw`\kappa(g_{\text{bar}})`} /> model</Li>
                <Li><InlineMath math={String.raw`\kappa(g_{\text{bar}},\text{shear})`} /> model</Li>
            </Ul>
            <P>
                To test robustness, the galaxy sample is repeatedly split into random training and test sets. Model
                parameters are fitted using the training galaxies and evaluated on the test galaxies.
            </P>
            <P>
                Across repeated train/test splits the <InlineMath math={String.raw`\kappa(g_{\text{bar}})`} /> model improves the
                reduced <InlineMath math={String.raw`\chi^2`} /> relative to baryons-only predictions for <b>~90% of galaxies.</b>
            </P>

            {/* Figure 7 */}
            <img src={CDN + 'galaxy-rotation-curves/output/plots/kappa_vs_gbar_fit.png'} className="w-auto mb-2 lg:max-w-3xl" />
            <P classNames="mb-8 text-sm">
                <b>Figure 7:</b> Linear regression fit describing the empirical relation between κr/2 and baryonic acceleration.
            </P>

            <P>
                Across the SPARC sample the <InlineMath math={String.raw`\kappa(g_{\text{bar}})`} /> model improves the
                reduced <InlineMath math={String.raw`\chi^2`} /> relative to baryons-only predictions for a large fraction
                of galaxies. The inclusion of shear produces a modest additional improvement.
            </P>

            <H3>Relation to the Radial Acceleration Relation</H3>
            <P classNames="mb-0">
                The κ-framework predictions are also compared to the radial acceleration relation (RAR), which relates
                observed acceleration
            </P>
            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    g_{\text{obs}} = \frac{v_{\text{obs}}^2}{r}
                `} />
            </div>
            <P>
                to baryonic acceleration <InlineMath math={String.raw`g_{\text{bar}}`} />.
            </P>
            <P>
                Residual diagnostics show that the κ-based predictions closely track the observed RAR trend, suggesting
                that the environmental curvature response encoded in <InlineMath math={String.raw`\kappa`} /> may capture
                much of the phenomenology described by the RAR.
            </P>

            {/* Figures 8 */}
            <img src={CDN + 'galaxy-rotation-curves/output/plots/rar/rar_model_overlay.png'} className="w-auto mb-2 lg:max-w-3xl" />
            {/* Figures 9 & 10 */}
            <div className="flex flex-wrap gap-y-4 md:gap-x-[4%] w-[90%] mb-4">
                <img
                    src={CDN + "plots/robustness/multi_split_fraction_improved.png"}
                    className="w-full md:w-[48%]"
                />
                <img
                    src={CDN + "plots/robustness/multi_split_median_chi2.png"}
                    className="w-full md:w-[48%]"
                />
            </div>

            <P classNames="mb-8 text-sm">
                <b>Figures 8-10:</b> Comparison between κ-framework predictions and the observed radial acceleration relation.
            </P>


            {/* Figures 11 */}
            <img src={CDN + 'galaxy-rotation-curves/output/plots/rar/rar_residual_vs_gbar.png'} className="w-auto mb-2 lg:max-w-3xl" />
            <P classNames="mb-8 text-sm">
                <b>Figure 11:</b> The vertical axis shows the difference between predicted and observed accelerations
                , <InlineMath math={String.raw`\Delta \log_{10} g_{\text{obs}} = \log_{10}(g_{\text{pred}}) - \log_{10}(g_{\text{obs}})`} /> plotted
                as a function of baryonic acceleration <InlineMath math={String.raw`\log_{10}(g_{\text{bar}})`} />. Points
                represent measurements across the stacked SPARC galaxy sample. The dashed horizontal line indicates zero
                residual. Both
                the <InlineMath math={String.raw`\kappa(g_{\text{bar}})`} /> and <InlineMath math={String.raw`\kappa(g_{\text{bar}},\text{shear})`} /> models
                track the observed RAR with relatively small systematic deviations, with the shear-augmented model reducing
                residual structure in parts of the low-acceleration regime.
            </P>
            {/* Figures 12 */}
            <img src={CDN + 'galaxy-rotation-curves/output/plots/rar/rar_residual_hist.png'} className="w-auto mb-2 lg:max-w-3xl" />
            <P classNames="mb-8 text-sm">
                <b>Figure 12:</b> Residuals are concentrated near zero, indicating that the κ-based predictions
                reproduce the observed radial acceleration relation with relatively small scatter. The
                inclusion of baryonic shear slightly narrows the residual distribution.
            </P>

            <H2>Discussion</H2>
            <P classNames="mb-0">
                The results presented here demonstrate that a simple environmental parameterisation of the form
            </P>
            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    \frac{\kappa r}{2} = a + b \log_{10}\!\left(g_{\text{bar}}\right)
                `} />
            </div>
            <P classNames="mb-0">
                captures a substantial fraction of the discrepancy between baryonic Newtonian predictions and observed
                galaxy rotation curves across the SPARC sample. Because the κ-framework writes the observed velocity field as
            </P>
            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    v = v_N e^{\frac{\kappa r}{2}}
                `} />
            </div>
            <P classNames="mb-0">
                the quantity  can be interpreted as the logarithmic amplification of the baryonic Newtonian velocity
                field. The empirical relation therefore implies that this amplification scales systematically with
                baryonic acceleration. This scaling can be rewritten in a form that clarifies its geometric meaning.
                Converting the base-10 logarithm to a natural logarithm gives
            </P>
            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    \ln!\left(\frac{v}{v_N}\right) a + \beta \ln(g_{\text{bar}})
                `} />
            </div>
            <P classNames="mb-0">with</P>
            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    \beta = \frac{b}{\ln 10}.
                `} />
            </div>
            <P classNames="mb-0">Exponentiating yields</P>
            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    \frac{v}{v_N} = e^{a} g_{\text{bar}}^{\beta}.
                `} />
            </div>
            <P classNames="mb-0">Substituting</P>
            <div className="text-md md:text-xl xl:text-2xl">
                <BlockMath math={String.raw`
                    g_{\text{bar}} = \frac{v_N^2}{r}
                `} />
            </div>

            <P>
                shows that the observed velocity behaves approximately as a fractional power of the baryonic
                velocity field with a weak radial dependence. In this sense the κ-framework can be viewed as
                an effective renormalisation of the Newtonian velocity field driven by the local baryonic
                dynamical environment.
            </P>
            <P classNames="mb-8">
                It is important to emphasize that the κ-framework presented here is empirical. The present analysis
                does not derive  from a fundamental gravitational theory but instead examines whether a simple
                environmental response can describe the observed phenomenology.
            </P>

            <H2>Limitations and Future Work</H2>
            <P>Several limitations remain.</P>
            <P>
                The current models use simple linear parameterisations and do not include full uncertainty propagation
                for fitted parameters. Morphological differences between galaxies are not explicitly modelled, and
                additional environmental variables may be relevant.
            </P>
            <P classNames="mb-8">
                Future work may explore more general functional forms for <InlineMath math={String.raw`\kappa`} />,
                additional dynamical predictors, and potential theoretical interpretations of the curvature response.
            </P>

            <H2>Conclusion</H2>
            <P>
                Using the SPARC galaxy rotation curve dataset,
                empirical <InlineMath math={String.raw`\kappa`} /> profiles derived from observed rotation curves
                exhibit systematic correlations with baryonic dynamical quantities. A simple relation
                between <InlineMath math={String.raw`\kappa`} />  and baryonic acceleration provides a predictive
                model that improves rotation-curve fits across a large fraction of galaxies.
            </P>
            <P>
                These results suggest that galaxy rotation curves may be describable through an environmental curvature
                response encoded in <InlineMath math={String.raw`\kappa`} /> . Whether this reflects an effective
                phenomenological description or points toward a deeper gravitational mechanism remains an open question.
            </P>
            <P classNames="mb-8">
                Further observational and theoretical work will be required to determine the physical interpretation
                of the κ-framework and its relationship to existing models of galaxy dynamics.
            </P>


            <H2>References</H2>
            <Ol classNames="text-sm lg:text-base mb-8">
                {references.sparcAnalysis.map((ref, i) => (
                    <Li key={i} classNames="list-decimal mb-4 min-w-0">
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
            </Ol>

            <H2>Further Reading</H2>
            <div className="mb-12 mt-2 mx-2">
                <FurtherReading items={[
                    {
                        itemType: "Analysis (pre-print)",
                        label:
                            "Environmental Curvature Response in Planetary Dynamics: Solar System Diagnostics of the κ-Framework",
                        to: "/analysis/solar-system",
                        date: "12th March 2026",
                        image: `${CDN}solar-system/outputs/Mercury/lrl_perihelion_direction_comparison.png`,
                    },
                    {
                        itemType: "Theory (pre-print)",
                        label: "A Curvature Response Model for Weak-Field Gravity",
                        to: "/preprint/a-curvature-response-model-for-weak-field-gravity",
                        date: "28th March 2026",
                        image: `${CDN}k-framework.jpg`,
                    },
                    {
                        itemType: "Simulation",
                        label: "Toy Galaxy - k-Framework comparison with Newtonian physics",
                        to: "/toy-galaxy",
                        date: "12th November 2025",
                        image: `${CDN}toy-galaxy-16-10.jpg`,
                    }]} />
            </div>


            <H2>Code and Reproducibility</H2>
            <P>
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
            <P classNames="mb-24">
                This repository includes the full analysis pipeline, data ingestion routines, model fitting procedures,
                and scripts used to generate the figures presented in this paper.
            </P>
            <License />
        </Article>
    )
}