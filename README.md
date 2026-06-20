# Voice Ordering System for Restaurants

An AI-assisted restaurant ordering system built for a Swedish/Nordic fast-food style workflow. Customers can order through a phone-like voice screen or text chat, while staff can manage incoming orders from a simple kitchen dashboard.

The demo data is currently based on JAFS Gressvik, but the menu, restaurant details, prompts, and branding can be adapted for any restaurant, takeaway, cafe, or AI agent ordering use case.

![Voice call module](./docs/call-module.png)

## What It Does

- Lets customers place orders through a voice-call style interface.
- Supports text chat ordering with quick action buttons.
- Uses AI to understand menu questions, item choices, sizes, confirmations, and simple follow-up questions.
- Creates digital orders with totals, customer/session context, and conversation transcripts.
- Shows a staff dashboard with order stages: new, preparing, ready, and completed.
- Generates a receipt modal that can be printed after an order is confirmed.
- Provides fallback local responses when the AI token is not configured, so the demo can still run.

## Main Screens

- `Chat` - customer text ordering with suggested actions and an order summary.
- `Call` - phone-style voice ordering using browser speech recognition and text-to-speech.
- `Menu` - searchable restaurant menu grouped by category.
- `Admin` - kitchen/order dashboard for changing order status.

## Tech Stack

Frontend:

- React 18
- Vite
- Tailwind CSS
- React Router
- Lucide React icons
- Web Speech API for speech recognition
- ElevenLabs text-to-speech, with browser speech synthesis fallback

Backend:

- Node.js
- Express.js
- GitHub Models through Azure AI Inference SDK
- In-memory order and transcript storage for local demo mode
- Optional MongoDB connection placeholder for production persistence

## Project Structure

```text
.
+-- backend/
|   +-- data/
|   |   +-- menu.js                  # Restaurant menu and helper functions
|   +-- routes/
|   |   +-- chat.js                  # AI conversation endpoints
|   |   +-- menu.js                  # Menu endpoints
|   |   +-- orders.js                # Order management endpoints
|   |   +-- transcripts.js           # Conversation transcript endpoints
|   +-- services/
|   |   +-- aiService.js             # AI prompt, fallback logic, session context
|   |   +-- orderService.js          # Order storage, status updates, receipts
|   +-- .env.example
|   +-- package.json
|   +-- server.js
+-- frontend/
|   +-- src/
|   |   +-- components/              # Receipt, order summary, chat UI pieces
|   |   +-- hooks/                   # Chat and voice hooks
|   |   +-- pages/                   # Chat, call, menu, admin pages
|   |   +-- utils/api.js             # API client helpers
|   |   +-- App.jsx
|   |   +-- index.css
|   |   +-- main.jsx
|   +-- .env.example
|   +-- package.json
|   +-- vite.config.js
+-- docs/
|   +-- call-module.png              # README screenshot
+-- INSTALL.bat                      # Windows dependency installer
+-- START.bat                        # Windows local startup helper
+-- QUICK-START-GUIDE.md             # Demo walkthrough
+-- PROJECT-SUMMARY.md               # Longer project notes
+-- README.md
```

## Setup

Requirements:

- Node.js 18 or newer
- npm
- Chrome or Edge for the best voice-recognition support

Install everything from the root folder:

```bash
npm run install:all
```

Or on Windows:

```bat
INSTALL.bat
```

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
GITHUB_TOKEN=your_github_models_token
GITHUB_AI_MODEL=gpt-4o-mini
PORT=3001
NODE_ENV=development
MONGODB_URI=
```

Create `frontend/.env.local` from `frontend/.env.example`:

```env
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

Notes:

- `GITHUB_TOKEN` enables the best AI conversation behavior.
- If `GITHUB_TOKEN` is missing, the backend uses local fallback responses.
- If `VITE_ELEVENLABS_API_KEY` is missing, the voice module falls back to browser speech synthesis.
- Do not commit real `.env` or `.env.local` files.

## Run Locally

Start both apps together:

```bash
npm run dev
```

Or start them in separate terminals:

```bash
cd backend
npm start
```

```bash
cd frontend
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Voice call module: `http://localhost:5173/call`
- Menu: `http://localhost:5173/menu`
- Admin dashboard: `http://localhost:5173/admin`
- Backend health check: `http://localhost:3001/api/health`

## API Overview

```http
POST /api/chat
POST /api/chat/greeting
GET  /api/chat/:sessionId/transcript
DELETE /api/chat/:sessionId
```

```http
GET  /api/menu
GET  /api/menu/categories
GET  /api/menu/category/:categoryId
GET  /api/menu/item/:itemId
GET  /api/menu/search?q=pizza
GET  /api/menu/items
GET  /api/menu/info
```

```http
POST   /api/orders
GET    /api/orders
GET    /api/orders/stats
GET    /api/orders/:orderId
GET    /api/orders/:orderId/receipt
PATCH  /api/orders/:orderId
PATCH  /api/orders/:orderId/status
DELETE /api/orders/:orderId
```

```http
GET /api/transcripts
GET /api/transcripts/:sessionId
```

## Demo Flow

1. Open `http://localhost:5173/call`.
2. Click the phone button.
3. Say something like: `I want a large pizza`.
4. Let the assistant ask for missing details.
5. Confirm the order.
6. The app creates the order and shows a receipt.
7. Open `http://localhost:5173/admin` to move the order through preparation stages.

## Customizing for Another Restaurant

Update these areas:

- `backend/data/menu.js` for menu categories, prices, opening hours, and restaurant details.
- `backend/services/aiService.js` for assistant name, tone, order rules, and language.
- `frontend/src/App.jsx` and page components for branding text.
- `frontend/src/index.css` for colors and visual style.

## Current Limitations

- Orders and transcripts are stored in memory unless persistence is implemented.
- Voice recognition depends on browser support and microphone permissions.
- Some source text from the original menu import has character-encoding artifacts that should be cleaned before production use.
- The current demo is optimized for local development, not hosted production.

## Contact

Need help with this project, a similar restaurant automation system, or a custom AI agent?

- Phone/WhatsApp: `+92 309 5501847`
- Email: `chumarhassan999@gmail.com`

## Suggested Repository Details

Repository name:

```text
restaurant-voice-ordering-system
```

Short description:

```text
AI-powered voice and chat ordering system for restaurants with React, Node.js, GitHub Models, ElevenLabs, and an admin order dashboard.
```
