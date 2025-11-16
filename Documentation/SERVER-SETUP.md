# Fire Assessment Server Setup Guide

## Overview

This guide will help you set up the local server component of the Fire Risk Assessment application. The server runs on your home/office laptop and provides:

- **PostgreSQL Database** - Historical data storage
- **Node.js API Server** - Sync endpoints for mobile app
- **React Web Dashboard** - Browser-based assessment management
- **Automatic Backups** - Daily backup to external drive

**Important:** This server runs on your local network only (no internet exposure).

---

## Prerequisites

### Hardware Requirements

**Minimum:**
- Laptop with 4GB RAM
- 50GB free storage
- WiFi or Ethernet connection

**Recommended:**
- Laptop with 8GB+ RAM
- 100GB+ free storage (for 5 years of data)
- Dedicated external drive for backups (500GB+)

### Software Requirements

**Operating System:**
- macOS 10.15 or later
- Windows 10/11
- Ubuntu 20.04+ or similar Linux distribution

---

## Installation Methods

Choose one of two installation methods:

1. **Docker Installation** (Recommended) - Easiest, one-command setup
2. **Native Installation** - More control, requires manual setup

---

## Method 1: Docker Installation (Recommended)

### Step 1: Install Docker

**macOS:**
```bash
# Download Docker Desktop from:
# https://www.docker.com/products/docker-desktop

# Or install via Homebrew:
brew install --cask docker

# Start Docker Desktop from Applications
```

**Windows:**
```bash
# Download Docker Desktop from:
# https://www.docker.com/products/docker-desktop

# Run installer and restart computer when prompted
```

**Linux (Ubuntu/Debian):**
```bash
# Update package list
sudo apt update

# Install Docker
sudo apt install docker.io docker-compose -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (logout/login required after)
sudo usermod -aG docker $USER
```

**Verify Docker Installation:**
```bash
docker --version
# Should output: Docker version 20.x.x or higher

docker-compose --version
# Should output: docker-compose version 1.29.x or higher
```

### Step 2: Clone the Repository

```bash
# Navigate to where you want to install (e.g., Documents)
cd ~/Documents

# Clone the repository
git clone https://github.com/safeathomeapp/FRA.git

# Enter the server directory
cd FRA/server
```

### Step 3: Configure Server Settings

```bash
# Copy example environment file
cp .env.example .env

# Edit configuration (optional - defaults work for most setups)
nano .env
# or on Windows: notepad .env
# or on macOS: open -e .env
```

**Default Configuration (.env file):**
```env
# Database Configuration
POSTGRES_USER=fireassess
POSTGRES_PASSWORD=change-this-secure-password
POSTGRES_DB=fire_assessments

# API Configuration
API_PORT=3000
NODE_ENV=production

# Network Configuration
SERVER_HOST=0.0.0.0
LAPTOP_IP=192.168.1.50

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_TIME=02:00
BACKUP_RETENTION_DAYS=30
BACKUP_PATH=/path/to/external/drive/backups

# WiFi Configuration (for phone auto-sync)
HOME_WIFI_SSID=YourWiFiNetworkName
```

**IMPORTANT: Change these values:**
1. `POSTGRES_PASSWORD` - Choose a strong password
2. `LAPTOP_IP` - Set to your laptop's local IP (see Step 4)
3. `BACKUP_PATH` - Set to your external drive location
4. `HOME_WIFI_SSID` - Set to your WiFi network name

### Step 4: Find Your Laptop's Local IP Address

**macOS:**
```bash
# Option 1: Using command line
ipconfig getifaddr en0

# Option 2: System Preferences
# Open System Preferences > Network
# Select WiFi (or Ethernet)
# IP Address shown on right side
```

**Windows:**
```bash
# Open Command Prompt and run:
ipconfig

# Look for "IPv4 Address" under your active connection
# Usually starts with 192.168.x.x or 10.0.x.x
```

