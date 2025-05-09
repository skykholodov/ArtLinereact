# Art Line Website Migration Guide

This guide details the process of migrating the Art Line website from Replit to Plesk hosting.

## Technology Stack

- Frontend: React 18 with TypeScript
- Backend: Node.js/Express
- Database: PostgreSQL
- File Storage: Local filesystem
- Authentication: Passport.js with session storage

## Pre-Migration Checklist

### 1. Environment Variables (30 minutes)
Document all required environment variables:
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=your-session-secret
OPENAI_API_KEY=your-openai-key
NODE_ENV=production
```

### 2. Dependencies Audit (1 hour)
All dependencies are listed in package.json. Key packages:
- Frontend: React, Tailwind CSS, shadcn/ui components
- Backend: Express, Drizzle ORM, Passport.js
- Development: TypeScript, Vite, ESBuild

### 3. Database Backup (30 minutes)
```bash
# On Replit
pg_dump -U postgres -d your_database > backup.sql

# Download backup.sql from Replit
```

### 4. File Storage Backup (15 minutes)
```bash
# Archive uploads directory
tar -czf uploads.tar.gz uploads/
```

## Migration Steps

### 1. Plesk Environment Setup (1 hour)

1. Create new Node.js application in Plesk:
   - Set Node.js version to 20.x
   - Enable npm for the domain
   - Configure SSL certificate

2. Set up PostgreSQL database:
   ```sql
   CREATE DATABASE artline;
   CREATE USER artline_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE artline TO artline_user;
   ```

3. Configure environment variables in Plesk:
   - Go to Domains > example.com > Node.js
   - Add all environment variables from the checklist

### 2. Application Deployment (2 hours)

1. Clone repository to Plesk:
```bash
git clone https://github.com/your-repo/art-line.git
cd art-line
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

4. Configure application startup:
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'art-line',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
```

### 3. Database Migration (1 hour)

1. Restore database backup:
```bash
psql -U artline_user -d artline < backup.sql
```

2. Verify database migration:
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM contents;
SELECT COUNT(*) FROM media;
```

### 4. File Storage Migration (30 minutes)

1. Create uploads directory:
```bash
mkdir -p /var/www/vhosts/example.com/uploads
```

2. Extract backup:
```bash
tar -xzf uploads.tar.gz -C /var/www/vhosts/example.com/
```

3. Set permissions:
```bash
chown -R web:web /var/www/vhosts/example.com/uploads
chmod -R 755 /var/www/vhosts/example.com/uploads
```

### 5. DNS Configuration (30 minutes)

1. Update DNS records:
```
A     @     203.0.113.1
CNAME www   example.com
```

2. Set TTL to 300 seconds during migration

## Post-Migration Tasks

### 1. Testing Checklist

- [ ] Frontend loads correctly
- [ ] Authentication works
- [ ] Content management functions
- [ ] File uploads work
- [ ] Multi-language support functions
- [ ] Admin panel accessible
- [ ] Contact form submissions work
- [ ] Database operations verified
- [ ] Session persistence confirmed

### 2. Performance Verification

1. Run Lighthouse audit
2. Check server response times
3. Verify database query performance
4. Test file upload/download speeds

### 3. Monitoring Setup

1. Configure Plesk server monitoring
2. Set up error logging
3. Enable performance metrics
4. Configure backup schedule

## Rollback Procedure

If migration fails:

1. Restore DNS records to Replit
2. Restore database from backup
3. Verify Replit application functionality
4. Document issues encountered

## Security Considerations

1. Update all passwords post-migration
2. Configure firewall rules
3. Enable HTTPS only
4. Set secure headers
5. Configure rate limiting

## Support Contacts

- Technical Support: support@example.com
- Emergency Contact: +1 (555) 123-4567

## Maintenance Window

Recommended maintenance window: 2-4 hours during off-peak hours.

Total estimated migration time: 6-8 hours including testing and verification.