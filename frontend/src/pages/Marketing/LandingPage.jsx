import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'


const LandingPage = () => {
    const { t } = useTranslation()

    const benefits = [
        { title: t("landing_benefit_1_title"), text: t("landing_benefit_1_text") },
        { title: t("landing_benefit_2_title"), text: t("landing_benefit_2_text") },
        { title: t("landing_benefit_3_title"), text: t("landing_benefit_3_text") },
        { title: t("landing_benefit_4_title"), text: t("landing_benefit_4_text") },
        { title: t("landing_benefit_5_title"), text: t("landing_benefit_5_text") },
    ]

    const steps = [t("landing_step_1"), t("landing_step_2"), t("landing_step_3"), t("landing_step_4")]

    return (
        <main className="landing-bg min-h-screen py-5 px-[1.1rem] pb-12 text-[var(--color-text-primary)] max-sm:px-[0.7rem] max-sm:py-[0.8rem] max-sm:pb-10">

            {/* Topbar */}
            <header className="landing-topbar max-w-[1180px] mx-auto h-16 border border-[var(--color-border)] rounded-[var(--radius-xl)] [box-shadow:var(--shadow-xs)] flex items-center justify-between px-4 max-sm:h-auto max-sm:py-3 max-sm:gap-[0.6rem] max-sm:flex-wrap">
                <div className="inline-flex items-center gap-2 font-bold">
                    <span className="w-[1.9rem] h-[1.9rem] rounded-[0.55rem] grid place-items-center text-white bg-gradient-to-br from-[var(--color-accent-strong)] to-[var(--color-accent)] text-[0.875rem]">BQ</span>
                    <span>{t("landing_brand")}</span>
                </div>
                <nav className="flex items-center gap-4 max-[1024px]:hidden">
                    <a href="#problema" className="no-underline text-[var(--color-text-secondary)] text-[0.875rem] font-medium hover:text-[var(--color-text-strong)]">{t("landing_nav_problem")}</a>
                    <a href="#solucao" className="no-underline text-[var(--color-text-secondary)] text-[0.875rem] font-medium hover:text-[var(--color-text-strong)]">{t("landing_nav_solution")}</a>
                    <a href="#como-funciona" className="no-underline text-[var(--color-text-secondary)] text-[0.875rem] font-medium hover:text-[var(--color-text-strong)]">{t("landing_nav_how")}</a>
                    <a href="#social-proof" className="no-underline text-[var(--color-text-secondary)] text-[0.875rem] font-medium hover:text-[var(--color-text-strong)]">{t("landing_nav_results")}</a>
                </nav>
                <div className="inline-flex items-center gap-2 max-sm:w-full">
                    <Link to="/login" className="no-underline rounded-[var(--radius-md)] text-[0.875rem] font-semibold text-[var(--color-text-secondary)] px-[0.65rem] py-2 max-sm:flex-1 max-sm:text-center">{t("login")}</Link>
                    <Link to="/register" className="btn-landing-solid max-sm:flex-1 max-sm:text-center">{t("landing_cta_primary")}</Link>
                </div>
            </header>

            {/* Hero */}
            <section className="max-w-[1180px] mx-auto mt-[3.1rem] mb-8 grid grid-cols-[1.1fr_1fr] gap-8 items-center max-[1024px]:grid-cols-1 max-sm:mt-[1.8rem]">
                <div>
                    <p className="m-0 text-[var(--color-accent)] text-[0.875rem] font-bold tracking-[0.06em] uppercase">{t("landing_kicker")}</p>
                    <h1 className="mt-[0.7rem] mb-4 text-[clamp(2rem,4.3vw,3.2rem)] leading-[1.1] text-[var(--color-text-strong)]">{t("landing_hero_title")}</h1>
                    <p className="m-0 text-[var(--color-text-secondary)] text-base max-w-[50ch] max-[1024px]:max-w-none">{t("landing_hero_subtitle")}</p>
                    <div className="mt-[1.3rem] flex items-center flex-wrap gap-[0.65rem]">
                        <Link to="/register" className="btn-landing-solid">{t("landing_cta_primary")}</Link>
                        <Link to="/login" className="btn-landing-ghost">{t("landing_cta_secondary")}</Link>
                    </div>
                </div>

                <div className="relative min-h-[360px] max-sm:min-h-0" aria-hidden="true">
                    <div className="border border-[var(--color-border)] bg-white rounded-[var(--radius-xl)] [box-shadow:var(--shadow-md-soft)] p-4 w-[min(100%,470px)]">
                        <h3 className="m-0 mb-4 text-base">{t("landing_mockup_title")}</h3>
                        {[
                            { name: t("landing_mockup_col_1"), price: t("landing_mockup_col_2"), status: t("landing_mockup_col_3"), strong: false },
                            { name: "Arroz Tipo 1", price: "R$ 28,40", status: t("landing_mockup_status_1"), strong: true },
                            { name: "Farinha 25kg", price: "R$ 87,90", status: t("landing_mockup_status_2"), strong: false },
                        ].map((row, i) => (
                            <div key={i} className={`grid grid-cols-[1fr_auto_auto] gap-[0.7rem] px-2 py-[0.6rem] border-b border-[var(--color-border-lighter)] text-[0.875rem] ${row.strong ? 'bg-[var(--color-highlight-lighter)] rounded-[0.55rem]' : ''}`}>
                                <span>{row.name}</span><span>{row.price}</span><span>{row.status}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border border-[var(--color-border)] bg-white rounded-[var(--radius-xl)] [box-shadow:var(--shadow-md-soft)] p-4 w-[190px] absolute right-0 -bottom-5 max-[1024px]:static max-[1024px]:mt-3 max-sm:hidden">
                        <p className="m-0 text-[var(--color-text-muted)] text-[0.8125rem]">{t("landing_mockup_metric_label")}</p>
                        <strong className="block mt-[0.35rem] mb-[0.2rem] text-[1.5rem] text-[var(--color-text-strong)]">+38%</strong>
                        <span className="text-[var(--color-text-secondary)] text-[0.8125rem]">{t("landing_mockup_metric_text")}</span>
                    </div>
                </div>
            </section>

            {/* Sections */}
            <section id="problema" className="landing-section bg-[var(--color-surface-0)]">
                <h2 className="m-0 text-[clamp(1.4rem,2.3vw,2rem)] text-[var(--color-text-strong)]">{t("landing_problem_title")}</h2>
                <p className="mt-[0.9rem] mb-0 text-[var(--color-text-secondary)] text-base max-w-[72ch]">{t("landing_problem_text")}</p>
            </section>

            <section id="solucao" className="landing-section bg-gradient-to-b from-white to-[var(--color-highlight-lighter)]">
                <h2 className="m-0 text-[clamp(1.4rem,2.3vw,2rem)] text-[var(--color-text-strong)]">{t("landing_solution_title")}</h2>
                <p className="mt-[0.9rem] mb-0 text-[var(--color-text-secondary)] text-base max-w-[72ch]">{t("landing_solution_text")}</p>
            </section>

            <section className="landing-section">
                <h2 className="m-0 text-[clamp(1.4rem,2.3vw,2rem)] text-[var(--color-text-strong)]">{t("landing_benefits_title")}</h2>
                <div className="mt-5 grid grid-cols-[repeat(5,minmax(0,1fr))] gap-[0.8rem] max-[1024px]:grid-cols-2 max-sm:grid-cols-1">
                    {benefits.map((b) => (
                        <article key={b.title} className="rounded-[var(--radius-lg)] border border-[var(--color-border-light)] p-[1rem_0.9rem] bg-white">
                            <h3 className="m-0 text-[0.9375rem] text-[var(--color-text-strong)]">{b.title}</h3>
                            <p className="mt-[0.45rem] text-[0.875rem] text-[var(--color-text-secondary)]">{b.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section id="como-funciona" className="landing-section">
                <h2 className="m-0 text-[clamp(1.4rem,2.3vw,2rem)] text-[var(--color-text-strong)]">{t("landing_how_title")}</h2>
                <ol className="mt-4 mb-0 pl-[1.1rem] grid gap-[0.8rem]">
                    {steps.map((step) => (
                        <li key={step} className="text-[0.9375rem] text-[var(--color-text-secondary)]">{step}</li>
                    ))}
                </ol>
            </section>

            <section id="social-proof" className="landing-section">
                <h2 className="m-0 text-[clamp(1.4rem,2.3vw,2rem)] text-[var(--color-text-strong)]">{t("landing_social_title")}</h2>
                <p className="mt-[0.9rem] mb-0 text-[var(--color-text-secondary)] text-base max-w-[72ch]">{t("landing_social_text")}</p>
                <div className="mt-4 grid grid-cols-[repeat(4,minmax(0,1fr))] gap-[0.7rem] max-sm:grid-cols-1" aria-label={t("landing_social_logos_aria")}>
                    {["Empresa A", "Grupo B", "Indústria C", "Rede D"].map((name) => (
                        <span key={name} className="grid place-items-center min-h-[3.2rem] border border-dashed border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[var(--color-text-muted)] text-[0.875rem] font-semibold">{name}</span>
                    ))}
                </div>
            </section>

            <section className="landing-section text-center bg-gradient-to-b from-[var(--color-brand)] to-[var(--color-brand-mid)] text-[var(--color-on-dark-text)]">
                <h2 className="m-0 text-[clamp(1.4rem,2.3vw,2rem)] text-[var(--color-on-dark-text)]">{t("landing_final_title")}</h2>
                <p className="mt-[0.9rem] mb-0 text-[var(--color-on-dark-text)] text-base max-w-[72ch] mx-auto">{t("landing_final_text")}</p>
                <div className="mt-[1.3rem] flex items-center flex-wrap gap-[0.65rem] justify-center">
                    <Link to="/register" className="btn-landing-solid">{t("landing_cta_primary")}</Link>
                    <Link to="/login" className="btn-landing-ghost">{t("landing_cta_secondary")}</Link>
                </div>
            </section>
        </main>
    )
}

export default LandingPage
