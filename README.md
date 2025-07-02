# 🍔 My Gastronomy
Sistema Full Stack para gestão de pedidos gastronômicos. A aplicação permite que clientes façam pedidos online, escolham pratos e acompanhem o status, enquanto administradores podem gerenciar o cardápio, termos de uso e preferências de privacidade.

## 💡 Descrição
Este projeto foi desenvolvido como parte do curso de Análise e Desenvolvimento de Sistemas da FATEC. A proposta é construir uma plataforma intuitiva, responsiva e escalável para controle de pedidos em um restaurante.

#### O sistema possui:

- 📱 Frontend web desenvolvido com React + Vite.

- 🔗 Backend em Node.js + Express.

- 🗄️ Banco de dados MongoDB para armazenamento das informações.

## 🔥 Features
- 📋 Cadastro e autenticação de usuários.

- 🍽️ Listagem e visualização dos pratos disponíveis.

- 🛒 Realização de pedidos e acompanhamento de status (Pendente, Concluído, Cancelado).

- 🔐 Aceite de termos de uso e gerenciamento de preferências de privacidade.

- 👨‍💼 Dashboard administrativo para:

  - Gerenciamento de usuários.

  - Controle dos termos de uso e privacidade.

  - Visualização de usuários que aceitaram ou recusaram seções opcionais dos termos.

## 🧠 Tecnologias Utilizadas

### 🔙 Backend:
- Node.js

- Express

- MongoDB + Mongoose

- CORS

- Dotenv (Variáveis de ambiente)

- JWT (Autenticação)

## Link para notificar o usuário

https://github.com/felipereira10/Gastronomy-Final/tree/enzo

### 🔥 Frontend (Web)
- React com Vite

- React Router DOM

- Context API (Gerenciamento de estado)

- React Icons

- Material UI (Componentização)

- CSS Modules

### 🗄️ Banco de Dados
- MongoDB Atlas


## 🚀 Como rodar o projeto
Backend
1. Acesse a pasta do backend:

```bash
cd backend
```
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente no arquivo .env (exemplo abaixo):

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
JWT_SECRET=your_secret
```

4. Inicie o servidor:

```bash
npm run dev
```

### Frontend
1. Acesse a pasta do frontend:

```bash
cd frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o projeto Vite:

```bash
npm run dev
```
4. Acesso no navegador:
5. 
```bash
http://localhost:5173
```

## 📁 Estrutura do Projeto
```bash
Gastronomy-Final/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── database/
│   ├── .env
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── ...
└── README.md
```

## 🎨 Demonstração
### Em Desenvolvimento...


## 🛠️ Melhorias Futuras
- Integração com métodos de pagamento.

- Histórico de pedidos para o usuário.

- Upload de imagem para pratos.

- Dashboard mais completo para administradores.

- Validações e testes automatizados.

## 📄 Licença
Este projeto está licenciado sob a MIT License.
