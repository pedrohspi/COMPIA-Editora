import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/api'
import { logActivity } from '../../services/logService'
import './Admin.css'

const EMPTY_FORM = {
  title: '',
  author: '',
  description: '',
  price: '',
  stock: '',
  image: '',
  category: 'Fundamentos',
  type: 'Livro Físico',
  rating: '4.5',
  pages: ''
}
const CATEGORIES = ['Fundamentos','Deep Learning','Machine Learning','NLP','IA Generativa','MLOps','Visão Computacional','Reinforcement Learning','IA Ética','Agentes IA']
const TYPES = ['Livro Físico','E-book','Kit']

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

 const load = async () => {
    setLoading(true)
    try {
      const r = await getProducts()
      setProducts(r.data)
    } catch (error) {
      console.error('Erro ao carregar produtos', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {load()}, [])

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }
  const set = (field) => (e) => {
  const value = e.target.value

  setForm(f => {
    const updated = { ...f, [field]: value }

    if (field === 'type' && value === 'E-book') {
      updated.stock = ''
    }

    return updated
  })
  }

  const handleEdit = (p) => {
    setForm({...p, price:String(p.price), stock:String(p.stock), pages:String(p.pages), rating:String(p.rating)})
    setEditingId(p.id)
    setShowForm(true)
    window.scrollTo({top:0,behavior:'smooth'})
  }

  const handleCancel = () => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }

  const handleSubmit = async () => {
    if (!form.title || !form.author || !form.price) return
    setSaving(true)
    const data = {
            ...form,
            price: parseFloat(form.price),
            stock: form.type === 'E-book' ? 999 : parseInt(form.stock) || 0,
            pages: parseInt(form.pages) || 0,
            rating: parseFloat(form.rating) || 4.5
          }
    try {
      if (editingId) {
        await updateProduct(editingId, data)
        await logActivity(`Produto "${form.title}" atualizado`)
        showToast('Produto atualizado!')
      } else {
        await createProduct(data)
        await logActivity(`Produto "${form.title}" criado`)
        showToast('Produto criado!')
      }
      load(); handleCancel()
    } catch { showToast('Erro ao salvar.','error') }
    setSaving(false)
  }

  const handleDelete = async (id, title) => {
    try {
      await deleteProduct(id)
      await logActivity(`Produto "${title}" removido`)
      showToast('Produto removido.')
      load()
    } catch {
      showToast('Erro ao remover produto','error')
    }
    setDeleteConfirm(null)
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header" style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div>
            <Link to="/admin" className="admin-back">← Painel</Link>
            <h1 className="page-title">Produtos</h1>
            <p className="page-subtitle">{products.length} produtos cadastrados</p>
          </div>
          {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Novo Produto</button>}
        </div>

        {showForm && (
          <div className="admin-form card animate-in">
            <h2 className="form-section-title">{editingId ? '✏️ Editar Produto' : '+ Novo Produto'}</h2>
            <div className="form-grid-admin">
              <div className="form-group" style={{gridColumn:'span 2'}}>
                <label className="form-label">Título *</label>
                <input className="form-input" value={form.title} onChange={set('title')} placeholder="Título do livro" />
              </div>
              <div className="form-group">
                <label className="form-label">Autor *</label>
                <input className="form-input" value={form.author} onChange={set('author')} placeholder="Nome do autor" />
              </div>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select className="form-select" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={form.type} onChange={set('type')}>
                  {TYPES.map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{gridColumn:'span 2'}}>
                <label className="form-label">Descrição</label>
                <textarea className="form-textarea" value={form.description} onChange={set('description')} placeholder="Descrição do livro..." />
              </div>
              <div className="form-group">
                <label className="form-label">Preço (R$) *</label>
                <input className="form-input" type="number" value={form.price} onChange={set('price')} placeholder="189.90" step="0.01" />
              </div>
              <div className="form-group">
                <label className="form-label">Estoque</label>
                <input
                  className="form-input"
                  type="number"
                  value={form.stock}
                  onChange={set('stock')}
                  placeholder="10"
                  disabled={form.type === 'E-book'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Páginas</label>
                <input className="form-input" type="number" value={form.pages} onChange={set('pages')} placeholder="350" />
              </div>
              <div className="form-group">
                <label className="form-label">Rating (0-5)</label>
                <input className="form-input" type="number" value={form.rating} onChange={set('rating')} placeholder="4.5" step="0.1" min="0" max="5" />
              </div>
              <div className="form-group" style={{gridColumn:'span 2'}}>
                <label className="form-label">URL da Imagem</label>
                <input className="form-input" value={form.image} onChange={set('image')} placeholder="https://..." />
              </div>
            </div>
            <div className="form-actions-admin">
              <button className="btn btn-secondary" onClick={handleCancel}>Cancelar</button>
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={saving||!form.title||!form.author||!form.price}>
                {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Produto'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div>{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:64,borderRadius:8,marginBottom:8}}/>)}</div>
        ) : (
          <div className="admin-table-wrap card">
            <table className="admin-table">
              <thead>
                <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Rating</th>
                <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="table-product">
                        <img
                          src={p.image || 'https://via.placeholder.com/60x80?text=Livro'}
                          alt={p.title}
                          className="table-product-img"
                        />
                        <div><span className="table-product-title">{p.title}</span><span className="table-product-author">{p.author}</span></div>
                      </div>
                    </td>
                    <td><span className="badge">{p.category}</span></td>
                    <td><span className="badge">{p.type}</span></td>
                    <td className="table-price">
                      R$ {Number(p.price).toFixed(2).replace('.',',')}
                    </td>
                      <td><span className={`stock-indicator ${p.type ===    'E-book' ? 'ok' : p.stock===0?'out':p.stock<=5?'low':'ok'}`}>
                      {p.type === 'E-book' ? '∞' : p.stock}</span></td>
                    <td style={{fontSize:13}}>⭐ {p.rating}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(p)}>Editar</button>
                        {deleteConfirm === p.id ? (
                          <div className="confirm-delete">
                            <span>Confirmar?</span>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.title)}>Sim</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>Não</button>
                          </div>
                        ) : (
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(p.id)}>Remover</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {toast && <div className={`toast ${toast.type}`}>{toast.type==='success'?'✅':'❌'} {toast.msg}</div>}
    </div>
  )
}
