import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOrders, patchOrder } from '../../services/api'
import { logActivity } from '../../services/logService'
import './Admin.css'

const STATUS_OPTIONS = [
  'Aprovado',
  'Processando',
  'Em Separação',
  'Enviado',
  'Concluído',
  'Cancelado'
]

const STATUS_COLOR = {
  'Aprovado': 'var(--success)',
  'Processando': 'var(--warning)',
  'Em Separação': 'var(--accent)',
  'Enviado': '#38bdf8',
  'Concluído': 'var(--success)',
  'Cancelado': 'var(--accent-2)'
}

export default function AdminOrders() {

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = () => {
    getOrders()
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleStatus = async (id, newStatus) => {

    await patchOrder(id, { status: newStatus })

    await logActivity(
      `Status do pedido ${id} alterado para "${newStatus}"`
    )

    showToast(`Status atualizado para "${newStatus}"`)

    load()
  }

  return (
    <div className="admin-page">

      <div className="container">

        <div className="page-header admin-page-header">

          <div>

            <Link to="/admin" className="admin-back">
              ← Painel
            </Link>

            <h1 className="page-title">Pedidos</h1>

            <p className="page-subtitle">
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} registrados
            </p>

          </div>

        </div>

        {loading ? (

          <div>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="skeleton"
                style={{
                  height: 72,
                  borderRadius: 12,
                  marginBottom: 10
                }}
              />
            ))}
          </div>

        ) : orders.length === 0 ? (

          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>Nenhum pedido</h3>
          </div>

        ) : (

          <div className="orders-list">

            {orders.map(order => {
              
              const isOnlyDigital = order.items?.length > 0 && order.items.every(item => item.type === "E-book");

              return (
                <div key={order.id} className="order-card card">

                  <div
                    className="order-header"
                    onClick={() =>
                      setExpanded(
                        expanded === order.id ? null : order.id
                      )
                    }
                  >

                    <div className="order-header-left">

                      <span className="order-id">
                        Pedido #{order.id}
                      </span>

                      <div className="order-meta">

                        <span>
                          📅 {new Date(order.date).toLocaleString('pt-BR')}
                        </span>

                        <span>
                          👤 {order.userEmail}
                        </span>

                        <span>
                          💳 {order.paymentMethod}
                        </span>

                      </div>

                    </div>

                    <div className="order-header-right">

                      <span
                        className="order-status"
                        style={{
                          color: STATUS_COLOR[order.status] || 'var(--text-muted)'
                        }}
                      >
                        ● {order.status}
                      </span>

                      <span className="order-total">
                        R$ {(order.total ?? 0).toFixed(2).replace('.', ',')}
                      </span>

                      <span className="order-toggle">
                        {expanded === order.id ? '▲' : '▼'}
                      </span>

                    </div>

                  </div>

                  {expanded === order.id && (

                    <div className="order-items-list animate-in">

                      <div className="order-divider" />

                      <div className="order-books">

                        {order.items?.map(item => (

                          <div key={item.id} className="order-book">

                            <img
                              src={item.image}
                              alt={item.title}
                              className="order-book-img"
                            />

                            <div className="order-book-info">

                              <span className="order-book-title">
                                {item.title}
                              </span>

                              <span className="order-book-author">
                                {item.author || 'Autor não informado'}
                              </span>

                            </div>

                            <div className="order-book-price">

                              <span>x{item.quantity}</span>

                              <strong>
                                R$ {(item.price * item.quantity)
                                  .toFixed(2)
                                  .replace('.', ',')}
                              </strong>

                            </div>

                          </div>

                        ))}

                      </div>

                      <div className="order-totals">

                        <div className="order-total-row">

                          <span>Subtotal</span>

                          <span>
                            R$ {(order.subtotal ?? order.total ?? 0)
                              .toFixed(2)
                              .replace('.', ',')}
                          </span>

                        </div>

                        <div className="order-total-row">

                          <span>Frete</span>

                          <span>
                            {order.shipping === 0 || isOnlyDigital
                              ? 'Grátis'
                              : `R$ ${(order.shipping ?? 0)
                                  .toFixed(2)
                                  .replace('.', ',')}`}
                          </span>

                        </div>

                        <div className="order-total-row total">

                          <span>Total</span>

                          <strong>
                            R$ {(order.total ?? 0)
                              .toFixed(2)
                              .replace('.', ',')}
                          </strong>

                        </div>

                      </div>

                      <div className="order-status-changer">
                        
                        {isOnlyDigital ? (
                          <div style={{ padding: '16px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', marginTop: '16px' }}>
                            <span style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}></span>
                            <strong>Pedido 100% Digital</strong>
                            <p style={{ fontSize: '13px', marginTop: '4px' }}>Os arquivos já foram liberados para o cliente. O status não precisa ser alterado.</p>
                          </div>
                        ) : (

                          <>
                            <span className="status-changer-label">
                              Atualizar status:
                            </span>

                            <div className="status-options">

                              {STATUS_OPTIONS.map(s => (

                                <button
                                  key={s}
                                  className={`status-opt-btn ${order.status === s ? 'active' : ''}`}

                                  style={
                                    order.status === s
                                      ? {
                                          borderColor: STATUS_COLOR[s],
                                          color: STATUS_COLOR[s],
                                          background: `${STATUS_COLOR[s]}18`
                                        }
                                      : {}
                                  }

                                  onClick={() =>
                                    handleStatus(order.id, s)
                                  }
                                >
                                  {s}
                                </button>

                              ))}

                            </div>
                          </>
                        )}

                      </div>

                    </div>

                  )}

                </div>
              );
            })}

          </div>

        )}

      </div>

      {toast && (

        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>

      )}

    </div>
  )
}