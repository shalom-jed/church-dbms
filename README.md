# Church Database Management System (DBMS)

A comprehensive, full-stack database management system designed to streamline administration, community engagement, and financial tracking for modern congregations. 

## 🚀 Key Features

* **Member Directory:** Track personal profiles, spiritual milestones (baptism, join dates), and leadership roles across different ministries.
* **Small Groups & Departments:** Manage group rosters, assign leaders, and monitor weekly engagement.
* **Smart Attendance Tracking:** Comprehensive logging for Sunday services and small groups, featuring quick-mark interfaces and automated absentee detection.
* **Financial Dashboard:** Record income and expenses, monitor balances, and view visual analytics.
* **Universal Data Exports:** Built-in reporting engine allowing administrators to instantly export attendance records, absentee lists, and financial statements directly to **professional PDFs and Excel spreadsheets** with a single click.

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