import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrdersByUser } from '../services/api'
import './Orders.css'

const STATUS_COLOR = { 
  'Processando': 'var(--warning)', 
  'Aprovado': 'var(--success)', 
  'Em Separação': 'var(--accent)', 
  'Enviado': '#38bdf8', 
  'Concluído': 'var(--success)', 
  'Cancelado': 'var(--accent-2)' 
}

export default function Orders() {
  const { isLoggedIn, user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login', { state: { from: '/orders' } }); return }
    getOrdersByUser(user.id)
      .then(r => {
        const sorted = r.data.sort((a, b) => b.id - a.id)
        setOrders(sorted)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isLoggedIn, user, navigate])

  if (loading) return (
    <div className="container" style={{paddingTop: '40px'}}>
      <div className="page-header"><h1 className="page-title">Meus Pedidos</h1></div>
      {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12, marginBottom: 12, background: 'var(--bg-hover)' }} />)}
    </div>
  )

  if (orders.length === 0) return (
    <div className="container" style={{paddingTop: '40px'}}>
      <div className="page-header"><h1 className="page-title">Meus Pedidos</h1></div>
      <div className="empty-state">
        <div className="empty-state-icon">📦</div>
        <h3>Nenhum pedido ainda</h3>
        <p>Seus pedidos aparecerão aqui após a compra</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>Ir às Compras →</Link>
      </div>
    </div>
  )

  return (
    <div className="orders-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Meus Pedidos</h1>
          <p className="page-subtitle">{orders.length} pedido{orders.length !== 1 ? 's' : ''} realizado{orders.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className={`order-card card ${expanded === order.id ? 'is-expanded' : ''}`}>
              <div className="order-header" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="order-header-left">
                  <span className="order-id">#{order.id}</span>
                  <div className="order-meta">
                    <span>📅 {new Date(order.date).toLocaleDateString('pt-BR')}</span>
                    <span>💳 {order.paymentMethod}</span>
                  </div>
                </div>
                <div className="order-header-right">
                  <span className="order-status" style={{ color: STATUS_COLOR[order.status] || 'var(--text-muted)' }}>
                    ● {order.status}
                  </span>
                  <span className="order-total">R$ {order.total?.toFixed(2).replace('.', ',')}</span>
                  <span className="order-toggle">{expanded === order.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === order.id && (
                <div className="order-content animate-in">
                  <div className="order-divider" />
                  <div className="order-books">
                    {order.items?.map(item => (
                      <div key={item.id} className="order-book">
                        <img src={item.image} alt={item.title} className="order-book-img" />
                        <div className="order-book-info">
                          <span className="order-book-title">{item.title}</span>
                          <span className="order-book-author">{item.author || 'Edição Digital'}</span>
                        </div>
                        <div className="order-book-price">
                          <span>x{item.quantity}</span>
                          <strong>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-details-grid">
                    <div className="delivery-info">
                      <h4>Entrega</h4>
                      <p>
                        {order.deliveryAddress ? (
                          <>
                            {order.deliveryAddress.street}, {order.deliveryAddress.number}<br />
                            {order.deliveryAddress.neighborhood}<br />
                            {order.deliveryAddress.city}/{order.deliveryAddress.state} - {order.deliveryAddress.cep}
                          </>
                        ) : (
                          order.address
                        )}
                      </p>
                    </div>

                    <div className="order-totals">
                      <div className="order-total-row">
                        <span>Subtotal</span>
                        <span>R$ {(order.subtotal || (order.total - (order.shipping || 0))).toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="order-total-row">
                        <span>Frete</span>
                        <span>{order.shipping === 0 ? 'Grátis' : `R$ ${(order.shipping || 0).toFixed(2).replace('.', ',')}`}</span>
                      </div>
                      <div className="order-total-row total">
                        <span>Total</span>
                        <strong>R$ {order.total?.toFixed(2).replace('.', ',')}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}