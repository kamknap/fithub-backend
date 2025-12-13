# 🏋️ FitHub Backend

REST API dla aplikacji mobilnej FitHub - system zarządzania treningami, dietą i postępami w fitness.

## 🔒 Zabezpieczenia

Backend wykorzystuje **Firebase Authentication** do weryfikacji użytkowników. Każdy request do zabezpieczonych endpointów wymaga **Firebase ID Token** w headerze `Authorization`.

### Wymagania:
- Firebase Admin SDK
- Token weryfikowany na poziomie middleware
- Wszystkie endpointy chronione przed nieautoryzowanym dostępem

## 🚀 Szybki start

### 1. Instalacja zależności

```bash
npm install
```

### 2. Konfiguracja zmiennych środowiskowych

Skopiuj plik `.env.example` jako `.env` i wypełnij:

```bash
cp .env.example .env
```

Wymagane zmienne:
- `MONGODB_URI` - Connection string do MongoDB
- `FIREBASE_PROJECT_ID` - ID projektu Firebase
- `FIREBASE_CLIENT_EMAIL` - Email service account
- `FIREBASE_PRIVATE_KEY` - Klucz prywatny Firebase

### 3. Uruchom serwer

```bash
# Development
npm run dev

# Production
npm start
```

## 📚 Dokumentacja

- **[AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)** - Kompletny guide wdrożenia na Azure Container Apps
- **[ANDROID_INTEGRATION.md](ANDROID_INTEGRATION.md)** - Instrukcje integracji z aplikacją Android

## 🔐 Przykład użycia API

```bash
# Pobierz Firebase ID Token z aplikacji Android
curl -H "Authorization: Bearer <your_firebase_id_token>" \
  http://localhost:4000/api/users
```

## 🛠️ Stack technologiczny

- **Node.js** + **Express** - Backend framework
- **MongoDB** + **Mongoose** - Baza danych
- **Firebase Admin SDK** - Autentykacja
- **Docker** - Konteneryzacja
- **Azure Container Apps** - Hosting

## 📦 Struktura projektu

```
src/
├── config/          # Konfiguracja (Firebase)
├── controllers/     # Logika biznesowa
├── middleware/      # Auth middleware
├── models/          # Modele Mongoose
├── routes/          # Definicje tras
├── db.js           # Połączenie z MongoDB
└── server.js       # Entry point
```

## 🔥 Features

✅ Firebase Authentication integration  
✅ JWT token verification  
✅ MongoDB integration  
✅ CORS configuration  
✅ Docker support  
✅ Azure Container Apps ready  
✅ Health check endpoint  

## 📝 License

ISC
