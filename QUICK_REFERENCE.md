# ⚡ Quick Reference - Storage Management System

## 🚀 Start Here (3 Steps)

```bash
# 1. Install
npm install

# 2. Setup database
npm run db:push && npm run db:seed

# 3. Run
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔐 Login Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@example.com | admin123 | Full Access |
| Staff | staff@example.com | admin123 | Limited |

---

## 📁 Key Files & Folders

| Path | Purpose |
|------|---------|
| `src/app/dashboard` | Main dashboard pages |
| `src/components/ui` | Reusable UI components |
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Sample data |
| `.env.local` | Environment config |

---

## 🛠️ Available Commands

```bash
npm run dev      # Dev server (port 3000)
npm run build    # Production build
npm start        # Start production
npm run lint     # Code quality
npm run db:push  # Apply schema
npm run db:seed  # Load data
```

---

## 📊 Dashboard Modules

| Module | Path | Features |
|--------|------|----------|
| Dashboard | `/dashboard` | Stats, charts, alerts |
| Storage Units | `/dashboard/storage-units` | CRUD, search |
| Categories | `/dashboard/categories` | Type management |
| Customers | `/dashboard/customers` | Profiles, history |
| Rentals | `/dashboard/rentals` | Agreements |
| Payments | `/dashboard/payments` | Tracking, alerts |
| Reports | `/dashboard/reports` | Analytics, export |
| Settings | `/dashboard/settings` | User management |

---

## 🔑 Environment Variables

```env
DATABASE_URL=mysql://user:pass@localhost:3306/storage_management
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

---

## 💾 Database Tables (7)

1. **users** - User accounts
2. **storage_categories** - Storage types
3. **storage_units** - Individual units
4. **customers** - Customer profiles
5. **rentals** - Rental agreements
6. **payments** - Payment records
7. **activity_logs** - Audit trail

---

## 🎨 UI Components (9)

- Button
- Card
- Input
- Label
- Badge
- Alert
- Dialog
- Table
- Tabs

---

## 🔄 API Routes

```
/api/auth/[...nextauth]   - Authentication
```

---

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

---

## 🔐 User Roles

### Admin
- ✅ Everything
- ✅ User management
- ✅ System settings

### Staff
- ✅ Rentals
- ✅ Payments
- ✅ Reports (view)

### Viewer
- ✅ View all data
- ❌ No create/edit/delete

---

## 🎯 Sample Data Included

- ✅ 50+ Storage Units
- ✅ 4 Categories
- ✅ 10+ Customers
- ✅ 15+ Rentals
- ✅ Payment records
- ✅ Activity logs

---

## ⚙️ Tech Stack

```
Frontend:  Next.js 14 + React + TypeScript
Styling:   Tailwind CSS + Radix UI
Backend:   Next.js API Routes + NextAuth
Database:  MySQL + Prisma ORM
Charts:    Recharts
Icons:     Lucide React
```

---

## 🆘 Troubleshooting

### Can't connect to MySQL?
```bash
mysql -u root -p
# Enter password
```

### Port 3000 in use?
```bash
npm run dev -- -p 3001
```

### Database sync error?
```bash
npx prisma generate
npm run db:push
```

### Auth not working?
```bash
# Check .env.local exists
ls .env.local

# Regenerate secret
openssl rand -base64 32
```

---

## 📚 Important Files

```
.env.local           - Environment variables
prisma/schema.prisma - Database design
src/app/page.tsx     - Home (redirects to login)
src/app/login/       - Login page
src/app/dashboard/   - All dashboard pages
```

---

## 🚀 Deploy Commands

### Vercel
```bash
vercel deploy --prod
```

### Docker
```bash
docker build -t storage-system .
docker run -p 3000:3000 storage-system
```

---

## 📞 Need Help?

1. Check `.env.local` configuration
2. Verify MySQL is running
3. Check terminal for error messages
4. Review SETUP_GUIDE.md
5. Check IMPLEMENTATION_SUMMARY.md

---

## 📅 Version Info

- **Version**: 1.0.0
- **Created**: March 10, 2026
- **Status**: Production Ready ✅
- **Node**: 18+
- **npm**: 9+
- **MySQL**: 8.0+

---

**Quick Links**:
- [Full Setup Guide](./SETUP_GUIDE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [README](./README.md)

---

**Updated**: March 10, 2026
