import { useState, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { QRCodeCanvas } from "qrcode.react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { createOrder, patchProduct, getProductById } from "../services/api"
import { logActivity } from "../services/logService"
import "./Checkout.css"

function Field({ label, name, placeholder, value, onChange, onBlur, type = "text", errors }) {
  const hasError = errors[name]
  return (
    <div className={`field-group ${hasError ? "field-error" : ""}`}>
      <label className="field-label">{label}</label>
      <div className="field-wrapper">
        <input
          className="form-input"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
        {hasError && <span className="field-icon error-icon">!</span>}
      </div>
      {hasError && <span className="error-msg">{hasError}</span>}
    </div>
  )
}

function validateField(name, value) {
  switch (name) {
    case "name":
      if (!value.trim()) return "Nome obrigatório"
      return undefined
    case "email":
      if (!value.trim()) return "E-mail obrigatório"
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "E-mail inválido"
      return undefined
    case "cpf": {
      const raw = value.replace(/\D/g, "")
      if (!raw) return "CPF obrigatório"
      if (raw.length !== 11) return "CPF inválido"
      return undefined
    }
    case "cep": {
      const raw = value.replace(/\D/g, "")
      if (!raw) return "CEP obrigatório"
      if (raw.length < 8) return "CEP inválido"
      return undefined
    }
    case "address":
      if (!value.trim()) return "Endereço obrigatório"
      return undefined
    case "city":
      if (!value.trim()) return "Cidade obrigatória"
      return undefined
    case "state":
      if (!value.trim()) return "Estado obrigatório"
      return undefined
    case "cardNumber": {
      const raw = value.replace(/\D/g, "")
      if (!raw) return "Número do cartão obrigatório"
      if (raw.length < 13) return "Número inválido"
      return undefined
    }
    case "cardName":
      if (!value.trim()) return "Nome no cartão obrigatório"
      return undefined
    case "cardExpiry": {
      if (!value.trim()) return "Validade obrigatória"
      const clean = value.replace("/", "")
      if (clean.length < 4) return "Validade incompleta"
      const formatted = value.includes("/") ? value : `${clean.slice(0, 2)}/${clean.slice(2)}`
      if (!/^\d{2}\/\d{2}$/.test(formatted)) return "Formato MM/AA"
      const mm = parseInt(formatted.split("/")[0])
      if (mm < 1 || mm > 12) return "Mês inválido"
      return undefined
    }
    case "cardCvv":
      if (!value.trim()) return "CVV obrigatório"
      if (value.length < 3) return "CVV inválido"
      return undefined
    default:
      return undefined
  }
}

function validateAll(form, step, isOnlyDigital) {
  const errors = {}
  if (step === 0) {
    const baseFields = ["name", "email", "cpf"]
    baseFields.forEach(f => {
      const err = validateField(f, form[f])
      if (err) errors[f] = err
    })
    
    if (!isOnlyDigital && form.deliveryMethod === "delivery") {
      ["cep", "address", "city", "state"].forEach(f => {
        const err = validateField(f, form[f])
        if (err) errors[f] = err
      })
    }
  }
  if (step === 1 && form.paymentMethod === "credit") {
    ["cardNumber", "cardName", "cardExpiry", "cardCvv"].forEach(f => {
      const err = validateField(f, form[f])
      if (err) errors[f] = err
    })
  }
  return errors
}

const STORE_ADDRESS = "Rua das Flores, 123 — Centro, São Paulo/SP"

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const { isLoggedIn, isAdmin, user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [processing, setProcessing] = useState(false)
  const [order, setOrder] = useState(null)
  const [errors, setErrors] = useState({})
  const [cepLoading, setCepLoading] = useState(false)
  const [pixCopied, setPixCopied] = useState(false)
  const [orderItems, setOrderItems] = useState([])
  const [orderTotal, setOrderTotal] = useState(0)

  const [form, setFormState] = useState({
    name: "", email: "", cpf: "", cep: "",
    address: "", number: "", complement: "", city: "", state: "",
    deliveryMethod: "delivery", paymentMethod: "credit",
    cardNumber: "", cardName: "", cardExpiry: "", cardCvv: ""
  })

  const cepTimer = useRef(null)
  const pixKey = "b1c6b3d1-4bda-4b28-8f3e-6f4c3e1a22c1"

  const isOnlyDigital = items.length > 0 && items.every(item => item.type === "E-book")
  const isPickup = form.deliveryMethod === "pickup"

  const set = field => e => {
    setFormState(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const blur = field => e => {
    const err = validateField(field, e.target.value)
    setErrors(prev => ({ ...prev, [field]: err }))
  }

  const maskCPF = v =>
    v.replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")

  const maskCard = v =>
    v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19)

  const maskCEP = v =>
    v.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9)

  function detectBrand(num) {
    const n = num.replace(/\D/g, "")
    if (/^4011|4312|4389/.test(n)) return { name: "Elo", color: "#ffcb00" }
    if (/^4/.test(n)) return { name: "Visa", color: "#1a1fee" }
    if (/^5[1-5]/.test(n)) return { name: "Mastercard", color: "#eb001b" }
    return null
  }

  async function buscarCEP(raw) {
    if (raw.length < 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
      const data = await res.json()
      if (data.erro) {
        setErrors(prev => ({ ...prev, cep: "CEP não encontrado" }))
      } else {
        setFormState(f => ({
          ...f,
          address: data.logradouro || f.address,
          city: data.localidade || f.city,
          state: data.uf || f.state
        }))
        setErrors(prev => ({ ...prev, cep: undefined, address: undefined, city: undefined, state: undefined }))
      }
    } catch {
      setErrors(prev => ({ ...prev, cep: "Erro ao buscar CEP" }))
    } finally {
      setCepLoading(false)
    }
  }

  function handleGoToPayment() {
    const errs = validateAll(form, 0, isOnlyDigital)
    setErrors(errs)
    if (Object.keys(errs).length === 0) {
      setErrors({})
      setStep(1)
    }
  }

  async function handlePlaceOrder() {
    if (!isLoggedIn) { navigate("/login"); return }

    if (form.paymentMethod === "credit") {
      const errs = validateAll(form, 1, isOnlyDigital)
      setErrors(errs)
      if (Object.keys(errs).length > 0) return
    }

    setProcessing(true)
    try {
      await Promise.all(
        items.map(async item => {
          const res = await getProductById(Number(item.id))
          const newStock = Math.max(0, res.data.stock - item.quantity)
          return patchProduct(item.id, { stock: newStock })
        })
      )


      const shipping = (isPickup || isOnlyDigital) ? 0 : (total >= 150 ? 0 : 19.9)
      const finalTotal = total + shipping

      const newOrder = {
        date: new Date().toISOString(),
        customer: form.name,
        userEmail: form.email,
        userId: user.id,
        items,
        downloads: items
          .filter(i => i.type === "E-book")
          .map(i => ({ title: i.title, link: `/downloads/${i.id}.pdf` })),
        total: finalTotal,

        status: isOnlyDigital ? "Concluído" : "Aprovado", 
        paymentMethod: form.paymentMethod === "credit" ? "Cartão" : "PIX",

        deliveryMethod: isOnlyDigital ? "Digital" : (isPickup ? "Retirada" : "Entrega"),

        ...( (isPickup || isOnlyDigital) ? {} : {
          address: `${form.address}, ${form.number}${form.complement ? ` - ${form.complement}` : ""}, ${form.city}/${form.state} — CEP ${form.cep}`
        })
      }

      const res = await createOrder(newOrder)
      await logActivity(`Pedido #${res.data.id} criado`)

      setOrderItems([...items])
      setOrderTotal(finalTotal)
      setOrder(res.data)
      setStep(2)
      clearCart()

    } catch {
      alert("Erro ao processar pedido")
    } finally {
      setProcessing(false)
    }
  }

  
  const shipping = (isPickup || isOnlyDigital) ? 0 : (total >= 150 ? 0 : 19.9)
  const finalTotal = total + shipping
  const brand = detectBrand(form.cardNumber)
  const steps = ["Dados", "Pagamento", "Confirmação"]

  const orderSubtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const orderShipping = orderTotal - orderSubtotal

  return (
    <div className="checkout-page">
      <div className="container">

        
        <div className="progress-bar">
          {steps.map((s, i) => (
            <div key={s} className={`progress-step ${i < step ? "done" : ""} ${i === step ? "active" : ""}`}>
              <div className="step-circle">
                {i < step ? <span>✓</span> : <span>{i + 1}</span>}
              </div>
              <span className="step-label">{s}</span>
              {i < steps.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="form-col">

            
            {step === 0 && (
              <div className="form-section">
                <h2><span className="section-num">01</span> Seus dados</h2>

                
                {!isOnlyDigital && (
                  <>
                    <div className="delivery-methods">
                      <button
                        className={`delivery-btn ${form.deliveryMethod === "delivery" ? "active" : ""}`}
                        onClick={() => {
                          setFormState(f => ({ ...f, deliveryMethod: "delivery" }))
                          setErrors({})
                        }}
                      >
                        <span className="delivery-icon">🚚</span>
                        <div>
                          <span className="delivery-label">Entrega</span>
                          <span className="delivery-sub">Receba em casa</span>
                        </div>
                      </button>
                      <button
                        className={`delivery-btn ${form.deliveryMethod === "pickup" ? "active" : ""}`}
                        onClick={() => {
                          setFormState(f => ({ ...f, deliveryMethod: "pickup" }))
                          setErrors({})
                        }}
                      >
                        <span className="delivery-icon">🏪</span>
                        <div>
                          <span className="delivery-label">Retirar na loja</span>
                          <span className="delivery-sub">Grátis · Pronto em 2h</span>
                        </div>
                      </button>
                    </div>

                  
                    {isPickup && (
                      <div className="pickup-info">
                        <p className="pickup-title">📍 Endereço da loja</p>
                        <p className="pickup-address">{STORE_ADDRESS}</p>
                        <p className="pickup-hours">🕐 Seg–Sex 9h–18h · Sáb 9h–13h</p>
                      </div>
                    )}
                  </>
                )}

                
                <div className="two-col">
                  <Field
                    label="Nome completo *" name="name" placeholder="Ex: João Silva"
                    value={form.name} onChange={set("name")} onBlur={blur("name")} errors={errors}
                  />
                  <Field
                    label="E-mail *" name="email" placeholder="joao@email.com" type="email"
                    value={form.email} onChange={set("email")} onBlur={blur("email")} errors={errors}
                  />
                </div>

                <Field
                  label="CPF *" name="cpf" placeholder="000.000.000-00"
                  value={maskCPF(form.cpf)}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 11)
                    setFormState(f => ({ ...f, cpf: raw }))
                    if (errors.cpf) setErrors(p => ({ ...p, cpf: undefined }))
                  }}
                  onBlur={e => {
                    const raw = e.target.value.replace(/\D/g, "")
                    setErrors(p => ({ ...p, cpf: validateField("cpf", raw) }))
                  }}
                  errors={errors}
                />

               
                {!isOnlyDigital && !isPickup && (
                  <>
                    <div className="two-col">
                      <div style={{ position: "relative" }}>
                        <Field
                          label="CEP *" name="cep" placeholder="00000-000"
                          value={maskCEP(form.cep)}
                          onChange={e => {
                            const raw = e.target.value.replace(/\D/g, "").slice(0, 8)
                            setFormState(f => ({ ...f, cep: raw }))
                            if (errors.cep) setErrors(p => ({ ...p, cep: undefined }))
                            clearTimeout(cepTimer.current)
                            if (raw.length === 8) {
                              cepTimer.current = setTimeout(() => buscarCEP(raw), 400)
                            }
                          }}
                          onBlur={e => {
                            const raw = e.target.value.replace(/\D/g, "")
                            setErrors(p => ({ ...p, cep: validateField("cep", raw) }))
                            if (raw.length === 8) buscarCEP(raw)
                          }}
                          errors={errors}
                        />
                        {cepLoading && (
                          <span style={{ fontSize: 11, color: "var(--accent)", marginTop: 4, display: "block" }}>
                            Buscando CEP...
                          </span>
                        )}
                      </div>
                      <Field
                        label="Número" name="number" placeholder="123"
                        value={form.number} onChange={set("number")} onBlur={() => {}} errors={errors}
                      />
                    </div>

                    <Field
                      label="Endereço *" name="address" placeholder="Rua, Av..."
                      value={form.address} onChange={set("address")} onBlur={blur("address")} errors={errors}
                    />

                    <Field
                      label="Complemento" name="complement" placeholder="Apto, Bloco, Casa..."
                      value={form.complement} onChange={set("complement")} onBlur={() => {}} errors={errors}
                    />

                    <div className="two-col">
                      <Field
                        label="Cidade *" name="city" placeholder="São Paulo"
                        value={form.city} onChange={set("city")} onBlur={blur("city")} errors={errors}
                      />
                      <Field
                        label="Estado *" name="state" placeholder="SP"
                        value={form.state} onChange={set("state")} onBlur={blur("state")} errors={errors}
                      />
                    </div>
                  </>
                )}

                <button className="btn-primary" onClick={handleGoToPayment}>
                  <span>Continuar para pagamento</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="form-section">
                <button className="btn-back" onClick={() => { setErrors({}); setStep(0) }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </button>
                <h2><span className="section-num">02</span> Pagamento</h2>

                <div className="payment-methods">
                  {[
                    { id: "credit", label: "Cartão de Crédito", icon: "💳" },
                    { id: "pix", label: "PIX", icon: "⚡" }
                  ].map(m => (
                    <button
                      key={m.id}
                      className={`method-btn ${form.paymentMethod === m.id ? "active" : ""}`}
                      onClick={() => { setFormState(f => ({ ...f, paymentMethod: m.id })); setErrors({}) }}
                    >
                      <span className="method-icon">{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {form.paymentMethod === "credit" && (
                  <div className="card-form">
                    <div className="card-preview">
                      <div className="card-chip" />
                      <div className="card-num-preview">
                        {maskCard(form.cardNumber) || "•••• •••• •••• ••••"}
                      </div>
                      <div className="card-bottom">
                        <div>
                          <span className="card-label-sm">Titular</span>
                          <span className="card-val">{form.cardName || "NOME NO CARTÃO"}</span>
                        </div>
                        <div>
                          <span className="card-label-sm">Validade</span>
                          <span className="card-val">{form.cardExpiry || "MM/AA"}</span>
                        </div>
                        {brand && (
                          <span className="card-brand-badge" style={{ color: brand.color }}>
                            {brand.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <Field
                      label="Número do cartão *" name="cardNumber" placeholder="0000 0000 0000 0000"
                      value={maskCard(form.cardNumber)}
                      onChange={e => {
                        const raw = e.target.value.replace(/\D/g, "").slice(0, 16)
                        setFormState(f => ({ ...f, cardNumber: raw }))
                        if (errors.cardNumber) setErrors(p => ({ ...p, cardNumber: undefined }))
                      }}
                      onBlur={e => {
                        const raw = e.target.value.replace(/\D/g, "")
                        setErrors(p => ({ ...p, cardNumber: validateField("cardNumber", raw) }))
                      }}
                      errors={errors}
                    />

                    <Field
                      label="Nome no cartão *" name="cardName" placeholder="Como aparece no cartão"
                      value={form.cardName}
                      onChange={e => {
                        setFormState(f => ({ ...f, cardName: e.target.value.toUpperCase() }))
                        if (errors.cardName) setErrors(p => ({ ...p, cardName: undefined }))
                      }}
                      onBlur={blur("cardName")}
                      errors={errors}
                    />

                    <div className="two-col">
                      <Field
                        label="Validade *" name="cardExpiry" placeholder="MM/AA"
                        value={form.cardExpiry}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, "").slice(0, 4)
                          const formatted = raw.length >= 3
                            ? `${raw.slice(0, 2)}/${raw.slice(2)}`
                            : raw
                          setFormState(f => ({ ...f, cardExpiry: formatted }))
                          if (errors.cardExpiry) setErrors(p => ({ ...p, cardExpiry: undefined }))
                        }}
                        onBlur={e => {
                          setErrors(p => ({ ...p, cardExpiry: validateField("cardExpiry", e.target.value) }))
                        }}
                        errors={errors}
                      />
                      <Field
                        label="CVV *" name="cardCvv" placeholder="•••" type="password"
                        value={form.cardCvv}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, "").slice(0, 4)
                          setFormState(f => ({ ...f, cardCvv: raw }))
                          if (errors.cardCvv) setErrors(p => ({ ...p, cardCvv: undefined }))
                        }}
                        onBlur={blur("cardCvv")}
                        errors={errors}
                      />
                    </div>
                  </div>
                )}

                {form.paymentMethod === "pix" && (
                  <div className="pix-section">
                    <p className="pix-title">Escaneie o QR Code com seu app de banco</p>
                    <div className="pix-qr-container">
                      <QRCodeCanvas value={`PIX|${pixKey}|${finalTotal}`} size={180} />
                    </div>
                    <p className="pix-or">ou copie a chave PIX</p>
                    <div className="pix-copy-box">
                      <span className="pix-key-text">{pixKey}</span>
                      <button
                        className={`btn-copy ${pixCopied ? "copied" : ""}`}
                        onClick={() => {
                          navigator.clipboard.writeText(pixKey)
                          setPixCopied(true)
                          setTimeout(() => setPixCopied(false), 2000)
                        }}
                      >
                        {pixCopied ? "✓ Copiado!" : "Copiar"}
                      </button>
                    </div>
                    <p className="pix-info">⏱ O QR Code expira em <strong>30 minutos</strong></p>
                  </div>
                )}

                <button className="btn-primary" onClick={handlePlaceOrder} disabled={processing}>
                  {processing
                    ? <><span className="spinner" /> Processando...</>
                    : <>
                        <span>Confirmar pagamento · R$ {finalTotal.toFixed(2)}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </>
                  }
                </button>

                <p className="security-note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Pagamento 100% seguro e criptografado
                </p>
              </div>
            )}

            {step === 2 && order && (
              <div className="form-section success-section">
                <div className="success-icon">✓</div>
                <h2>Pedido confirmado!</h2>
                <p className="success-sub">Pedido <strong>#{order.id}</strong> realizado com sucesso.</p>
                <p className="success-email">
                  Um e-mail de confirmação foi enviado para <strong>{form.email}</strong>
                </p>

                {order.deliveryMethod === "Retirada" && (
                  <div className="pickup-info">
                    <p className="pickup-title">📍 Retire seu pedido em</p>
                    <p className="pickup-address">{STORE_ADDRESS}</p>
                    <p className="pickup-hours">🕐 Seg–Sex 9h–18h · Sáb 9h–13h</p>
                  </div>
                )}

                {order.downloads?.length > 0 && (
                  <div className="downloads-section">
                    <h3>Seus downloads</h3>
                    {order.downloads.map(d => (
                      <div key={d.title} className="download-item">
                        <span>📄 {d.title}</span>
                        <a href={d.link} className="btn-download">Baixar PDF</a>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  to={isAdmin ? "/admin/orders" : "/orders"}
                  className="btn-primary"
                  style={{ textDecoration: "none", display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  Ver meus pedidos
                </Link>
              </div>
            )}
          </div>

  
          <aside className="order-summary">
            <h3 className="summary-title">Resumo do pedido</h3>

            <div className="summary-items">
              {(step === 2 ? orderItems : items).map(i => (
                <div key={i.id} className="order-item">
                  <img src={i.image} className="order-item-img" alt={i.title} />
                  <div className="order-item-info">
                    <p className="item-name">{i.title}</p>
                    <p className="item-qty">{i.quantity}x</p>
                    <p className="item-price">R$ {(i.price * i.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            {step === 2 ? (
              <>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>R$ {orderSubtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Frete</span>
                  <span className={orderShipping === 0 ? "free-shipping" : ""}>
                    {orderShipping === 0 ? "Grátis" : `R$ ${orderShipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Entrega</span>
                  <span>{order?.deliveryMethod}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-total">
                  <span>Total</span>
                  <span>R$ {orderTotal.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Frete</span>
                  <span className={shipping === 0 ? "free-shipping" : ""}>
                    {isOnlyDigital
                      ? "Envio digital"
                      : isPickup
                        ? "Grátis (retirada)"
                        : shipping === 0
                          ? "Grátis"
                          : `R$ ${shipping.toFixed(2)}`}
                  </span>
                </div>
                {!isOnlyDigital && !isPickup && shipping > 0 && (
                  <p className="free-hint">Faltam R$ {(150 - total).toFixed(2)} para frete grátis</p>
                )}
                <div className="summary-divider" />
                <div className="summary-total">
                  <span>Total</span>
                  <span>R$ {finalTotal.toFixed(2)}</span>
                </div>
              </>
            )}

            <div className="summary-badges">
              <span>Compra segura</span>
              {isOnlyDigital
                ? <span>Envio imediato</span>
                : isPickup
                  ? <span>🏪 Retirada em 2h</span>
                  : <span>🚚 Entrega rastreada</span>
              }
              <span>↩️ 30 dias para troca</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}