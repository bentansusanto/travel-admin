# Deployment Guide for travel-admin

This guide provides step-by-step instructions for deploying the travel-admin Next.js application to a VPS using PM2.

## Prerequisites

### 1. Server Requirements

- **Node.js**: Version 18 or higher (check with `node -v`)
- **PM2**: Process manager (`npm install -g pm2`)
- **pnpm**: Package manager (`npm install -g pnpm`)
- **Disk Space**: At least 2GB free space
- **RAM**: Minimum 1GB (2GB recommended)

### 2. Required Files on VPS

```
/www/wwwroot/travel-admin/
├── .next/standalone/          # Built application
│   ├── server.js             # Main server file
│   ├── public/               # Static assets
│   └── .next/static/         # Next.js static files
├── .env                       # Environment variables
├── ecosystem.config.js        # PM2 configuration
├── start-pm2.sh              # PM2 startup script
└── logs/                      # Application logs
```

## Deployment Steps

### Step 1: Build the Application Locally

On your **local machine** (not VPS):

```bash
cd /path/to/travel-admin

# Install dependencies
pnpm install

# Build for production (this will create standalone build + copy files)
pnpm build:prod
```

This command will:

- Clean previous builds
- Run Next.js build with standalone output
- Copy `public/` folder to `.next/standalone/public/`
- Copy `.next/static/` to `.next/standalone/.next/static/`

### Step 2: Prepare Files for Transfer

Create a deployment package:

```bash
# Create a deployment directory
mkdir -p deploy-package

# Copy standalone build
cp -r .next/standalone/* deploy-package/

# Copy PM2 configuration files
cp ecosystem.config.js deploy-package/
cp start-pm2.sh deploy-package/

# Copy environment file (IMPORTANT!)
cp .env deploy-package/

# Create logs directory
mkdir -p deploy-package/logs

# Create a zip file
cd deploy-package
zip -r ../travel-admin-deploy.zip .
cd ..
```

### Step 3: Upload to VPS

**Option A: Using SCP**

```bash
scp travel-admin-deploy.zip user@your-vps-ip:/www/wwwroot/
```

**Option B: Using FTP/SFTP**

Use FileZilla or similar FTP client to upload `travel-admin-deploy.zip` to `/www/wwwroot/`

**Option C: Using Git (if you have a repository)**

```bash
# On VPS
cd /www/wwwroot/travel-admin
git pull origin main
pnpm install
pnpm build:prod
```

### Step 4: Extract and Setup on VPS

SSH into your VPS:

```bash
ssh user@your-vps-ip
```

Then run:

```bash
# Navigate to web root
cd /www/wwwroot

# Create directory if it doesn't exist
mkdir -p travel-admin

# Extract the zip file
unzip travel-admin-deploy.zip -d travel-admin/

# Navigate to the directory
cd travel-admin

# Make start script executable
chmod +x start-pm2.sh

# Verify .env file exists and has correct values
cat .env
```

### Step 5: Configure Environment Variables

Edit the `.env` file on VPS:

```bash
nano .env
```

Make sure it contains:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
# Add other environment variables as needed
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 6: Start the Application

```bash
# Run the PM2 startup script
bash start-pm2.sh
```

The script will:

- ✅ Check Node.js version (must be 18+)
- ✅ Verify .env file exists
- ✅ Check if standalone server exists
- ✅ Verify static files were copied
- ✅ Check port availability
- ✅ Create logs directory
- 🚀 Start PM2 with 2 cluster instances

### Step 7: Verify Deployment

```bash
# Check PM2 status
pm2 list

# View live logs
pm2 logs travel-admin

# Monitor resources
pm2 monit

# Test the application
curl http://localhost:3006
```

## Updating the Application

When you need to update the application:

### Method 1: Full Redeployment

```bash
# On local machine
pnpm build:prod
# ... create zip and upload as in Step 2-3 ...

# On VPS
cd /www/wwwroot/travel-admin
pm2 stop travel-admin
rm -rf .next
unzip -o ../travel-admin-deploy.zip
bash start-pm2.sh
```

### Method 2: Using Git (Recommended)

```bash
# On VPS
cd /www/wwwroot/travel-admin
pm2 stop travel-admin
git pull origin main
pnpm install
pnpm build:prod
bash start-pm2.sh
```

## Troubleshooting

### Issue: "Failed to start server"

**Possible causes:**

1. **Missing .env file**

   ```bash
   ls -la .env
   # If not found, create it
   nano .env
   ```

2. **Node.js version too old**

   ```bash
   node -v
   # Should be 18.0.0 or higher
   # Upgrade if needed:
   # curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   # sudo apt-get install -y nodejs
   ```

3. **Missing standalone files**

   ```bash
   ls -la .next/standalone/server.js
   ls -la .next/standalone/public
   ls -la .next/standalone/.next/static
   # If missing, rebuild with: pnpm build:prod
   ```

4. **Port already in use**
   ```bash
   lsof -i :3006
   # Kill the process or change port in ecosystem.config.js
   ```

### Issue: "Module not found" errors

```bash
# Rebuild the application
cd /www/wwwroot/travel-admin
rm -rf .next node_modules
pnpm install
pnpm build:prod
bash start-pm2.sh
```

### Issue: Static assets not loading

```bash
# Verify static files were copied
ls -la .next/standalone/public
ls -la .next/standalone/.next/static

# If missing, run copy script manually
node scripts/copy-standalone-files.js
```

### View Error Logs

```bash
# View last 100 lines of error log
pm2 logs travel-admin --err --lines 100

# View specific log file
tail -f /www/wwwroot/travel-admin/logs/error.log
```

## PM2 Useful Commands

```bash
# List all processes
pm2 list

# Show detailed info
pm2 show travel-admin

# Restart application
pm2 restart travel-admin

# Stop application
pm2 stop travel-admin

# Delete from PM2
pm2 delete travel-admin

# View logs (live)
pm2 logs travel-admin

# View error logs only
pm2 logs travel-admin --err

# Monitor CPU/Memory
pm2 monit

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown
```

## Performance Optimization

### 1. Enable PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 2. Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/travel-admin`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/travel-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Setup SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Monitoring and Maintenance

### Daily Checks

```bash
# Check application status
pm2 list

# Check disk space
df -h

# Check memory usage
free -h
```

### Weekly Maintenance

```bash
# Rotate logs
pm2 flush

# Update dependencies (if needed)
cd /www/wwwroot/travel-admin
pnpm update

# Restart application
pm2 restart travel-admin
```

## Rollback Procedure

If deployment fails:

```bash
# Stop current version
pm2 stop travel-admin

# Restore from backup
cd /www/wwwroot
mv travel-admin travel-admin-failed
mv travel-admin-backup travel-admin

# Restart
cd travel-admin
bash start-pm2.sh
```

## Support

For issues or questions:

1. Check PM2 logs: `pm2 logs travel-admin --err`
2. Check system logs: `journalctl -u pm2-root -f`
3. Review this deployment guide
4. Contact the development team
