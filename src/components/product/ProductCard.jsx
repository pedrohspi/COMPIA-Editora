import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const { addItem, items } = useCart()
  const inCart = items.some(i => i.id === product.id)

  const renderStars = () => {
    const rating = Math.round(product.rating)
    return (
      <div className="stars" aria-label={`Avaliação: ${product.rating} de 5 estrelas`}>
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? 'star-filled' : 'star-empty'}>
            ★
          </span>
        ))}
      </div>
    )
  }

  return (
    <article className="product-card animate-in">
      <Link to={`/product/${product.id}`} className="product-card-link-wrapper" aria-label={`Ver detalhes de ${product.title}`}>
        <div className="product-card-image-wrap">
          <img 
            src={product.image || 'https://via.placeholder.com/300x400?text=Livro'} 
            alt="" 
            className="product-card-image" 
            loading="lazy" 
            decoding="async"
          />
          <div className="product-card-overlay">
            <span className="view-label">VER DETALHES</span>
          </div>
        </div>

        <div className="product-card-body">
          <div className="product-header">
            <div className="product-rating">
              {renderStars()}
              <span className="rating-val">
                  ({(product.rating || 0).toFixed(1)})
              </span>
            </div>
            <h3 className="product-title">{product.title}</h3>
            <span className="product-author">{product.author}</span>
            <div className="product-meta">
              {product.category && (
                <span className="badge product-category">
                  {product.category}
                </span>
              )}

              {product.type && (
                <span className="badge product-type">
                  {product.type}
                </span>
              )}
          </div>
          </div>
          
          <div className="price-container">
            <span className="price-label">R$</span>
            <span className="product-price">
              {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Link>

      <footer className="product-card-footer">
        <button
          className={`add-to-cart-btn ${inCart ? 'in-cart' : ''} ${product.stock === 0 ? 'disabled' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            addItem(product);
          }}
          disabled={product.stock === 0}
          aria-pressed={inCart}
        >
          {product.stock === 0 ? (
            'Esgotado'
          ) : inCart ? (
            <><span className="icon">✓</span> No Carrinho</>
          ) : (
            <><span className="icon"></span> Comprar</>
          )}
        </button>
      </footer>
    </article>
  )
}