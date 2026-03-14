# ⬡ Synapse Books — Loja de Livros de IA

Loja virtual completa para uma editora de livros de Inteligência Artificial.

## 🚀 Stack

- **Frontend**: React 18 + Vite
- **Backend**: JSON Server (mock API)
- **Estilo**: CSS customizado com design system dark
- **Roteamento**: React Router v6
- **HTTP**: Axios
- **Estado do Carrinho**: React Context + useReducer

---

## 📁 Estrutura de Pastas

```
ai-bookstore/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Router + Layout
    ├── styles/
    │   └── globals.css       # Design system global
    ├── context/
    │   └── CartContext.jsx   # Carrinho (Context + Reducer)
    ├── services/
    │   └── api.js            # Axios + rotas da API
    ├── data/
    │   └── db.json           # Mock database (JSON Server)
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx
    │   │   └── Navbar.css
    │   └── product/
    │       ├── ProductCard.jsx
    │       └── ProductCard.css
    └── pages/
        ├── Home.jsx / Home.css
        ├── Catalog.jsx / Catalog.css
        ├── ProductDetail.jsx / ProductDetail.css
        ├── Cart.jsx / Cart.css
        ├── Checkout.jsx / Checkout.css
        ├── Orders.jsx / Orders.css
        └── Admin.jsx / Admin.css
```

---

## ⚙️ Instalação e Execução

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar o projeto completo (Frontend + API)

```bash
npm run dev
```

Isso inicia:
- **Frontend**: http://localhost:5173
- **JSON Server (API)**: http://localhost:3001

### 3. Rodar separadamente (opcional)

```bash
# Só o frontend
npx vite

# Só a API mock
npm run server
```

---

## 🔌 Rotas da API Mock

| Método | Rota               | Descrição              |
|--------|--------------------|------------------------|
| GET    | /api/products      | Listar todos os livros |
| GET    | /api/products/:id  | Detalhes de um livro   |
| POST   | /api/products      | Criar livro (admin)    |
| PUT    | /api/products/:id  | Editar livro (admin)   |
| DELETE | /api/products/:id  | Remover livro (admin)  |
| GET    | /api/orders        | Listar pedidos         |
| POST   | /api/orders        | Criar pedido           |

> O Vite proxy redireciona `/api/*` para `http://localhost:3001/*`

---

## 📄 Páginas

| Rota           | Descrição                         |
|----------------|-----------------------------------|
| `/`            | Home com hero, categorias e CTA   |
| `/catalog`     | Catálogo com busca, filtros, sort |
| `/product/:id` | Detalhe do livro + relacionados   |
| `/cart`        | Carrinho com controle de qtd      |
| `/checkout`    | Checkout em 3 etapas (mock)       |
| `/orders`      | Histórico de pedidos              |
| `/admin`       | CRUD de produtos                  |

---

## ✨ Funcionalidades

- ✅ Catálogo com 12 livros mockados de IA
- ✅ Filtro por categoria e busca por título/autor
- ✅ Ordenação por preço e rating
- ✅ Detalhe do produto com livros relacionados
- ✅ Carrinho persistente via Context API
- ✅ Checkout mock em 3 etapas (dados → pagamento → confirmação)
- ✅ PIX, Cartão de Crédito e Boleto (simulados)
- ✅ Frete grátis automático acima de R$150
- ✅ Histórico de pedidos com expandir/recolher
- ✅ Admin completo: criar, editar, remover produtos
- ✅ Design dark mode moderno e responsivo
- ✅ Animações e feedback visual

---

## 🎨 Design

- **Tema**: Dark mode premium
- **Cores**: Fundo `#0a0a0f`, Accent `#6c63ff` (violeta), `#ff6584` (rosa)
- **Fontes**: Syne (display/títulos) + DM Sans (corpo)
- **Layout**: Responsivo com grid adaptável

---

## 📦 Dependências Principais

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.27.0",
  "axios": "^1.7.7",
  "json-server": "^0.17.4",
  "concurrently": "^9.1.0",
  "vite": "^5.4.10"
}
```
