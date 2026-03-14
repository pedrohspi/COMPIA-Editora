import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import './Cart.css'

export default function Cart() {

  const { items, total, removeItem, updateQuantity } = useCart()

  const [cep,setCep] = useState('')
  const [shippingCalculated,setShippingCalculated] = useState(false)
  const [address,setAddress] = useState(null)
  const [loadingCep,setLoadingCep] = useState(false)

  const shippingLimit = 150
  const shippingCost = 19.90

  const hasPhysicalProduct =
    items.some(item => item.type === "Livro Físico")

  const isFreeShipping =
    hasPhysicalProduct && total >= shippingLimit

  const currentShipping =
    hasPhysicalProduct
      ? (isFreeShipping ? 0 :
        shippingCalculated ? shippingCost : 0)
      : 0

  const finalTotal =
    shippingCalculated
      ? total + currentShipping
      : total

  const totalItems =
    items.reduce((sum,item)=>sum+item.quantity,0)

  async function calculateShipping(){

    if(!hasPhysicalProduct) return

    const cleanCep = cep.replace(/\D/g,'')

    if(cleanCep.length !== 8){
      alert("Digite um CEP válido")
      return
    }

    try{

      setLoadingCep(true)

      const response =
        await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)

      const data = await response.json()

      if(data.erro){
        alert("CEP não encontrado")
        return
      }

      setAddress(data)
      setShippingCalculated(true)

    }catch(err){

      alert("Erro ao consultar CEP")

    }finally{

      setLoadingCep(false)

    }

  }

  if(items.length === 0){

    return(
      <div className="cart-empty-wrapper">
        <div className="container">

          <div className="empty-state-card">

            <div className="empty-icon-circle">🛒</div>

            <h2>Seu carrinho está vazio</h2>

            <p>
              Parece que você ainda não escolheu seus próximos livros.
            </p>

            <Link to="/catalog" className="btn-primary-lg">
              Explorar Catálogo
            </Link>

          </div>

        </div>
      </div>
    )

  }

  return (

    <main className="cart-page">

      <div className="container">

        <header className="cart-header">

          <h1 className="cart-title">Meu Carrinho</h1>

          <span className="cart-count">
            {totalItems} {totalItems === 1 ? 'item':'itens'}
          </span>

        </header>


        <div className="cart-grid">


          <section className="cart-items-list">

            {items.map(item => (

              <article key={item.id} className="cart-item-row">

                <div className="cart-item-media">
                  <img src={item.image} alt={item.title}/>
                </div>

                <div className="cart-item-details">

                  <div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="item-category-tag">
                        {item.category}
                      </span>
                      

                      <span className="item-type-tag" style={{
                        background: '#1a1a20',
                        border: '1px solid #2a2a32',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#aaa'
                      }}>
                        {item.type}
                      </span>

  
                    </div>

                    <Link
                      to={`/product/${item.id}`}
                      className="item-title-link"
                    >
                      {item.title}
                    </Link>

                    <span className="item-author-text">
                      {item.author}
                    </span>

                  </div>


                  <div className="cart-item-actions">


                    {item.type === "Livro Físico" ? (

                      <div className="quantity-selector">

                        <button
                          className="qty-ctrl-btn"
                          onClick={()=>updateQuantity(item.id,item.quantity-1)}
                        >
                          −
                        </button>

                        <span className="qty-number">
                          {item.quantity}
                        </span>

                        <button
                          className="qty-ctrl-btn"
                          disabled={item.quantity >= item.stock}
                          onClick={()=>updateQuantity(item.id,item.quantity+1)}
                        >
                          +
                        </button>

                      </div>

                    ) : (

                      <div className="quantity-selector-placeholder" style={{ fontSize: '13px', color: '#777', fontWeight: 600 }}>
                        Qtd: 1
                      </div>
                    )}


                    <div className="item-price-block">

                      <span className="unit-price-label">

                        {item.price.toLocaleString('pt-BR',{
                          style:'currency',
                          currency:'BRL'
                        })} /un.

                      </span>

                      <span className="subtotal-price-text">

                        {(item.price * item.quantity).toLocaleString('pt-BR',{
                          style:'currency',
                          currency:'BRL'
                        })}

                      </span>

                    </div>


                    <button
                      className="item-remove-btn"
                      onClick={()=>removeItem(item.id)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                      </svg>
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </section>


          <aside className="cart-sidebar">

            <div className="summary-card">

              <h2 className="summary-heading">
                Resumo da Compra
              </h2>

              {hasPhysicalProduct && (

                <div className="cep-box">

                  <input
                    type="text"
                    placeholder="Digite seu CEP"
                    value={cep}
                    onChange={(e)=>setCep(e.target.value)}
                  />

                  <button onClick={calculateShipping}>
                    {loadingCep ? "..." : "Calcular"}
                  </button>

                </div>

              )}


              {address && (

                <p className="cep-result">
                  Entrega para {address.localidade} - {address.uf}
                </p>

              )}


              <div className="summary-rows">

                <div className="summary-item">

                  <span>Subtotal</span>

                  <span>
                    {total.toLocaleString('pt-BR',{
                      style:'currency',
                      currency:'BRL'
                    })}
                  </span>

                </div>


                {hasPhysicalProduct && (

                  <div className="summary-item">

                    <span>Frete</span>

                    <span className={isFreeShipping ? 'text-success':''}>

                      {shippingCalculated
                        ? isFreeShipping
                          ? 'Grátis'
                          : shippingCost.toLocaleString('pt-BR',{
                              style:'currency',
                              currency:'BRL'
                            })
                        : '--'
                      }

                    </span>

                  </div>

                )}


                {!isFreeShipping && hasPhysicalProduct && (

                  <div className="shipping-progress-box">

                    <p>

                      Faltam

                      <strong>

                        {(shippingLimit-total).toLocaleString('pt-BR',{
                          style:'currency',
                          currency:'BRL'
                        })}

                      </strong>

                      para

                      <strong> Frete Grátis</strong>

                    </p>


                    <div className="progress-bar-bg">

                      <div
                        className="progress-bar-fill"
                        style={{
                          width:`${Math.min((total/shippingLimit)*100,100)}%`
                        }}
                      />

                    </div>

                  </div>

                )}

              </div>


              <div className="summary-divider"/>


              <div className="summary-total-row">

                <span>Total</span>

                <span className="final-value">

                  {finalTotal.toLocaleString('pt-BR',{
                    style:'currency',
                    currency:'BRL'
                  })}

                </span>

              </div>


              <div className="summary-actions">

                <Link to="/checkout" className="btn-checkout-full">
                  Finalizar Pedido
                </Link>

                <Link to="/catalog" className="btn-continue-shopping">
                  Continuar Comprando
                </Link>

              </div>


              <div className="trust-badges">
                <span>🔒 Pagamento Seguro</span>
                <span>↩️ Devolução em 7 dias</span>
              </div>

            </div>

          </aside>


        </div>

      </div>

    </main>

  )

}