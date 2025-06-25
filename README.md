🎓 OrariClient – University Scheduling Frontend
A modern web-based frontend for the Orari Academic and Exam Scheduling System, enabling administrators, professors, and students to interact with academic schedules, syllabuses, and teaching allocations through a clean and responsive UI.

🌐 Live Preview
(Optional) Deploy via GitHub Pages, Vercel, or Netlify and insert the link here.

🚀 Features
📅 View and manage academic timetables and exam schedules

📚 Access syllabuses and course information

👩‍🏫 Assign professors to courses and view teaching loads

🔐 Secure login via JWT and role-based dashboards

🗂️ Filter and search by faculty, department, semester

📄 Export schedules to PDF or print-ready view

🌙 Light/dark theme support (optional)

🛠️ Tech Stack
Layer	Technology
Frontend	React + TypeScript
UI Framework	Tailwind CSS / Bootstrap (choose one)
State	Redux Toolkit / React Query
Routing	React Router v6
Auth	JWT (integrated with Orari API)
API Calls	Axios with centralized request layer
Forms	Formik + Yup / React Hook Form
DevOps	Vite / Webpack, Docker (optional)

📁 Project Structure
bash
Copy
Edit
/src
  /api                → Axios request wrappers
  /components         → Reusable UI components
  /features
    /schedules        → Timetable views, filters
    /courses          → Course and syllabus UIs
    /auth             → Login, protected routes
  /redux              → Slices, store configuration
  /routes             → Route definitions
  /utils              → Date formatting, helpers
  /styles             → Global styles (Tailwind / CSS)
  App.tsx             → Main app entry
  main.tsx            → App bootstrap
⚙️ Getting Started
Prerequisites
Node.js v18+

Yarn or npm

Setup
bash
Copy
Edit
git clone https://github.com/ashani17/OrariClient.git
cd OrariClient
npm install
Configure
Create a .env file:

env
Copy
Edit
VITE_API_BASE_URL=https://localhost:5001/api
VITE_JWT_STORAGE_KEY=orari_token
🔄 Run Locally
bash
Copy
Edit
npm run dev
App will be available at http://localhost:5173

🐳 Docker (Optional)
bash
Copy
Edit
docker build -t orari-client .
docker run -p 5173:80 orari-client
✅ Linting & Formatting
bash
Copy
Edit
npm run lint
npm run format
🧪 Testing (optional)
If testing is enabled:

bash
Copy
Edit
npm run test
Use Jest + React Testing Library for component testing

Cypress for end-to-end testing

🔐 Authentication
Login using university-issued credentials

JWT token stored in secure storage

Route protection for admin/professor/student views

📄 PDF/Print Export
Schedule view is exportable to PDF via print-friendly routes

Responsive layout for A4 paper

📘 License
MIT License – see LICENSE

👨‍🎓 Author
Developed by @ashani17 — as the frontend client for the Orari University Academic Scheduling System.