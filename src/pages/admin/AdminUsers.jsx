import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUsers, patchUser, deleteUser } from '../../services/api'
import { logActivity } from '../../services/logService'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const load = () => {
    getUsers().then(r => setUsers(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRole = async (id, newRole) => {
    await patchUser(id, { role: newRole })
    await logActivity(`Perfil do usuário ID:${id} alterado para "${newRole}"`)
    showToast('Perfil atualizado!')
    load()
  }

  const handleDelete = async (id, email) => {
    if (id === currentUser.id) { showToast('Não é possível excluir sua própria conta.', 'error'); return }
    await deleteUser(id)
    await logActivity(`Usuário ${email} excluído`)
    showToast('Usuário excluído.')
    setDeleteConfirm(null)
    load()
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header admin-page-header">
          <div>
            <Link to="/admin" className="admin-back">← Painel</Link>
            <h1 className="page-title">Usuários</h1>
            <p className="page-subtitle">{users.length} usuários cadastrados</p>
          </div>
        </div>

        {loading ? (
          <div>{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:56,borderRadius:8,marginBottom:8}}/>)}</div>
        ) : (
          <div className="admin-table-wrap card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent-2))',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:14,flexShrink:0}}>
                          {(u.name||u.email||'?')[0].toUpperCase()}
                        </div>
                        <span style={{fontWeight:600,fontSize:14}}>{u.name || '—'}</span>
                        {u.id === currentUser.id && <span className="badge" style={{fontSize:10}}>Você</span>}
                      </div>
                    </td>
                    <td style={{fontSize:13,color:'var(--text-muted)'}}>{u.email}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{width:130,padding:'6px 32px 6px 10px',fontSize:13}}
                        value={u.role}
                        onChange={e => handleRole(u.id, e.target.value)}
                        disabled={u.id === currentUser.id}
                      >
                        <option value="customer">Cliente</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{fontSize:12,color:'var(--text-muted)'}}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td>
                      {deleteConfirm === u.id ? (
                        <div className="confirm-delete">
                          <span>Confirmar?</span>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.email)}>Sim</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>Não</button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteConfirm(u.id)}
                          disabled={u.id === currentUser.id}
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
    </div>
  )
}
