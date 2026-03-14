import { Link } from 'react-router-dom'
import './Home.css'
import {
  Brain,
  Microscope,
  Cpu,
  MessageSquareText,
  Sparkles,
  Rocket,
  BookOpen,
  Truck,
  ShieldCheck
} from "lucide-react"

const CATEGORIES = [
  { name: 'Fundamentos', icon: Brain, color: '#6c63ff' },
  { name: 'Deep Learning', icon: Microscope, color: '#ff6584' },
  { name: 'Machine Learning', icon: Cpu, color: '#4ade80' },
  { name: 'NLP', icon: MessageSquareText, color: '#fbbf24' },
  { name: 'IA Generativa', icon: Sparkles, color: '#a78bfa' },
  { name: 'MLOps', icon: Rocket, color: '#38bdf8' },
]

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Curadoria Especializada',
    desc: 'Títulos selecionados por pesquisadores e engenheiros de IA'
  },
  {
    icon: Truck,
    title: 'Envio Rápido',
    desc: 'Receba em até 2 dias úteis em todo o Brasil'
  },
  {
    icon: ShieldCheck,
    title: 'Compra Segura',
    desc: 'Criptografia SSL e pagamento protegido'
  },
]

export default function Home() {
  return (
    <div className="home">

      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-grid" />
        </div>
        <div className="container hero-content">
          <span className="hero-pill">Loja oficial de livros de IA</span>
          <h1 className="hero-title">
            O conhecimento que<br />
            <span className="hero-highlight">molda o futuro</span>
          </h1>
          <p className="hero-desc">
            Os melhores livros de Inteligência Artificial, Machine Learning e Deep Learning,
            curados por especialistas para impulsionar sua carreira.
          </p>
          <div className="hero-actions">
            <Link to="/catalog" className="btn btn-primary btn-lg">
              Explorar Catálogo →
            </Link>
            <Link to="/catalog" className="btn btn-secondary btn-lg">
              Ver Ofertas
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><strong>120+</strong><span>Títulos</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>4.8★</strong><span>Avaliação média</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>50k+</strong><span>Leitores</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Navegue por Categoria</h2>
            <Link to="/catalog" className="section-link">Ver todos →</Link>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/catalog?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
                style={{ '--cat-color': cat.color }}
              >
                <span className="cat-icon">
                  <cat.icon size={26} />
                </span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section features-section">
        <div className="container">
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon">
                  <f.icon size={28} />
                </span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-orb" />
            <h2 className="cta-title">Pronto para expandir seu conhecimento?</h2>
            <p className="cta-desc">Mais de 120 títulos disponíveis. Seu próximo breakthrough começa aqui.</p>
            <Link to="/catalog" className="btn btn-primary btn-lg">
              Começar agora →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
