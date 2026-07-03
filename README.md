# Small Business AI CX Suite

This project is now organized in a clearer **frontend / backend structure** for your submission and demo.

## Project Structure

- `frontend/`
- `frontend/index.html` - user interface
- `frontend/styles.css` - frontend styling
- `frontend/app.js` - frontend logic and API calls
- `backend/`
- `backend/server.js` - backend server and API routes
- `backend/package.json` - backend start script

## Frontend

The frontend contains:

- customer profile form
- AI chat window
- appointment booking form
- admin dashboard

The frontend sends requests to the backend using:

- `POST /api/chat`
- `POST /api/bookings`
- `GET /api/dashboard`
- `POST /api/reset`

## Backend

The backend contains:

- customer message analysis
- recommendation logic
- complaint escalation handling
- booking creation
- session-based dashboard data

## How to Run

1. Open a terminal in `backend`.
2. Run `node server.js`
3. Open `frontend/index.html` in a browser.

## Demo Flow

1. Start the backend server.
2. Open the frontend page.
3. Send a message like `What are your business hours?`
4. Try `Can you recommend a premium package for me?`
5. Try `I am upset because my order is delayed.`
6. Create a booking and watch the dashboard update.

## For Your Report

You can now describe your code in modules like this:

- **Frontend**: handles UI, forms, chat display, and dashboard rendering
- **Backend**: handles business logic, API processing, booking workflow, and escalation logic
- **Data Flow**: frontend sends requests to backend, backend processes them, then returns JSON responses

If you want, I can next generate this in an even more academic format, like:

- frontend module explanation
- backend module explanation
- database module
- API module
- system architecture diagram content
