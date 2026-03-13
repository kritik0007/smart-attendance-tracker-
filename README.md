## Smart Attendance Tracker - Frontend

This is a demo React frontend for the **Smart Attendance Tracker** project.

It showcases:

- Landing page and role-based authentication (Student / Faculty / Admin)
- Student dashboard with camera preview, face verification UI, GPS status, session key entry, and attendance history
- Faculty dashboard to create sessions, generate 6-digit keys, see live attendance, and download reports
- Admin dashboard to manage students/faculty, browse attendance records, and view basic analytics

### Tech stack

- React (functional components + hooks)
- React Router v6 for navigation
- Vanilla CSS in `styles/globals.css`
- Browser APIs: `getUserMedia` (camera) and `Geolocation`

### Running the app

```bash
npm install
npm start
```

> Note: All API calls are mocked in `services/`. Replace them with your real backend endpoints as needed.



