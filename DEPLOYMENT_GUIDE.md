# Pet Adoption Management System - Deployment Guide

## 🚀 Deployment Options

This guide covers multiple deployment strategies for the Pet Adoption Management System.

## 📋 Pre-Deployment Checklist

- [ ] MySQL database setup completed
- [ ] Environment variables configured
- [ ] SSL certificates obtained (for production)
- [ ] Domain name configured
- [ ] Backup strategy implemented
- [ ] Monitoring tools setup

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- At least 2GB RAM available
- 10GB disk space

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pet-adoption-system
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your production settings
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec backend npm run migrate
   docker-compose exec backend npm run seed
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:3306

### Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access backend container
docker-compose exec backend sh

# Database backup
docker-compose exec mysql mysqldump -u root -p pet_adoption_db > backup.sql
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using AWS ECS (Elastic Container Service)

1. **Push images to ECR**
   ```bash
   # Build and tag images
   docker build -t pet-adoption-backend ./backend
   docker build -t pet-adoption-frontend ./frontend
   
   # Tag for ECR
   docker tag pet-adoption-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/pet-adoption-backend:latest
   docker tag pet-adoption-frontend:latest <account>.dkr.ecr.<region>.amazonaws.com/pet-adoption-frontend:latest
   
   # Push to ECR
   docker push <account>.dkr.ecr.<region>.amazonaws.com/pet-adoption-backend:latest
   docker push <account>.dkr.ecr.<region>.amazonaws.com/pet-adoption-frontend:latest
   ```

2. **Setup RDS MySQL**
   - Create RDS MySQL instance
   - Configure security groups
   - Update environment variables

3. **Create ECS Task Definition**
   - Define backend and frontend services
   - Configure load balancer
   - Set up auto-scaling

#### Using AWS Elastic Beanstalk

1. **Prepare application**
   ```bash
   # Create application bundle
   zip -r pet-adoption-backend.zip backend/
   zip -r pet-adoption-frontend.zip frontend/build/
   ```

2. **Deploy to Elastic Beanstalk**
   - Create new application
   - Upload application bundle
   - Configure environment variables

### Heroku Deployment

#### Backend Deployment

1. **Prepare for Heroku**
   ```bash
   cd backend
   # Create Procfile
   echo "web: npm start" > Procfile
   ```

2. **Deploy to Heroku**
   ```bash
   heroku create pet-adoption-api
   heroku addons:create cleardb:ignite
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_production_secret
   
   # Deploy
   git push heroku main
   
   # Run migrations
   heroku run npm run migrate
   heroku run npm run seed
   ```

#### Frontend Deployment

1. **Build and deploy**
   ```bash
   cd frontend
   npm run build
   
   # Deploy to Netlify or Vercel
   # Update API base URL in production
   ```

### DigitalOcean Deployment

#### Using DigitalOcean App Platform

1. **Create App**
   - Connect GitHub repository
   - Configure build settings
   - Set environment variables

2. **Database Setup**
   - Create managed MySQL database
   - Configure connection strings

## 🔧 Manual Server Deployment

### Ubuntu Server Setup

1. **Server Preparation**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MySQL
   sudo apt install mysql-server -y
   sudo mysql_secure_installation
   
   # Install Nginx
   sudo apt install nginx -y
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Application Setup**
   ```bash
   # Clone repository
   git clone <repository-url> /var/www/pet-adoption
   cd /var/www/pet-adoption
   
   # Install backend dependencies
   cd backend
   npm install --production
   
   # Install frontend dependencies and build
   cd ../frontend
   npm install
   npm run build
   ```

3. **Database Setup**
   ```bash
   # Create database
   sudo mysql -u root -p
   CREATE DATABASE pet_adoption_db;
   CREATE USER 'petadoption'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON pet_adoption_db.* TO 'petadoption'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   
   # Run migrations
   cd /var/www/pet-adoption/backend
   npm run migrate
   npm run seed
   ```

4. **PM2 Configuration**
   ```bash
   # Create ecosystem file
   cat > ecosystem.config.js << EOF
   module.exports = {
     apps: [{
       name: 'pet-adoption-backend',
       script: 'server.js',
       cwd: '/var/www/pet-adoption/backend',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       }
     }]
   }
   EOF
   
   # Start application
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

5. **Nginx Configuration**
   ```bash
   # Create Nginx config
   sudo cat > /etc/nginx/sites-available/pet-adoption << EOF
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /var/www/pet-adoption/frontend/build;
           try_files \$uri \$uri/ /index.html;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade \$http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host \$host;
           proxy_set_header X-Real-IP \$remote_addr;
           proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto \$scheme;
           proxy_cache_bypass \$http_upgrade;
       }
   }
   EOF
   
   # Enable site
   sudo ln -s /etc/nginx/sites-available/pet-adoption /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **SSL Certificate (Let's Encrypt)**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # Obtain certificate
   sudo certbot --nginx -d your-domain.com
   
   # Auto-renewal
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## 🔒 Production Security

### Environment Security
```bash
# Set secure file permissions
chmod 600 .env
chown root:root .env

# Secure uploads directory
chmod 755 uploads/
chown www-data:www-data uploads/
```

### Database Security
```sql
-- Create dedicated database user
CREATE USER 'petadoption'@'localhost' IDENTIFIED BY 'very_secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON pet_adoption_db.* TO 'petadoption'@'localhost';
FLUSH PRIVILEGES;

-- Remove test databases and users
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.user WHERE User='';
FLUSH PRIVILEGES;
```

### Application Security
- Use strong JWT secrets (32+ characters)
- Enable HTTPS only
- Set secure headers
- Implement rate limiting
- Regular security updates
- Monitor logs for suspicious activity

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Backend health check
curl -f http://localhost:5000/api/health

# Database connection test
mysql -u petadoption -p -e "SELECT 1"

# Frontend availability
curl -f http://localhost:3000
```

### Log Management
```bash
# PM2 logs
pm2 logs pet-adoption-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### Backup Strategy
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u petadoption -p pet_adoption_db > /backups/pet_adoption_$DATE.sql
find /backups -name "pet_adoption_*.sql" -mtime +7 -delete

# File backup
tar -czf /backups/uploads_$DATE.tar.gz /var/www/pet-adoption/backend/uploads/
```

### Performance Monitoring
- Use PM2 monitoring: `pm2 monit`
- Setup New Relic or DataDog
- Monitor database performance
- Track API response times
- Monitor disk space and memory usage

## 🔄 Continuous Deployment

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/pet-adoption
          git pull origin main
          cd backend && npm install --production
          cd ../frontend && npm install && npm run build
          pm2 restart pet-adoption-backend
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service status
   - Verify credentials in .env
   - Test network connectivity

2. **File Upload Errors**
   - Check uploads directory permissions
   - Verify disk space
   - Check file size limits

3. **High Memory Usage**
   - Monitor PM2 processes
   - Check for memory leaks
   - Consider increasing server resources

4. **Slow API Responses**
   - Check database query performance
   - Monitor server resources
   - Implement caching

### Emergency Recovery
```bash
# Restart all services
sudo systemctl restart nginx
pm2 restart all
sudo systemctl restart mysql

# Restore from backup
mysql -u petadoption -p pet_adoption_db < /backups/latest_backup.sql

# Check system resources
htop
df -h
free -m
```

This deployment guide provides comprehensive instructions for deploying the Pet Adoption Management System in various environments, from development to production-ready cloud deployments.
