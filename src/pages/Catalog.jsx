import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import './Catalog.css'

const CATEGORIES = [
  'Todas',
  'Fundamentos',
  'Deep Learning',
  'Machine Learning',
  'NLP',
  'IA Generativa',
  'MLOps',
  'Visão Computacional',
  'Reinforcement Learning',
  'IA Ética',
  'Agentes IA'
]

const TYPES = ['Todos', 'Livro Físico', 'E-book', 'Kit']

const SORT_OPTIONS = [
  { value: 'default', label: 'Relevância' },
  { value: 'price-asc', label: 'Menor Preço' },
  { value: 'price-desc', label: 'Maior Preço' },
  { value: 'rating', label: 'Melhor Avaliação' }
]

export default function Catalog() {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [type, setType] = useState('Todos')

  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') || 'Todas'

  useEffect(() => {
    getProducts()
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const setCategory = (cat) => {
    if (cat === 'Todas') setSearchParams({})
    else setSearchParams({ category: cat })
  }

  const clearFilters = () => {
    setSearch('')
    setSort('default')
    setType('Todos')
    setCategory('Todas')
  }

  const filtered = useMemo(() => {

    let result = [...products]

    if (selectedCategory !== 'Todas') {
      result = result.filter(p => p.category === selectedCategory)
    }

    if (type !== 'Todos') {
      result = result.filter(p => p.type === type)
    }

    if (search) {
      const s = search.toLowerCase()

      result = result.filter(p =>
        (p.title && p.title.toLowerCase().includes(s)) ||
        (p.author && p.author.toLowerCase().includes(s))
      )
    }

    result.sort((a, b) => {

      if (sort === 'price-asc') return (a.price || 0) - (b.price || 0)

      if (sort === 'price-desc') return (b.price || 0) - (a.price || 0)

      if (sort === 'rating') return (b.rating || 0) - (a.rating || 0)

      return 0
    })

    return result

  }, [products, selectedCategory, search, sort, type])

  return (
    <div className="catalog-page">

      <div className="container">

        <div className="page-header">
          <h1 className="page-title">Catálogo de Livros</h1>
          <p className="page-subtitle">{filtered.length} títulos encontrados</p>
        </div>

        <div className="catalog-toolbar">

          <div className="search-wrap">

            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>

            <input
              type="text"
              className="search-input"
              placeholder="Buscar por título ou autor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

          </div>

          <select
            className="form-select sort-select"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

        </div>

        <div className="type-filters">

          {TYPES.map(t => (

            <button
              key={t}
              className={`type-pill ${type === t ? 'active' : ''}`}
              onClick={() => setType(t)}
            >
              {t}
            </button>

          ))}

        </div>

        <div className="category-pills">

          {CATEGORIES.map(cat => (

            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>

          ))}

        </div>

        <div className="results-info">

          <span>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>

          {(selectedCategory !== 'Todas' || search || type !== 'Todos') && (

            <button
              className="btn btn-ghost btn-sm"
              onClick={clearFilters}
            >
              Limpar filtros
            </button>

          )}

        </div>

        {loading ? (

          <div className="products-grid">

            {Array(6).fill(0).map((_, i) => (

              <div key={i} className="card">

                <div className="skeleton" style={{ aspectRatio: '4/3' }} />

                <div style={{
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  <div className="skeleton" style={{ height: 14, width: '40%' }} />
                  <div className="skeleton" style={{ height: 18, width: '80%' }} />
                  <div className="skeleton" style={{ height: 13, width: '60%' }} />
                  <div className="skeleton" style={{ height: 36, marginTop: 8 }} />
                </div>

              </div>

            ))}

          </div>

        ) : filtered.length === 0 ? (

          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>Nenhum livro encontrado</h3>
            <p>Tente outros termos ou categorias</p>
          </div>

        ) : (

          <div className="products-grid">

            {filtered.map((p, i) => (

              <ProductCard
                key={p.id}
                product={p}
                style={{ animationDelay: `${i * 0.05}s` }}
              />

            ))}

          </div>

        )}

      </div>

    </div>
  )
}