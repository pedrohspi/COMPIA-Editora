# COMPIA Editora

Este é um projeto de **Loja Virtual para a Editora COMPIA**, desenvolvido para a disciplina **Programação para Web I**, do curso de **Ciência da Computação – UFCG**.

O objetivo é criar uma plataforma de **e-commerce funcional** para venda de **livros físicos e digitais da área de Inteligência Artificial**.

---

# Desenvolvedor

Pedro Henrique Sarmento Pereira

---

# Funcionalidades

A plataforma implementa as seguintes funcionalidades:

**Gestão de Catálogo**
Visualização de livros com organização por categorias, incluindo descrição, preço e estoque.

**Carrinho de Compras**
Adição e remoção de produtos, com controle de quantidade.

**Checkout Simulado**
Fluxo simples de finalização de compra com cálculo simulado de frete.

**Opções de Pagamento**
Interface simulada para pagamento com **Cartão de Crédito** e **PIX**.

**Gerenciamento de Produtos (Admin)**
Painel administrativo para **cadastrar, editar e excluir produtos**.

**Gestão de Pedidos**

* Área para o administrador acompanhar pedidos.
* Área do cliente para visualizar o histórico de compras.

**Distribuição Simulada**

* Entrega de livros físicos.
* Download de livros digitais após a compra.

---

# Tecnologias Utilizadas

**Frontend:** React + Vite
**Estilização:** CSS
**Backend (Simulado):** json-server
**Comunicação com API:** Fetch API

---

# Como Rodar o Projeto

## Pré-requisitos

* Node.js
* json-server instalado globalmente

```bash
npm install -g json-server
```

---

## Backend (API Simulada)

Execute em um terminal:

```bash
npx json-server --watch src/data/db.json --port 3001
```

A API estará disponível em:

```
http://localhost:3001
```

---

## Frontend

Abra outro terminal na pasta do projeto.

Instale as dependências:

```bash
npm install
```

Inicie a aplicação:

```bash
npm run dev
```

A aplicação abrirá em:

```
http://localhost:5173
```

---

# Credenciais de Acesso (Simulado)

### Administrador

Email:
[admin@compia.com](mailto:admin@compia.com)

Senha:
admin123

---

### Cliente

Email:
[joao@email.com](mailto:joao@email.com)

Senha:
123456
