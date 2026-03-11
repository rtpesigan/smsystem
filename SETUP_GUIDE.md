# 🔧 Setup & Deployment Guide

## Quick Setup (5 minutes)

### Prerequisites Check
```bash
# Verify Node.js
node --version  # Should be 18+

# Verify npm
npm --version   # Should be 9+

# Verify MySQL is running
mysql -u root -p -e "SELECT 1;"
```

### Step 1: Install Dependencies
```bash
cd smsystem
npm install
```

### Step 2: Environment Setup
Create `.env.local`:
```env
# MySQL Connection
DATABASE_URL="mysql://root:password@localhost:3306/storage_management"

# NextAuth
NEXTAUTH_SECRET="generate-with-this-command-below"
NEXTAUTH_URL="http://localhost:3000"

# App Config
NEXT_PUBLIC_APP_NAME="Storage Management System"
NEXT_PUBLIC_APP_DESCRIPTION="Modern Storage Unit Management"
```

Generate secure secret:
```bash
openssl rand -base64 32
# Or use online: https://generate-secret.vercel.app/32
```

### Step 3: Database Setup
```bash
# Create database (if not exists)
mysql -u root -p -e "CREATE DATABASE storage_management;"

# Apply schema
npm run db:push

# Populate sample data
npm run db:seed
```

### Step 4: Run Application
```bash
npm run dev
```

Open: http://localhost:3000

### Step 5: Login
- Email: `admin@example.com`
- Password: `admin123`

---

## 📦 Docker Deployment

### Create Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Build & Run
```bash
docker build -t storage-system .
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@db:3306/storage_management" \
  -e NEXTAUTH_SECRET="your-secret-here" \
  storage-system
```

---

## 🚀 Vercel Deployment

### 1. Connect Repository
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Push to GitHub
```bash
git remote add origin https://github.com/username/storage-system
git push -u origin main
```

### 3. Connect to Vercel
- Go to [vercel.com](https://vercel.com)
- Import GitHub project
- Configure environment variables:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (set to your Vercel domain)

### 4. Deploy
```bash
npm run build
vercel deploy --prod
```

---

## 🔧 Development Workflow

### File Organization
```
Feature branches:
- feature/storage-units
- feature/payments
- feature/reports

Main branch: production-ready code
```

### Development Commands
```bash
npm run dev      # Start dev server
npm run build    # Test build
npm run lint     # Check code quality
npm run db:push  # Sync database
npm run db:seed  # Populate sample data
```

---

## 🐛 Troubleshooting

### 1. MySQL Connection Fails
```bash
# Check MySQL is running
mysql -u root -p

# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
mysql -u root -p storage_management
```

### 2. Port 3000 Already in Use
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process (macOS/Linux)
lsof -ti:3000 | xargs kill -9
```

### 3. Prisma Client Error
```bash
# Regenerate Prisma client
npx prisma generate

# Clear cache
rm -rf node_modules/.prisma

# Reinstall
npm install
```

### 4. Auth Not Working
```bash
# Verify NEXTAUTH_SECRET is set
echo $NEXTAUTH_SECRET

# Check .env.local exists
ls -la .env.local

# Regenerate secret
openssl rand -base64 32
```

### 5. Database Sync Issues
```bash
# Reset database
npx prisma migrate reset

# Reapply schema
npm run db:push

# Seed data
npm run db:seed
```

---

## 🔐 Production Security Checklist

- [ ] Set strong `NEXTAUTH_SECRET`
- [ ] Use strong MySQL password
- [ ] Enable SSL/TLS for database
- [ ] Configure HTTPS on domain
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Update API rate limiting
- [ ] Enable CORS properly
- [ ] Review environment variables
- [ ] Enable audit logging
- [ ] Set up monitoring/alerts

---

## 📊 Performance Optimization

### Image Optimization
```tsx
import Image from 'next/image'

<Image
  src="/photo.png"
  alt="Description"
  width={300}
  height={200}
  priority
/>
```

### Code Splitting
- Automatic with Next.js
- Dynamic imports for heavy components
- Route-based code splitting

### Database Queries
- Indexed fields in Prisma schema ✅
- Efficient relations with include/select
- Pagination on large datasets

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with admin account
- [ ] Navigate all menu items
- [ ] Create storage unit
- [ ] Add customer
- [ ] Create rental
- [ ] Record payment
- [ ] Generate report
- [ ] Test dark mode
- [ ] Test mobile view

### User Roles to Test
- [ ] Admin account (full access)
- [ ] Staff account (limited)
- [ ] Viewer account (read-only)

---

## 📈 Monitoring

### Error Tracking
Enable Sentry:
```bash
npm install @sentry/nextjs
```

### Performance Monitoring
- Vercel Analytics
- Web Vitals
- Application Insights

### Logs
```bash
# View production logs
vercel logs storage-system
```

---

## 🔄 Backup & Recovery

### Database Backup
```bash
# Export database
mysqldump -u root -p storage_management > backup.sql

# Restore database
mysql -u root -p storage_management < backup.sql
```

### Code Backup
```bash
git push --all
git push --tags
```

---

## 📚 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [MySQL Docs](https://dev.mysql.com/doc)

---

## 🆘 Getting Help

### Common Issues
- Check `.env.local` configuration
- Verify MySQL connection
- Regenerate Prisma client
- Clear browser cache
- Check browser console for errors

### Debug Mode
```bash
DEBUG=* npm run dev
```

### Development Server Logs
Watch for red errors in terminal during `npm run dev`

---

## 🎯 Next Phase Implementation

Ready to add:
1. Email notifications
2. SMS alerts
3. Payment gateway integration
4. Mobile app
5. Advanced reporting
6. Multi-language support
7. Two-factor authentication
8. API documentation

---

**Last Updated**: March 10, 2026
**Version**: 1.0.0
