# COMPIA Editora – Loja Virtual de Livros de Inteligência Artificial

Este é um projeto de **Loja Virtual para Editoras da Área de Inteligência Artificial**, desenvolvido para a disciplina **Programação para Web I**, do curso de **Ciência da Computação – UFCG**.

A plataforma foi desenvolvida para permitir que a **COMPIA Editora** comercialize livros físicos e digitais relacionados à área de Inteligência Artificial, oferecendo uma experiência simples de compra para clientes e um painel de gerenciamento acessível para administradores.

---

# Desenvolvedor

Pedro Henrique Sarmento Pereira

---

# Objetivo

Desenvolver uma plataforma de **e-commerce para a editora COMPIA**, permitindo a venda de itens como **livros físicos e digitais** de forma simples, organizada e acessível.

A plataforma foi pensada para:

* Permitir **gerenciamento fácil por pessoas sem conhecimento técnico**
* Simular **pagamentos com cartão e PIX**
* Oferecer **múltiplas formas de distribuição dos produtos**

---

# Motivação

A editora **COMPIA** não possui atualmente uma plataforma digital para comercialização de seus materiais.

Com este projeto, busca-se disponibilizar um ambiente virtual onde seja possível vender e distribuir conteúdos relacionados à área de **Inteligência Artificial e Computação**.

---

# Público-Alvo

* Estudantes da área de Computação
* Profissionais de Tecnologia da Informação
* Pesquisadores em Inteligência Artificial
* Pessoas interessadas em adquirir materiais especializados em IA

---

# Principais Funcionalidades

## Gestão de Catálogo de Produtos

* Cadastro, edição e exclusão de produtos
* Organização por categorias
* Exibição de imagens, descrições e preços
* Controle de estoque de livros

## Carrinho de Compras

* Adição e remoção de produtos
* Alteração de quantidade
* Visualização do total da compra

## Checkout Simulado

* Processo simplificado de finalização de compra
* Simulação de cálculo de frete e impostos
* Interface responsiva

## Opções de Pagamento (Simulado)

* Cartão de Crédito
* PIX

## Gestão de Pedidos

* Área para visualizar pedidos realizados
* Histórico de compras para o usuário
* Painel administrativo para acompanhamento de pedidos

## Painel Administrativo

* Gerenciamento de produtos
* Gerenciamento de usuários
* Visualização de pedidos
* Registro de logs do sistema

## Distribuição Simulada

* Entrega de livros físicos
* Retirada no local
* Download de livros digitais

---

# Tecnologias Utilizadas

**Frontend**

* React
* Vite

**Estilização**

* CSS

**Backend (Simulado)**

* json-server

**Comunicação com API**

* Fetch API

---

# Como Rodar o Projeto

## Pré-requisitos

É necessário ter instalado:

* Node.js
* npm

---

# Backend (API Falsa)

Abra um terminal e navegue até a pasta raiz do projeto:

```
cd compia-editora
```

Execute o servidor mock:

```
npx json-server --watch src/data/db.json --port 3001
```

O backend estará disponível em:

```
http://localhost:3001
```

---

# Frontend

Abra **outro terminal**.

Vá até a pasta do projeto:

```
cd compia-editora
```

Instale as dependências:

```
npm install
```

Execute a aplicação:

```
npm run dev
```

A aplicação estará disponível em:

```
http://localhost:5173
```

---

# Credenciais de Acesso (Simulado)

## Administrador

Email:

```
admin@compia.com
```

Senha:

```
admin123
```

---

## Cliente

Email:

```
joao@email.com
```

Senha:

```
123456
```

---

# Sobre a COMPIA Editora

A **COMPIA Editora** é uma iniciativa voltada para a publicação e disseminação de conteúdos de alta qualidade na área de **Inteligência Artificial**.

Seu objetivo é oferecer materiais que auxiliem estudantes e profissionais a aprofundarem seus conhecimentos em áreas como:

* Inteligência Artificial
* Arquitetura de Software
* Blockchain
* Criptografia
* Cibersegurança

A editora busca unir **rigor técnico com linguagem acessível**, aproximando o meio acadêmico do mercado de trabalho e incentivando a produção de conhecimento tecnológico.

---

# Resultados Esperados

Ao final do desenvolvimento da plataforma, espera-se disponibilizar:

* Uma **loja virtual funcional**
* Sistema de **gestão de produtos e pedidos**
* Ambiente simples para **compra de livros físicos e digitais**
* Plataforma preparada para apoiar futuras campanhas de vendas da editora
