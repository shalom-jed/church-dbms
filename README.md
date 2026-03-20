# Church Database Management System (DBMS)

A production-ready, full-stack database management system managing daily operations.

## 🚀 Live Deployment

**Frontend:** https://your-vercel-url.vercel.app
**Backend:** Running on Render
**Database:** PostgreSQL on Supabase

## ✨ Key Features

### Member Directory
- Track personal profiles, spiritual milestones, leadership roles
- Organize members by ministry (Youth, Women's, Men's, Children's)
- Search and filter functionality

### Smart Attendance Tracking
- Log attendance for Sunday services and small groups
- Automated absentee detection and reporting
- Historical attendance records

### Financial Dashboard
- Record income and expenses
- Monitor account balances
- Visual analytics for financial trends
- Export reports to PDF/Excel

### Admin Interface
- Secure login with JWT authentication
- Data management and updates
- Automated backup and recovery

## 💻 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, Recharts |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Authentication** | JWT (JSON Web Tokens) |
| **Deployment** | Vercel (frontend), Render (backend), Supabase (database) |

## 🛠 Local Development

### Prerequisites
- Node.js 16+
- PostgreSQL
- Git

### Backend Setup
```bash
cd backend
npm install
```

Create `.env`:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/church_db"
JWT_SECRET="your_secret_key"
```
```bash
npx prisma db push
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `.env`:
```env
VITE_API_URL="http://localhost:5000/api"
```
```bash
npm run dev
```

## 📊 Current Status

✅ **Live in production** 
✅ **Active users** — Admin
✅ **Deployed across** — Vercel (frontend), Render (backend), Supabase (database)
✅ **Maintained & updated** — bug fixes and new features deployed regularly

## 📁 Project Structure
```
church-dbms/
├── frontend/          # React application
│   ├── src/
│   ├── components/
│   └── pages/
├── backend/           # Express server
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── prisma/
└── README.md
```

## 📝 License

Private project for Assembly of God Church, Ruwanwella.

## 👤 Author

**Shalom Jedidiah**
- GitHub: [@shalom-jed](https://github.com/shalom-jed)
- LinkedIn: [linkedin.com/in/shalom-jed](https://linkedin.com/in/shalom-jed)
- Email: shalomjedidiah339@gmail.com
