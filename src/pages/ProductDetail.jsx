import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductById, getProducts } from '../services/api'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/product/ProductCard'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const { addItem, items } = useCart()
  const inCart = items.some(i => String(i.id) === String(product?.id))

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    
    getProductById(id)
      .then(r => {
        if (!isMounted) return
        const currentProduct = r.data
        setProduct(currentProduct)
        
        return getProducts().then(all => {
          if (!isMounted || !all) return
          
          const filtered = all.data
            .filter(p => 
              p.category === currentProduct.category && 
              String(p.id) !== String(id)
            )
            .sort(() => 0.5 - Math.random())
            .slice(0, 4)
            
          setRelated(filtered)
        })
      })
      .catch(err => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    window.scrollTo({ top: 0, behavior: 'smooth' })
    return () => { isMounted = false }
  }, [id])

  const handleAddToCart = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const renderStars = (rating) => (
    <div className="detail-stars" aria-label={`Avaliação ${rating}`}>
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="detail-container loading-skeleton">
        <div className="skeleton-grid">
          <div className="skeleton-image" />
          <div className="skeleton-content">
            <div className="skeleton-line title" />
            <div className="skeleton-line subtitle" />
            <div className="skeleton-block" />
            <div className="skeleton-line text" />
            <div className="skeleton-line text" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="detail-container">
        <div className="empty-state">
          <span className="empty-icon">📂</span>
          <h2>Produto não encontrado</h2>
          <Link to="/catalog" className="btn-primary">Voltar ao Catálogo</Link>
        </div>
      </div>
    )
  }

  return (
    <main className="product-detail-page">
      <div className="detail-container">
        <nav className="detail-breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <Link to="/catalog">Catálogo</Link>
          <span className="sep">/</span>
          <span className="current">{product.title}</span>
        </nav>

        <section className="product-main-grid">
          <div className="product-media-column">
            <div className="image-card">
              <img src={product.image} alt={product.title} className="main-image" />
              {product.stock === 0 && <div className="out-of-stock-overlay">Esgotado</div>}
            </div>
            
            <div className="image-meta-tags">
              <span className="tag-category">
                {product.category}
              </span>

              <span className="tag-type">
                {product.type}
              </span>

              {product.stock > 0 && product.stock <= 5 && (
                <span className="tag-stock-low">
                  Apenas {product.stock} em estoque
                </span>
              )}
            </div>
          </div>

          <div className="product-info-column">
            <header className="info-header">
              <div className="rating-row">
                {renderStars(product.rating)}
                <span className="rating-count">({product.rating})</span>
              </div>
              <h1 className="detail-title">{product.title}</h1>
              <span className="detail-author">Escrito por <strong>{product.author}</strong></span>
            </header>

            <div className="detail-specs">
              <div className="spec-box">
                <span className="spec-label">Páginas</span>
                <span className="spec-value">{product.pages || '---'}</span>
              </div>
              <div className="spec-divider" />
              <div className="spec-box">
                <span className="spec-label">Formato</span>
                <span className="spec-value">{product.type || '---'}</span>
              </div>
            </div>

            <article className="detail-description">
              <h3>Sinopse</h3>
              <p>{product.description}</p>
            </article>

            <div className="purchase-card">
              <div className="price-row">
                <span className="currency">R$</span>
                <span className="amount">{product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="action-buttons">
                <button
                  className={`btn-add-cart ${inCart || added ? 'success' : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || inCart}
                >
                  {inCart ? 'No Carrinho' : added ? 'Adicionado!' : 'Adicionar ao Carrinho'}
                </button>
                <Link to="/cart" className="btn-view-cart">Ir para o Carrinho</Link>
              </div>
              <p className="shipping-info">📦 Entrega rápida para todo o Brasil</p>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="related-products">
            <h2 className="section-title">Quem viu este, também viu</h2>
            <div className="related-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}