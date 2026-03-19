# Church Database Management System (DBMS)

A comprehensive, full-stack database management system designed to streamline administration, community engagement, and financial tracking for modern congregations. 

## 🚀 Features

* **Member Directory:** Track personal profiles, contact information, and spiritual milestones (baptism, join dates).
* **Leadership & Ministry Tracking:** Assign leadership roles and tag members to specific ministries (Youth, Worship, Men, Women, etc.).
* **Groups & Departments:** Manage small group rosters and department memberships.
* **Smart Attendance Tracking:** * Quick-mark interfaces for Sunday services, events, and small groups.
  * **Absentee Reports:** Automatically identify active members who have missed both Sunday services and small groups within a given date range.
* **Financial Dashboard:** * Record income and expenses with categorized tagging.
  * Generate visual summaries (Total Income, Expenses, Balance).
  * One-click exports to PDF and Excel for seamless accounting.

## 💻 Tech Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts (for analytics), Lucide React (icons).
* **Backend:** Node.js, Express.js, TypeScript.
* **Database & ORM:** PostgreSQL, Prisma ORM.
* **Authentication:** JWT (JSON Web Tokens).

## 🛠️ Local Development Setup

To run this project locally, ensure you have Node.js and PostgreSQL installed.

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/shalom-jed/church-dbms.git
cd church-dbms
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`
Create a \`.env\` file in the \`backend\` directory:
\`\`\`env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/your_db"
JWT_SECRET="your_jwt_secret"
\`\`\`
Push the database schema and start the development server:
\`\`\`bash
npx prisma db push
npm run dev
\`\`\`

### 3. Frontend Setup
Open a new terminal window:
\`\`\`bash
cd frontend
npm install
\`\`\`
Create a \`.env\` file in the \`frontend\` directory:
\`\`\`env
VITE_API_URL="http://localhost:5000/api"
\`\`\`
Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`