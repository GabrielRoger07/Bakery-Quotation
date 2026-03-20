import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LangSwitcher from '../../components/LangSwitcher'
import './LandingPage.css'

const LandingPage = () => {
    const { t } = useTranslation()

    const benefits = [
        { title: t("landing_benefit_1_title"), text: t("landing_benefit_1_text") },
        { title: t("landing_benefit_2_title"), text: t("landing_benefit_2_text") },
        { title: t("landing_benefit_3_title"), text: t("landing_benefit_3_text") },
        { title: t("landing_benefit_4_title"), text: t("landing_benefit_4_text") },
        { title: t("landing_benefit_5_title"), text: t("landing_benefit_5_text") }
    ]

    const steps = [
        t("landing_step_1"),
        t("landing_step_2"),
        t("landing_step_3"),
        t("landing_step_4")
    ]

    return (
        <main className="landing">
            <header className="landing-topbar">
                <div className="landing-brand">
                    <span className="brand-badge">BQ</span>
                    <span>{t("landing_brand")}</span>
                </div>
                <nav className="landing-nav">
                    <a href="#problema">{t("landing_nav_problem")}</a>
                    <a href="#solucao">{t("landing_nav_solution")}</a>
                    <a href="#como-funciona">{t("landing_nav_how")}</a>
                    <a href="#social-proof">{t("landing_nav_results")}</a>
                </nav>
                <div className="landing-topbar-actions">
                    <LangSwitcher />
                    <Link to="/login" className="btn-link">{t("login")}</Link>
                    <Link to="/register" className="btn-solid">{t("landing_cta_primary")}</Link>
                </div>
            </header>

            <section className="hero">
                <div className="hero-copy">
                    <p className="hero-kicker">{t("landing_kicker")}</p>
                    <h1>{t("landing_hero_title")}</h1>
                    <p className="hero-subtitle">{t("landing_hero_subtitle")}</p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn-solid">{t("landing_cta_primary")}</Link>
                        <Link to="/login" className="btn-ghost">{t("landing_cta_secondary")}</Link>
                    </div>
                </div>

                <div className="hero-mockup" aria-hidden="true">
                    <div className="mockup-card mockup-main">
                        <h3>{t("landing_mockup_title")}</h3>
                        <div className="mockup-row">
                            <span>{t("landing_mockup_col_1")}</span>
                            <span>{t("landing_mockup_col_2")}</span>
                            <span>{t("landing_mockup_col_3")}</span>
                        </div>
                        <div className="mockup-row strong">
                            <span>Arroz Tipo 1</span>
                            <span>R$ 28,40</span>
                            <span>{t("landing_mockup_status_1")}</span>
                        </div>
                        <div className="mockup-row">
                            <span>Farinha 25kg</span>
                            <span>R$ 87,90</span>
                            <span>{t("landing_mockup_status_2")}</span>
                        </div>
                    </div>
                    <div className="mockup-card mockup-side">
                        <p>{t("landing_mockup_metric_label")}</p>
                        <strong>+38%</strong>
                        <span>{t("landing_mockup_metric_text")}</span>
                    </div>
                </div>
            </section>

            <section id="problema" className="landing-section section-problem">
                <h2>{t("landing_problem_title")}</h2>
                <p>{t("landing_problem_text")}</p>
            </section>

            <section id="solucao" className="landing-section section-solution">
                <h2>{t("landing_solution_title")}</h2>
                <p>{t("landing_solution_text")}</p>
            </section>

            <section className="landing-section benefits">
                <h2>{t("landing_benefits_title")}</h2>
                <div className="benefits-grid">
                    {benefits.map((benefit) => (
                        <article key={benefit.title} className="benefit-card">
                            <h3>{benefit.title}</h3>
                            <p>{benefit.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section id="como-funciona" className="landing-section how-it-works">
                <h2>{t("landing_how_title")}</h2>
                <ol>
                    {steps.map((step) => (
                        <li key={step}>{step}</li>
                    ))}
                </ol>
            </section>

            <section id="social-proof" className="landing-section social-proof">
                <h2>{t("landing_social_title")}</h2>
                <p>{t("landing_social_text")}</p>
                <div className="logo-strip" aria-label={t("landing_social_logos_aria")}>
                    <span>Empresa A</span>
                    <span>Grupo B</span>
                    <span>Indústria C</span>
                    <span>Rede D</span>
                </div>
            </section>

            <section className="landing-section final-cta">
                <h2>{t("landing_final_title")}</h2>
                <p>{t("landing_final_text")}</p>
                <div className="hero-actions">
                    <Link to="/register" className="btn-solid">{t("landing_cta_primary")}</Link>
                    <Link to="/login" className="btn-ghost">{t("landing_cta_secondary")}</Link>
                </div>
            </section>
        </main>
    )
}

export default LandingPage
