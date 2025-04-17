# 🍔 My Gastronomy
Projeto full stack de um sistema de pedidos gastronômicos, com backend em Node.js/Express e frontend mobile usando Expo/React Native.

## 📦 Tecnologias
- Backend: Node.js, Express, MongoDB

- Frontend: React Native com Expo

- Banco de Dados: MongoDB

- Gerenciamento de Estado: (se estiver usando, ex: Redux, Context API)


## 🚀 Como rodar o projeto
Backend
Acesse a pasta do backend:

```bash
cd backend
Instale as dependências:
```

```bash
npm install
Configure as variáveis de ambiente no arquivo .env (exemplo abaixo):
```

```bash
MONGO_URI=your_mongodb_connection_string
PORT=3000
Inicie o servidor:
```

```bash
npm run dev
Frontend
Acesse a pasta do frontend:
```

```bash
cd frontend
Instale as dependências:

```bash
npm install
Inicie o projeto Expo:
```

```bash
npm run start
Ou, para rodar em plataformas específicas:
```

```bash
npm run android
npm run ios
npm run web
```
### Nota: Para rodar no iOS, é necessário estar em um macOS com Xcode instalado.

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


## 📄 Licença
Este projeto está licenciado sob a MIT License.