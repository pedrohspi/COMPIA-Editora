import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { itemCount } = useCart()
  const { isLoggedIn, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">
            <span className="logo-main">COMPIA</span>
            <span className="logo-sub">Editora</span>
          </span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/catalog" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Catálogo</NavLink>
          {isLoggedIn && (
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Meus Pedidos</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active nav-link-admin' : 'nav-link nav-link-admin'}>⚙ Admin</NavLink>
          )}
        </div>

        <div className="navbar-actions">
          <button className="cart-btn" onClick={() => navigate('/cart')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>

          {isLoggedIn ? (
            <div className="user-menu">
              <div className="user-avatar" title={user?.name || user?.email}>
                {(user?.name || user?.email || '?')[0].toUpperCase()}
              </div>
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <span className="dropdown-name">{user?.name || 'Usuário'}</span>
                  <span className="dropdown-email">{user?.email}</span>
                  {isAdmin && <span className="dropdown-role">Administrador</span>}
                </div>
                <div className="dropdown-divider" />
                <Link to="/orders" className="dropdown-item">📦 Meus Pedidos</Link>
                {isAdmin && <Link to="/admin" className="dropdown-item">⚙ Painel Admin</Link>}
                <div className="dropdown-divider" />
                <button className="dropdown-item dropdown-logout" onClick={handleLogout}>↩ Sair</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="btn btn-secondary btn-sm">Entrar</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
