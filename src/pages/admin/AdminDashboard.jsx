import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, getOrders, getUsers } from '../../services/api'
import './Admin.css'

const NAV_CARDS = [
  { to: '/admin/products', icon: '📚', title: 'Produtos', desc: 'Adicionar, editar e remover livros', color: '#6c63ff' },
  { to: '/admin/orders', icon: '📦', title: 'Pedidos', desc: 'Acompanhar e atualizar status', color: '#4ade80' },
  { to: '/admin/users', icon: '👥', title: 'Usuários', desc: 'Gerenciar perfis e contas', color: '#fbbf24' },
  { to: '/admin/logs', icon: '📋', title: 'Logs', desc: 'Histórico de atividades', color: '#ff6584' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 })

  useEffect(() => {
    Promise.all([getProducts(), getOrders(), getUsers()]).then(([p, o, u]) => {
      const revenue = o.data.reduce((s, order) => s + (order.total || 0), 0)
      setStats({ products: p.data.length, orders: o.data.length, users: u.data.length, revenue })
    }).catch(console.error)
  }, [])

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Painel Administrativo</h1>
          <p className="page-subtitle">Gerencie sua loja COMPIA Books</p>
        </div>

        <div className="admin-stats">
          {[
            { label: 'Produtos', value: stats.products, icon: '📚' },
            { label: 'Pedidos', value: stats.orders, icon: '📦' },
            { label: 'Usuários', value: stats.users, icon: '👥' },
            { label: 'Receita Total', value: `R$ ${stats.revenue.toFixed(2).replace('.', ',')}`, icon: '💰' },
          ].map(s => (
            <div key={s.label} className="stat-card card">
              <span className="stat-icon">{s.icon}</span>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-nav-grid">
          {NAV_CARDS.map(card => (
            <Link key={card.to} to={card.to} className="admin-nav-card card" style={{ '--card-color': card.color }}>
              <span className="admin-nav-icon">{card.icon}</span>
              <div>
                <h3 className="admin-nav-title">{card.title}</h3>
                <p className="admin-nav-desc">{card.desc}</p>
              </div>
              <span className="admin-nav-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
