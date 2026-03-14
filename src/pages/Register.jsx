import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('As senhas não coincidem.'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon-sm">⬡</span>
          <span className="auth-brand">Synapse Books</span>
        </div>
        <h1 className="auth-title">Crie sua conta</h1>
        <p className="auth-sub">Comece a explorar o melhor da IA</p>

        {error && <div className="auth-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Nome completo</label>
            <input className="form-input" type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <div className="input-password-wrap">
              <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Mín. 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPass(s => !s)}
              >
                {showPass ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.94 10.94 0 0112 20C7 20 2.73 16.11 1 12c.73-1.63 1.94-3.1 3.46-4.29"/>
                    <path d="M9.9 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.89 11 8a11.77 11.77 0 01-2.16 3.19"/>
                    <path d="M1 1l22 22"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirmar senha</label>
            <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Repita a senha" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : 'Criar conta'}
          </button>
        </form>

        <p className="auth-footer-text">
          Já tem uma conta?{' '}
          <Link to="/login" className="auth-link">Fazer login</Link>
        </p>
      </div>
    </div>
  )
}
