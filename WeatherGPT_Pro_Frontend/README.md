# WeatherGPT Pro Frontend

A responsive multi-page WeatherGPT frontend recreated from the supplied reference.

## Stack
- HTML5
- CSS3
- Vanilla JavaScript
- No framework
- No backend

## Pages
1. index.html — Dashboard
2. plan.html — Plan My Day
3. assistant.html — AI Assistant
4. forecast.html — Forecast
5. map.html — Live Map
6. air-quality.html — Air Quality
7. alerts.html — Alerts
8. compare.html — Compare Cities
9. travel.html — Travel Planner
10. saved.html — Saved Plans
11. settings.html — Settings

## JavaScript features
- Responsive mobile sidebar
- Live clock/date
- Dark/light theme toggle
- Planner activity selection
- Plan analysis interaction
- LocalStorage saved plans
- Delete saved plans
- AI assistant demo chat
- Search/Enter interaction
- Forecast filters
- City comparison
- Map point interactions
- Settings switches
- Toast notifications

## Run
Open `index.html` directly in Chrome/Edge/Firefox.
For development, Live Server in VS Code is recommended.


## Authentication
- `login.html` — sign in
- `signup.html` — create account
- `forgot-password.html` — password reset demo flow
- `auth.js` — validation, account creation, session guard, login/logout
- Route protection redirects unauthenticated users to `login.html`
- Demo account: `demo@weathergpt.app` / `demo123`
- Session can persist in localStorage or sessionStorage based on "Remember me"

### Important
This is frontend-only authentication. Passwords stored in localStorage are not secure for production.
For a real deployment, connect the UI to a backend or a provider such as Firebase Auth, Supabase Auth, Auth0, or your own secure API. Never treat localStorage-based passwords as production authentication.

## Login / Logout UI
The dashboard header shows the signed-in user and exposes a clear **Logout** action through the account menu. On mobile, the account control remains responsive. Public pages include **Sign In**, **Create Account**, and **Forgot Password** flows.
