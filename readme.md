# 💰 MoneyFlow API

## 📌 Endpoints Principales
```plaintext
POST   /api/auth/login
GET    /api/transactions
POST   /api/transactions
```

## 🚀 Ejecución

### Con Docker
```bash
docker build -t moneyflow-backend .
docker run -p 3000:3000 --env-file .env moneyflow-backend
```

### Localmente
```bash
npm install
npm run dev  # Modo desarrollo con nodemon
```

## 🔧 Variables de Entorno (`.env`)
```env
DB_HOST=db
DB_USER=postgres
DB_PASSWORD=1234
JWT_SECRET=tu_clave_secreta
```

## 🧪 Testing
```bash
npm test
```

## 📊 Diagrama de Base de Datos
- Diagrama ER

## 📚 Documentación API
Para generar documentación Swagger en desarrollo:
```bash
npm run docs  # Genera docs en http://localhost:3000/api-docs
```

> 🛑 Importante: Requiere PostgreSQL 13+ en producción.
