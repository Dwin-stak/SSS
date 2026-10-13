# Gastos Tracker

App web para llevar el control de gastos e ingresos personales. Puedes registrar un gasto escribiéndolo en lenguaje natural (por ejemplo *"almuerzo 15.000 ayer"*) y la IA lo convierte en un registro con monto, categoría y fecha.

<!-- Agrega aquí una captura de pantalla: ![Captura](docs/captura.png) -->

## Funcionalidades

- Registrar, editar y eliminar gastos e ingresos.
- Escribir un gasto o ingreso en lenguaje natural y que la IA lo interprete.
- Dashboard con gráficas y balance (ingresos menos gastos).
- Categorías personalizables con emoji.
- Chat para hacerle preguntas a la IA sobre tus finanzas.

## Tecnologías

- **Frontend:** React 19, Vite, Recharts
- **Backend:** Node.js, Express, SQLite (`node:sqlite`)
- **IA:** API de Groq

## Cómo correrlo

Requisitos: Node.js 22.5 o superior y una API key gratis de [Groq](https://console.groq.com).

### 1. Backend

```bash
cd backend
npm install
```

Crea un archivo `backend/.env` con:

```
GROQ_API_KEY=tu_api_key
```

Luego:

```bash
npm run dev
```

El backend queda en `http://localhost:3001` y crea la base de datos `gastos.db` automáticamente.

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173`).

## Estructura

```
backend/
  src/server.js        Servidor Express y rutas
  src/db.js            Base de datos SQLite
  src/groq.js          Conexión con la IA
  src/routes/          Endpoints de gastos, ingresos, interpretación y chat
frontend/
  src/App.jsx          Pantalla principal
  src/Dashboard.jsx    Gráficas y resumen
  src/Ingresos.jsx     Manejo de ingresos
  src/Chat.jsx         Chat con la IA
```

## Próximos pasos

- Login de usuarios para que cada persona tenga sus propios datos.
- Publicarla en línea.
