# 🍔 My Gastronomy
Projeto full stack de um sistema de pedidos gastronômicos, com backend em Node.js/Express e frontend mobile usando Expo/React Native.

## 📦 Tecnologias
- Backend: Node.js, Express, MongoDB

- Frontend: React Native com Expo

- Banco de Dados: MongoDB

- Gerenciamento de Estado: (se estiver usando, ex: Redux, Context API)


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

## 📁 Estrutura do Projeto
```bash
Gastronomy-Final/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── ...
│   └── ...
├── frontend/
│   ├── app/
│   │   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   └── ...
│   ├── assets/
│   ├── components/
│   └── ...
└── README.md
```

## 📄 Licença
Este projeto está licenciado sob a MIT License.
