# 🏪 Storage Management System

A modern, production-ready Storage Management System built with Next.js 14, TypeScript, Prisma, and MySQL. This comprehensive web application provides complete inventory and customer management for storage facilities.

## ✨ Features

### 📊 Dashboard
- Real-time analytics and KPIs
- Revenue trends and charts
- Occupancy visualization
- System alerts and notifications
- Recent activity feed

### 📦 Storage Unit Management
- Full CRUD operations
- Category-based organization
- Unit size tracking (Small, Medium, Large)
- Status management (Available, Occupied, Maintenance)
- QR code generation
- Advanced search and filtering

### 👥 Customer Management
- Complete customer profiles
- Contact and address management
- ID verification
- Rental history
- Customer search and filtering

### 🤝 Rental Management
- Rental agreement creation
- Unit assignment to customers
- Start/end date tracking
- Monthly rate management
- Status tracking (Active, Expired, Cancelled)

### 💳 Payment Management
- Payment recording and tracking
- Multiple payment methods
- Due date management
- Overdue notifications
- Transaction tracking

### 📈 Reports & Analytics
- Revenue analysis
- Occupancy reports
- Customer demographics
- Payment statistics
- Export to PDF and CSV

### 👤 User Management
- Role-based access control
- Admin, Staff, and Viewer roles
- Activity audit logging
- Session management

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 14, React 19, TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | Custom + Radix UI |
| **Backend** | Next.js API Routes |
| **Authentication** | NextAuth.js |
| **Database** | MySQL |
| **ORM** | Prisma |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Validation** | Zod |

## 📋 Requirements

- Node.js 18+
- npm 9+
- MySQL 8.0+
- 512MB RAM (minimum)

## ⚡ Quick Start

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Environment Setup
Create `.env.local`:
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/storage_management"

# Authentication
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_NAME="Storage Management System"
```

### 3️⃣ Database Setup
```bash
# Apply schema to database
npm run db:push

# Populate with sample data
npm run db:seed
```

### 4️⃣ Start Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Staff | staff@example.com | admin123 |

## 📂 Project Structure

```
smsystem/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── api/auth/          # Authentication
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/            # Login page
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   ├── layout/           # Sidebar, navbar
│   │   ├── storage-units/    # Storage components
│   │   ├── customers/        # Customer components
│   │   ├── ui/               # Reusable UI components
│   │   └── providers/        # Theme provider
│   ├── lib/
│   │   └── prisma.ts         # Database client
│   └── types/
│       └── index.ts          # TypeScript definitions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts              # Sample data
└── public/                   # Static assets
```

## 🎯 Core Modules

### 1. Dashboard
- Overview statistics
- Revenue and occupancy charts
- System alerts
- Activity feed

### 2. Storage Units (A101-A300)
- Full CRUD operations
- Category assignment
- Size tracking
- Status management
- Search/filter

### 3. Customers (20+ profiles)
- Customer database
- Contact management
- Rental history
- Activity tracking

### 4. Rentals
- Agreement management
- Unit-customer pairing
- Date tracking
- Status monitoring

### 5. Payments
- Payment history
- Method tracking
- Due date management
- Overdue alerts

### 6. Categories
- Personal Storage
- Business Storage
- Document Storage
- Cold Storage

### 7. Reports
- Revenue analytics
- Occupancy analysis
- Customer reports
- Payment reports

## 🔨 Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm start                # Start production

# Database
npm run db:push          # Push schema
npm run db:seed          # Seed data

# Code Quality
npm run lint             # Run ESLint
```

## 🔐 Security

- ✅ Password hashing (bcryptjs)
- ✅ JWT-based sessions
- ✅ CSRF protection
- ✅ Input validation
- ✅ Audit logging
- ✅ Role-based access control

## 🎨 Features

- ✅ Fully responsive design
- ✅ Dark mode support
- ✅ Accessibility compliance
- ✅ Loading states
- ✅ Error handling
- ✅ Data export (PDF/CSV)
- ✅ Real-time search
- ✅ Advanced filtering

## 📊 Database Schema

### Tables
- **users** - System users and credentials
- **storage_categories** - Storage types
- **storage_units** - Individual units
- **customers** - Customer profiles
- **rentals** - Rental agreements
- **payments** - Payment records
- **activity_logs** - System audit trail

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```bash
docker build -t storage-system .
docker run -p 3000:3000 storage-system
```

## 🐛 Troubleshooting

### MySQL Connection Error
```bash
# Check MySQL status
mysql -u root -p

# Verify DATABASE_URL
echo $DATABASE_URL
```

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### Database Sync Issues
```bash
npx prisma generate
npm run db:push
```

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 🔄 Roadmap

- [ ] Mobile app
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Two-factor authentication
- [ ] Multi-language support
- [ ] API documentation

## 📄 License

Proprietary - All rights reserved

## 🤝 Support

For issues or questions, contact the development team.

---

**Version**: 1.0.0 | **Updated**: March 10, 2026 | **Status**: Production Ready ✅
