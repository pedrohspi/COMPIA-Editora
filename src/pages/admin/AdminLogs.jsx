import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLogs } from '../../services/api'
import './Admin.css'

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    getLogs().then(r => setLogs(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = logs.filter(l => !filter || l.description.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header admin-page-header">
          <div>
            <Link to="/admin" className="admin-back">← Painel</Link>
            <h1 className="page-title">Logs de Atividade</h1>
            <p className="page-subtitle">{logs.length} registros</p>
          </div>
        </div>

        <div style={{marginBottom:20}}>
          <input className="form-input" style={{maxWidth:400}} placeholder="🔍 Filtrar logs..." value={filter} onChange={e => setFilter(e.target.value)} />
        </div>

        {loading ? (
          <div>{[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:48,borderRadius:8,marginBottom:6}}/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><h3>Nenhum log {filter ? 'encontrado' : 'registrado'}</h3></div>
        ) : (
          <div className="admin-table-wrap card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{width:180}}>Data e Hora</th>
                  <th>Atividade</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <tr key={log.id}>
                    <td style={{fontSize:12,color:'var(--text-muted)',whiteSpace:'nowrap'}}>
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td style={{fontSize:13}}>{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
