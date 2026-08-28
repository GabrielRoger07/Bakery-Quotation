import { Link } from 'react-router-dom'

const LandingPage = () => {

    const benefits = [
        { title: "Organização", text: "Todos os fornecedores e cotações em um único lugar." },
        { title: "Agilidade", text: "Menos tempo operacional para abrir, acompanhar e fechar cotações." },
        { title: "Transparência", text: "Visibilidade total de datas, status e evolução de propostas." },
        { title: "Comparação simplificada", text: "Avalie preços e condições com leitura clara por produto." },
        { title: "Histórico centralizado", text: "Consulte decisões passadas e negociações anteriores com facilidade." },
    ]

    const steps = [
        "Cadastre produtos e fornecedores em poucos minutos.",
        "Crie a cotação e defina prazo de início e encerramento.",
        "Fornecedores enviam lances online em tempo real.",
        "Compare propostas e finalize com mais segurança."
    ]

    return (
        <main className="landing-bg min-h-screen py-5 px-[1.1rem] pb-12 text-[var(--color-text-body)] max-sm:px-[0.7rem] max-sm:py-[0.8rem] max-sm:pb-10">

            {/* Topbar */}
            <header className="landing-topbar max-w-[1180px] mx-auto h-16 border border-[var(--color-border-default)] rounded-[var(--radius-xl)] [box-shadow:var(--shadow-xs)] flex items-center justify-between px-4 max-sm:h-auto max-sm:py-3 max-sm:gap-[0.6rem] max-sm:flex-wrap">
                <div className="inline-flex items-center gap-2 font-bold">
                    <span className="w-[1.9rem] h-[1.9rem] rounded-[0.55rem] grid place-items-center text-white bg-gradient-to-br from-[var(--color-accent-strong)] to-[var(--color-accent)] text-[0.875rem]">CF</span>
                    <span>Cota Fácil</span>
                </div>
                <nav className="flex items-center gap-4 max-lg:hidden">
                    <a href="#problema" className="no-underline text-[var(--color-text-secondary)] text-[0.875rem] font-medium hover:text-[var(--color-text-heading)]">Problema</a>
                    <a href="#solucao" className="no-underline text-[var(--color-text-secondary)] text-[0.875rem] font-medium hover:text-[var(--color-text-heading)]">Solução</a>
                    <a href="#como-funciona" className="no-underline text-[var(--color-text-secondary)] text-[0.875rem] font-medium hover:text-[var(--color-text-heading)]">Como funciona</a>
                    <a href="#social-proof" className="no-underline text-[var(--color-text-secondary)] text-[0.875rem] font-medium hover:text-[var(--color-text-heading)]">Resultados</a>
                </nav>
                <div className="inline-flex items-center gap-2 max-sm:w-full">
                    <Link to="/login" className="no-underline rounded-[var(--radius-md)] text-[0.875rem] font-semibold text-[var(--color-text-secondary)] px-[0.65rem] py-2 max-sm:flex-1 max-sm:text-center">Entrar</Link>
                    <Link to="/register" className="btn-landing-solid max-sm:flex-1 max-sm:text-center">Criar conta</Link>
                </div>
            </header>

            {/* Hero */}
            <section className="max-w-[1180px] mx-auto mt-[3.1rem] mb-8 grid grid-cols-[1.1fr_1fr] gap-8 items-center max-lg:grid-cols-1 max-sm:mt-[1.8rem]">
                <div>
                    <p className="m-0 text-[var(--color-accent)] text-[0.875rem] font-bold tracking-[0.06em] uppercase">SaaS B2B para compras corporativas</p>
                    <h1 className="mt-[0.7rem] mb-4 text-[clamp(2rem,4.3vw,3.2rem)] leading-[1.1] text-[var(--color-text-heading)]">Centralize suas cotações e negocie com fornecedores em minutos</h1>
                    <p className="m-0 text-[var(--color-text-secondary)] text-base max-w-[50ch] max-lg:max-w-none">Substitua planilhas e processos manuais por um fluxo digital com comparação de propostas, histórico completo e mais velocidade para o time de compras.</p>
                    <div className="mt-[1.3rem] flex items-center flex-wrap gap-[0.65rem]">
                        <Link to="/register" className="btn-landing-solid">Criar conta</Link>
                        <Link to="/login" className="btn-landing-ghost">Entrar</Link>
                    </div>
                </div>

                <div className="relative min-h-[360px] max-sm:min-h-0" aria-hidden="true">
                    <div className="border border-[var(--color-border-default)] bg-white rounded-[var(--radius-xl)] [box-shadow:var(--shadow-md-soft)] p-4 w-[min(100%,470px)]">
                        <h3 className="m-0 mb-4 text-base">Painel de Cotações</h3>
                        {[
                            { name: "Produto", price: "Menor valor", status: "Status", strong: false },
                            { name: "Arroz Tipo 1", price: "R$ 28,40", status: "Produto", strong: true },
                            { name: "Farinha 25kg", price: "R$ 87,90", status: "Menor valor", strong: false },
                        ].map((row, i) => (
                            <div key={i} className={`grid grid-cols-[1fr_auto_auto] gap-[0.7rem] px-2 py-[0.6rem] border-b border-[var(--color-border-faint)] text-[0.875rem] ${row.strong ? 'bg-[var(--color-highlight-lighter)] rounded-[0.55rem]' : ''}`}>
                                <span>{row.name}</span><span>{row.price}</span><span>{row.status}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border border-[var(--color-border-default)] bg-white rounded-[var(--radius-xl)] [box-shadow:var(--shadow-md-soft)] p-4 w-[190px] absolute right-0 -bottom-5 max-lg:static max-lg:mt-3 max-sm:hidden">
                        <p className="m-0 text-[var(--color-text-muted)] text-caption">Produtividade</p>
                        <strong className="block mt-[0.35rem] mb-[0.2rem] text-[1.5rem] text-[var(--color-text-heading)]">+38%</strong>
                        <span className="text-[var(--color-text-secondary)] text-caption">de ganho no ciclo de compra</span>
                    </div>
                </div>
            </section>

            {/* Sections */}
            <section id="problema" className="landing-section bg-[var(--color-surface-card)]">
                <h2 className="m-0 text-[clamp(1.4rem,2.3vw,2rem)] text-[var(--color-text-heading)]">O processo tradicional de cotação custa tempo e previsibilidade</h2>
                <p className="mt-[0.9rem] mb-0 text-[var(--color-text-secondary)] text-base max-w-[72ch]">Visitas presenciais, mensagens dispersas e planilhas diferentes dificultam comparar propostas com clareza. Isso gera retrabalho, atrasos e decisões com menos transparência.</p>
            </section>

            <section id="solucao" className="landing-section bg-gradient-to-b from-white to-[var(--color-highlight-lighter)]">
                <h2 className="m-0 text-[clamp(1.4rem,2.3vw,2rem)] text-[var(--color-text-heading)]">Uma operação de compras mais rápida, organizada e auditável</h2>
                <p className="mt-[0.9rem] mb-0 text-[var(--color-text-secondary)] text-base max-w-[72ch]">Com o Cota Fácil, sua equipe cria cotações em poucos cliques, convida fornecedores em escala e acompanha tudo em um único painel. Resultado: mais agilidade para negociar e mais confiança para decidir.</p>
            </section>

            <section className="landing-section">
                <h2 className="m-0 text-[clamp(1.4rem,2.3vw,2rem)] text-[var(--color-text-heading)]">Benefícios que impactam direto o resultado da compra</h2>
                <div className="mt-5 grid grid-cols-[repeat(5,minmax(0,1fr))] gap-[0.8rem] max-lg:grid-cols-2 max-sm:grid-cols-1">
                    {benefits.map((b) => (
                        <article key={b.title} className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-[1rem_0.9rem] bg-white">
                            <h3 className="m-0 text-heading text-[var(--color-text-heading)]">{b.title}</h3>
                            <p className="mt-[0.45rem] text-[0.875rem] text-[var(--color-text-secondary)]">{b.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section id="como-funciona" className="landing-section">
                <h2 className="m-0 text-[clamp(1.4rem,2.3vw,2rem)] text-[var(--color-text-heading)]">Como funciona</h2>
                <ol className="mt-4 mb-0 pl-[1.1rem] grid gap-[0.8rem]">
                    {steps.map((step) => (
                        <li key={step} className="text-body text-[var(--color-text-secondary)]">{step}</li>
                    ))}
                </ol>
            </section>

            <section id="social-proof" className="landing-section">
                <h2 className="m-0 text-[clamp(1.4rem,2.3vw,2rem)] text-[var(--color-text-heading)]">Pronto para escalar com sua operação</h2>
                <p className="mt-[0.9rem] mb-0 text-[var(--color-text-secondary)] text-base max-w-[72ch]">Estrutura pronta para incluir logos de clientes, depoimentos e estudos de caso conforme sua estratégia comercial.</p>
                <div className="mt-4 grid grid-cols-[repeat(4,minmax(0,1fr))] gap-[0.7rem] max-sm:grid-cols-1" aria-label="Espaços reservados para logos de clientes">
                    {["Empresa A", "Grupo B", "Indústria C", "Rede D"].map((name) => (
                        <span key={name} className="grid place-items-center min-h-[3.2rem] border border-dashed border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[var(--color-text-muted)] text-[0.875rem] font-semibold">{name}</span>
                    ))}
                </div>
            </section>

            <section className="landing-section text-center bg-gradient-to-b from-[var(--color-brand)] to-[var(--color-brand-mid)] text-[var(--color-on-dark-text)]">
                <h2 className="m-0 text-[clamp(1.4rem,2.3vw,2rem)] text-[var(--color-on-dark-text)]">Leve sua área de compras para um padrão SaaS de alta performance</h2>
                <p className="mt-[0.9rem] mb-0 text-[var(--color-on-dark-text)] text-base max-w-[72ch] mx-auto">Reduza o esforço operacional e aumente o controle sobre cada cotação com um fluxo profissional, digital e centralizado.</p>
                <div className="mt-[1.3rem] flex items-center flex-wrap gap-[0.65rem] justify-center">
                    <Link to="/register" className="btn-landing-solid">Criar conta</Link>
                    <Link to="/login" className="btn-landing-ghost">Entrar</Link>
                </div>
            </section>
        </main>
    )
}

export default LandingPage