**Linux:**
```bash
# Option 1: Using ip command
ip addr show

# Option 2: Using ifconfig
ifconfig

# Look for inet address under your active connection (wlan0 or eth0)
```

**Example IP Address:** `192.168.1.50`

**Update .env file with your IP:**
```env
LAPTOP_IP=192.168.1.50
```

### Step 5: Configure Static IP (Recommended)

To prevent IP address changes, configure your router to assign a static IP to your laptop.

**Router Access:**
1. Open web browser
2. Go to router admin page (usually `192.168.1.1` or `192.168.0.1`)
3. Login with router credentials
4. Find "DHCP Reservation" or "Static IP" settings
5. Add reservation for your laptop's MAC address → `192.168.1.50`

**Find MAC Address:**

**macOS:**
```bash
ifconfig en0 | grep ether
```

**Windows:**
```bash
ipconfig /all
# Look for "Physical Address"
```

**Linux:**
```bash
ip link show
```

### Step 6: Start the Server

```bash
# From FRA/server directory
docker-compose up -d

# This will:
# 1. Download necessary Docker images
# 2. Create PostgreSQL database
# 3. Start API server
# 4. Start web dashboard
# 5. Configure automatic backups

# Wait for services to start (30-60 seconds)
```

**Verify Services Running:**
```bash
# Check running containers
docker-compose ps

# Should show:
# NAME                STATUS
# fire-server-db      Up
# fire-server-api     Up
# fire-server-web     Up
```

**View Logs:**
```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs api
docker-compose logs db
```

### Step 7: Initialize Database

```bash
# Run database migrations
docker-compose exec api npm run migrate

# Seed with initial data (optional)
docker-compose exec api npm run seed

# Should output:
# ✓ Database schema created
# ✓ Initial data loaded
```

### Step 8: Test the Server

