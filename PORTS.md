# Port Configuration Documentation

## Fire Risk Assessment (FRA) - Port Assignments

This document ensures no conflicts with other projects running on the same machine.

### Development Ports

| Service | Port | Host | Purpose | Status |
|---------|------|------|---------|--------|
| **FRA Server API** | **3100** | 0.0.0.0 | Node.js/Express backend API | ✅ ASSIGNED |
| **Other Project 1** | 3000 | - | (Reserved - do not use) | 🚫 IN USE |
| **Other Project 2** | 3005 | - | (Reserved - do not use) | 🚫 IN USE |
| **PostgreSQL** | 5432 | localhost | Database server | ✅ ASSIGNED |

### Testing the FRA Server

```bash
# Start the server
cd C:\Users\kevth\Desktop\FRA\server
npm run dev

# Server runs at:
http://localhost:3100/api/ping
http://localhost:3100/api/health
http://localhost:3100/

# From phone on same WiFi:
http://192.168.1.50:3100/api/sync
```

### Port Selection Rationale

**Why Port 3100 for FRA?**
- 3000, 3005 already in use
- 3100 is unused and follows the 31xx range (development convention)
- Does not conflict with other services
- Easy to remember (3-1-0-0)
- Safe distance from well-known ports (< 1024)

### Future Port Assignments

If you need additional services in FRA, use this progression:
- `3101` - React Web Dashboard (if separate from API)
- `3102` - WebSocket server (for real-time sync)
- `3103` - Admin panel or monitoring
- `5433+` - Additional PostgreSQL instances (if needed)

### Configuration Files

FRA server port is configured in:
- `server/.env` → `PORT=3100`
- `server/.env.example` → `PORT=3100`

Change these values if you need to use a different port.

### Common Port Conflicts

If port 3100 is still in use, try:
```bash
# Find what's using port 3100
netstat -ano | findstr :3100

# Or kill the process (Windows)
taskkill /F /PID [PID_NUMBER]
```

---

**Last Updated:** November 16, 2025
**Status:** Active
**Review Date:** Before adding new services