**Access Web Dashboard:**
1. Open web browser
2. Go to: `http://192.168.1.50:3000` (use your laptop's IP)
3. You should see the Fire Assessment Dashboard login screen

**Test API Endpoints:**
```bash
# Test ping endpoint
curl http://192.168.1.50:3000/api/ping

# Should return: {"status":"ok","timestamp":"..."}

# Test database connection
curl http://192.168.1.50:3000/api/health

# Should return: {"status":"healthy","database":"connected"}
```

**From Your Phone (on same WiFi):**
1. Connect phone to same WiFi network
2. Open browser on phone
3. Go to: `http://192.168.1.50:3000`
4. Should see dashboard

**If you can't connect:**
- Check firewall settings (see Troubleshooting below)
- Verify both devices on same WiFi network
- Verify laptop IP address is correct

### Step 9: Configure Auto-Start (Optional)

**macOS/Linux:**
```bash
# Docker Desktop starts automatically on macOS

# On Linux, ensure Docker starts on boot:
sudo systemctl enable docker

# Server containers restart automatically (configured in docker-compose.yml)
```

**Windows:**
```bash
# Docker Desktop > Settings > General
# Check "Start Docker Desktop when you log in"
```

### Step 10: Configure Backups

**Create Backup Directory:**
```bash
# Create directory on external drive
mkdir -p /Volumes/Backup/FireAssessments
# On Windows: mkdir D:\Backup\FireAssessments
# On Linux: mkdir -p /mnt/backup/FireAssessments

# Update .env file with path
BACKUP_PATH=/Volumes/Backup/FireAssessments
```

**Test Manual Backup:**
```bash
# Run manual backup
docker-compose exec api npm run backup

# Check backup created
ls /Volumes/Backup/FireAssessments
# Should show: backup-2025-11-15-14-30-00.tar.gz
```

**Automatic Backups:**
- Configured to run daily at 2:00 AM (set in .env)
- Retention: 30 days of backups
- Notification on failure (check logs)

### Step 11: Server Management Commands

**Start Server:**
```bash
docker-compose up -d
```

**Stop Server:**
```bash
docker-compose down
```

**Restart Server:**
```bash
docker-compose restart
```

**View Logs:**
```bash
docker-compose logs -f
```

**Update Server:**
```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose up -d --build
```

**Backup Database Manually:**
```bash
docker-compose exec api npm run backup
```

**Restore from Backup:**
```bash
docker-compose exec api npm run restore /path/to/backup.tar.gz
```

---

## Method 2: Native Installation

### Prerequisites

**Required Software:**
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Step 1: Install Node.js

**macOS:**
```bash
# Using Homebrew
brew install node

# Verify installation
node --version  # Should be v18 or higher
npm --version
```

**Windows:**
```bash
# Download installer from:
# https://nodejs.org/

# Run installer
# Verify in Command Prompt:
node --version
npm --version
```

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Step 2: Install PostgreSQL

**macOS:**
```bash
# Using Homebrew
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Verify installation
psql --version
```

**Windows:**
```bash
# Download installer from:
# https://www.postgresql.org/download/windows/

# Run installer (remember password you set!)

# Add to PATH if needed
# Verify in Command Prompt:
psql --version
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify
psql --version
```

### Step 3: Create Database

**macOS/Linux:**
```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE fire_assessments;
CREATE USER fireassess WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE fire_assessments TO fireassess;

# Exit psql
\q
```

**Windows:**
```bash
# Open SQL Shell (psql) from Start Menu
# Connect with postgres user (use password from install)

# Create database and user
CREATE DATABASE fire_assessments;
CREATE USER fireassess WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE fire_assessments TO fireassess;

# Exit
\q
```

### Step 4: Clone Repository and Install Dependencies

```bash
# Clone repository
cd ~/Documents
git clone https://github.com/safeathomeapp/FRA.git
cd FRA/server

# Install dependencies
npm install

# Should install ~50 packages
```

### Step 5: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit configuration
nano .env  # or your preferred editor
```

**Configuration (.env):**
```env
# Database
DATABASE_URL=postgresql://fireassess:your-secure-password@localhost:5432/fire_assessments

# API
PORT=3000
NODE_ENV=production

# Network
HOST=0.0.0.0
LAPTOP_IP=192.168.1.50

# Backups
BACKUP_ENABLED=true
BACKUP_PATH=/path/to/external/drive/backups
BACKUP_TIME=02:00
BACKUP_RETENTION_DAYS=30
```

### Step 6: Initialize Database

```bash
# Run migrations
npm run migrate

# Should output:
# ✓ Running migrations...
# ✓ Created assessments table
# ✓ Created floors table
# ✓ Created rooms table
# ✓ Created fire_safety_items table
# ✓ Created photos table
# ✓ All migrations complete
```

### Step 7: Start the Server

```bash
# Start API server
npm run start

# Should output:
# 🚀 Server running on http://0.0.0.0:3000
# 📊 Database connected
# ✓ Ready to accept connections
```

**In a new terminal, start the web dashboard:**
```bash
cd FRA/server/dashboard
npm install
npm run build
npm run serve

# Should output:
# 🌐 Dashboard running on http://localhost:3000
```

### Step 8: Configure Auto-Start

**macOS (using launchd):**
```bash
# Create launch agent
nano ~/Library/LaunchAgents/com.fireassess.server.plist
```

**Paste this configuration:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.fireassess.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/YOUR_USERNAME/Documents/FRA/server/src/index.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/YOUR_USERNAME/Documents/FRA/server/logs/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/YOUR_USERNAME/Documents/FRA/server/logs/stderr.log</string>
</dict>
</plist>
```

**Load the service:**
```bash
# Replace YOUR_USERNAME with your actual username
# Load service
launchctl load ~/Library/LaunchAgents/com.fireassess.server.plist

# Check status
launchctl list | grep fireassess
```

**Windows (using NSSM):**
```bash
# Download NSSM from: https://nssm.cc/download
# Extract to C:\nssm

# Install service
C:\nssm\nssm.exe install FireAssessServer "C:\Program Files\nodejs\node.exe" "C:\Users\YOUR_USERNAME\Documents\FRA\server\src\index.js"

# Start service
C:\nssm\nssm.exe start FireAssessServer

# Service will now start automatically on boot
```

**Linux (using systemd):**
```bash
# Create service file
sudo nano /etc/systemd/system/fireassess-server.service
```

**Paste this configuration:**
```ini
[Unit]
Description=Fire Assessment Server
After=network.target postgresql.service

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/Documents/FRA/server
ExecStart=/usr/bin/node /home/YOUR_USERNAME/Documents/FRA/server/src/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=fireassess-server

[Install]
WantedBy=multi-user.target
```

**Enable and start service:**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable fireassess-server

# Start service now
sudo systemctl start fireassess-server

# Check status
sudo systemctl status fireassess-server
```

---

## Firewall Configuration

The server must be accessible on your local network. Configure your firewall to allow connections.

### macOS

```bash
# Option 1: System Preferences
# System Preferences > Security & Privacy > Firewall
# Click "Firewall Options"
# Add Node.js and allow incoming connections

# Option 2: Command line (if firewall enabled)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

### Windows

```bash
# Open Windows Defender Firewall
# Click "Advanced settings"
# Inbound Rules > New Rule
# Port > TCP > 3000
# Allow the connection
# Apply to all profiles (Domain, Private, Public)
# Name: Fire Assessment Server
```

### Linux (UFW)

```bash
# Allow port 3000 from local network only
sudo ufw allow from 192.168.1.0/24 to any port 3000

# Or allow from any source (less secure)
sudo ufw allow 3000

# Enable firewall if not already enabled
sudo ufw enable
```

---

## Testing the Installation

### 1. Test Database Connection

```bash
# Using psql
psql postgresql://fireassess:your-password@localhost:5432/fire_assessments

# List tables
\dt

# Should show: assessments, floors, rooms, fire_safety_items, photos
# Exit
\q
```

### 2. Test API Endpoints

```bash
# Ping endpoint
curl http://localhost:3000/api/ping
# Response: {"status":"ok"}

# Health check
curl http://localhost:3000/api/health
# Response: {"status":"healthy","database":"connected"}

# From phone (replace with your laptop IP)
curl http://192.168.1.50:3000/api/ping
```

### 3. Test Web Dashboard

1. Open browser
2. Go to `http://localhost:3000` (on laptop)
3. Go to `http://192.168.1.50:3000` (from phone on same WiFi)
4. Should see dashboard interface

### 4. Test Backup System

```bash
# Docker installation:
docker-compose exec api npm run backup

# Native installation:
npm run backup

# Check backup created:
ls /path/to/backup/directory
# Should show: backup-2025-11-15-HH-MM-SS.tar.gz
```

---

## Troubleshooting

### Can't connect from phone to laptop

**Check 1: Same WiFi network?**
```bash
# On laptop, check WiFi name:
# macOS: Click WiFi icon in menu bar
# Windows: Click WiFi icon in system tray
# Linux: nmcli device wifi

# On phone: Settings > WiFi > Check connected network
```

**Check 2: Correct IP address?**
```bash
# Verify laptop IP:
# macOS: ipconfig getifaddr en0
# Windows: ipconfig
# Linux: ip addr show
```

**Check 3: Firewall blocking?**
```bash
# Temporarily disable firewall to test:
# macOS: System Preferences > Security & Privacy > Firewall > Turn Off
# Windows: Windows Defender Firewall > Turn off (don't forget to turn back on!)
# Linux: sudo ufw disable

# Try connecting from phone
# If it works, firewall is the issue - configure properly and re-enable
```

**Check 4: Server running?**
```bash
# Docker:
docker-compose ps

# Native:
# Check if process running on port 3000
# macOS/Linux: lsof -i :3000
# Windows: netstat -ano | findstr :3000
```

### Database connection errors

**Error: "password authentication failed"**
```bash
# Check password in .env matches database
# Recreate user with correct password:
psql postgres
DROP USER fireassess;
CREATE USER fireassess WITH PASSWORD 'correct-password';
GRANT ALL PRIVILEGES ON DATABASE fire_assessments TO fireassess;
\q
```

**Error: "database does not exist"**
```bash
# Create database:
psql postgres
CREATE DATABASE fire_assessments;
\q

# Run migrations again
npm run migrate
```

### Docker issues

**Error: "Cannot connect to Docker daemon"**
```bash
# macOS: Make sure Docker Desktop is running
# Linux: sudo systemctl start docker
# Windows: Start Docker Desktop from Start Menu
```

**Error: "Port 3000 already in use"**
```bash
# Find process using port 3000:
# macOS/Linux: lsof -i :3000
# Windows: netstat -ano | findstr :3000

# Kill the process or change port in .env
# Then restart: docker-compose up -d
```

**Error: "No space left on device"**
```bash
# Docker uses disk space for images/volumes
# Clean up unused resources:
docker system prune -a

# Check available space:
df -h  # macOS/Linux
```

### Backup failures

**Check backup directory exists and is writable:**
```bash
# Create directory if missing:
mkdir -p /path/to/backup

# Check permissions:
ls -la /path/to/backup

# Make writable if needed:
chmod 755 /path/to/backup
```

**Check external drive mounted:**
```bash
# macOS: ls /Volumes
# Linux: df -h
# Windows: Check in File Explorer
```

---

## Server Management

### Viewing Logs

**Docker:**
```bash
# All logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs api
```

**Native:**
```bash
# If using systemd (Linux)
sudo journalctl -u fireassess-server -f

# If using launchd (macOS)
tail -f ~/Documents/FRA/server/logs/stdout.log

# If using NSSM (Windows)
# Check Event Viewer > Application logs
```

### Updating the Server

```bash
# Navigate to server directory
cd ~/Documents/FRA

# Pull latest changes
git pull origin main

# Docker installation:
docker-compose down
docker-compose up -d --build

# Native installation:
npm install  # Update dependencies if changed
npm run migrate  # Run new migrations
npm restart  # or restart your service
```

### Database Maintenance

**Backup:**
```bash
# Manual backup
npm run backup

# Or using pg_dump directly:
pg_dump -U fireassess fire_assessments > backup.sql
```

**Restore:**
```bash
# Using backup tool
npm run restore /path/to/backup.tar.gz

# Or using psql:
psql -U fireassess fire_assessments < backup.sql
```

**Vacuum database (optimize):**
```bash
psql -U fireassess fire_assessments -c "VACUUM ANALYZE;"
```

---

## Security Checklist

- [ ] Changed default PostgreSQL password
- [ ] Configured firewall to allow only local network
- [ ] Set static IP on router
- [ ] Enabled automatic backups to external drive
- [ ] Server NOT accessible from internet (no port forwarding)
- [ ] Strong password for database user
- [ ] Regular backup testing (restore from backup)
- [ ] Laptop configured to lock when idle
- [ ] External backup drive stored securely

---

## Next Steps

1. **Server is running** ✓
2. **Configure phone app** - Update server IP in phone app settings
3. **Test sync** - Complete test assessment on phone, trigger sync
4. **Access dashboard** - View synced data on laptop
5. **Configure auto-backups** - Ensure external drive connected
6. **Document your setup** - Note your IP, WiFi name, backup location

---

## Support

**Check status:**
```bash
# Docker
docker-compose ps

# Native (systemd)
sudo systemctl status fireassess-server
```

**Restart server:**
```bash
# Docker
docker-compose restart

# Native (systemd)
sudo systemctl restart fireassess-server
```

**Full reset (WARNING: Deletes all data):**
```bash
# Docker
docker-compose down -v
docker-compose up -d
npm run migrate

# Native
psql -U fireassess fire_assessments -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
```

---

**Last Updated:** 15 November 2025  
**Version:** 1.0.0  
**Repository:** https://github.com/safeathomeapp/FRA
