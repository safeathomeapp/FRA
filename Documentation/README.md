# Fire Risk Assessment Mobile Application

## Project Overview

A cross-platform mobile application designed for professional fire risk assessments in commercial and residential buildings, with initial focus on Android deployment and future iOS/iPad expansion.

### Primary User
Housing association fire safety assessor conducting inspections of:
- Communal areas in blocks of flats (20-30 floors typical)
- Sheltered housing facilities
- Commercial premises (restaurants, garages, shops)
- Multiple properties per day (30 mins to 3+ hours per assessment)

### Core Problem Being Solved
Current workflow pain points:
1. **Delayed floor plan delivery** - CubiCasa/similar services take 24 hours, causing issues mapping hazards to locations across multiple daily assessments
2. **Individual item tracking** - Contractors need specific identification of failed items (e.g., "Emergency Light #3 near Flat 29" not "2 emergency lights failed")
3. **Scale representation challenges** - Cannot use true-to-scale floor plans (200m corridors vs 2m cupboards on phone screen)
4. **Multi-floor complexity** - Large buildings (20-30 floors, 100+ rooms, 1000+ items) require efficient navigation and data entry

## Solution Architecture

### Phase 1: Android Application (Current Focus)
Build fully functional Android app with manual floor plan sketching and complete assessment workflow.

### Phase 2: iOS/iPad Integration (Future)
Port codebase to iOS and integrate with Apple's RoomPlan API for real-time LiDAR-based floor plan generation.

### Technology Stack

**Mobile App (React Native):**
- Cross-platform compatibility (90%+ code reuse Android → iOS)
- Developer already familiar with React
- Strong ecosystem for required features
- Excellent PDF generation libraries

**Key Dependencies:**
- `react-native-canvas` or `react-native-svg` - Floor plan drawing
- `react-native-image-picker` - Photo capture
- `react-native-pdf` - Report generation
- `@react-native-async-storage` - Local data persistence
- `react-native-fs` - File system operations
- `@react-native-community/netinfo` - WiFi detection for sync

**Target Devices:**
- Primary: Samsung Galaxy S25 series (ARCore compatible)
- Test device: OnePlus Nord CE 2 (OxygenOS 13.0, ARCore supported)

**Local Server (Home/Office Laptop):**
- **Backend:** Node.js + Express (lightweight API)
- **Database:** PostgreSQL (historical data archive)
- **Web Dashboard:** React web app
- **Deployment:** Docker container (recommended) or native installation
- **Network:** Local WiFi only (192.168.x.x) - no internet exposure
- **Access:** http://[laptop-ip]:3000

**Architecture Benefits:**
- ✅ Phone works 100% offline in field
- ✅ Automatic backup when home WiFi detected
- ✅ Zero cloud hosting costs (£0/month ongoing)
- ✅ Complete data privacy (never leaves local network)
- ✅ Professional laptop interface for coordinators
- ✅ Historical data archive and analytics

## System Design

### Data Model

```javascript
Assessment {
  id: UUID
  property_name: String
  property_address: String
  client_name: String
  assessment_date: Date
  assessor_name: String
  assessor_credentials: String
  status: Enum['in_progress', 'completed', 'reviewed']
  created_at: Timestamp
  updated_at: Timestamp
  floors: Floor[]
}

Floor {
  id: UUID
  assessment_id: UUID (FK)
  floor_number: Integer
  floor_name: String  // "Ground Floor", "Floor 1", "Basement"
  is_template: Boolean  // For copying to identical floors
  rooms: Room[]
}

Room {
  id: UUID
  floor_id: UUID (FK)
  room_number: Integer
  room_name: String  // "Main Corridor A", "Bin Store", "Plant Room"
  room_type: Enum['corridor', 'stairwell', 'lobby', 'storage', 'plant_room', 'kitchen', 'office', 'other']
  dimensions: String  // "40m x 2m"
  actual_length: Float  // meters
  actual_width: Float   // meters
  schematic_layout: JSON  // Schematic representation data
  connections: String[]  // Array of connected room IDs
  inspection_status: Enum['not_started', 'in_progress', 'completed']
  notes: Text
  fire_safety_items: FireSafetyItem[]
  photos: Photo[]
}

FireSafetyItem {
  id: UUID
  room_id: UUID (FK)
  item_code: String  // Auto-generated: "F2-CORR-A-EL-003"
  item_number: Integer  // Sequential per type per room
  item_type: Enum[
    'emergency_light',
    'fire_extinguisher',
    'fire_alarm',
    'smoke_detector',
    'fire_door',
    'emergency_exit',
    'fire_blanket',
    'sprinkler_head',
    'fire_hose_reel',
    'emergency_signage',
    'other'
  ]
  location_description: String  // "Between Flats 29 & 30, ceiling mounted"
  location_on_schematic: JSON  // {x: 300, y: 100}
  status: Enum['pass', 'fail', 'missing', 'requires_attention']
  failure_reason: Text
  remedial_action: Text
  priority: Enum['critical', 'high', 'medium', 'low']
  requires_action: Boolean
  compliant_with_standard: Boolean
  last_service_date: Date
  next_service_due: Date
  photos: Photo[]
  notes: Text
  created_at: Timestamp
  updated_at: Timestamp
}

Photo {
  id: UUID
  parent_id: UUID  // Can be room_id or item_id
  parent_type: Enum['room', 'item']
  file_path: String
  thumbnail_path: String
  caption: String
  annotation_data: JSON  // Arrows, circles, text overlays
  taken_at: Timestamp
}
```

## Local Server Architecture

### Overview

The system uses a **local server approach** where the phone app works completely offline during field work, then syncs to a home/office laptop server when connected to WiFi. This provides automatic backup, historical data access, and coordinator tools without cloud hosting costs or privacy concerns.

### Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    HOME/OFFICE WIFI                          │
│                    (192.168.1.x)                             │
│                                                               │
│   ┌──────────────────┐              ┌──────────────────┐    │
│   │  Phone (Field)   │     Sync     │  Laptop (Server) │    │
│   │                  │ ←──────────→ │                  │    │
│   │ • Works offline  │   When WiFi  │ • PostgreSQL DB  │    │
│   │ • SQLite local   │   connected  │ • Node.js API    │    │
│   │ • Generates PDFs │              │ • Web dashboard  │    │
│   │ • Photos stored  │              │ • Backup system  │    │
│   └──────────────────┘              └──────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘

No internet connection required
No cloud services
No monthly hosting fees
Complete data privacy
```

### Data Flow

**During Field Work (Offline):**
```
Assessor on-site:
1. Phone works 100% offline
2. Complete multiple assessments
3. Data stored in local SQLite
4. Photos stored locally
5. Generate PDF reports on phone
6. Email/share PDFs directly from phone
```

**End of Day (Auto-Sync):**
```
Phone detects home WiFi:
1. Check laptop server available
2. Upload new/modified assessments
3. Upload photos (compressed)
4. Receive confirmation
5. Optional: Clear synced data from phone

Duration: 2-5 minutes for typical day's work
```

**Coordinator Work (Laptop Dashboard):**
```
Web interface at http://192.168.1.50:3000:
1. View all historical assessments
2. Search and filter properties
3. Generate batch reports
4. Export data for housing association
5. Analytics and statistics
6. Manage templates and checklists
```

### Sync Protocol

**Automatic Sync Trigger:**
```javascript
// Phone detects WiFi connection
NetInfo.addEventListener(state => {
  if (state.type === 'wifi' && 
      state.ssid === 'HomeNetwork' && 
      state.isConnected) {
    // Check if laptop server reachable
    checkServerAndSync();
  }
});
```

**Sync Sequence:**
```
1. Detect home WiFi ✓
   └─→ SSID: "HomeNetwork"
   
2. Ping laptop server
   └─→ http://192.168.1.50:3000/api/ping
   
3. Upload pending assessments
   ├─→ POST /api/sync/assessment
   ├─→ Includes all room data
   ├─→ Includes all item data
   └─→ Server returns confirmation
   
4. Upload photos (chunked)
   ├─→ POST /api/sync/photos
   ├─→ Compressed before upload
   ├─→ Progress indicator
   └─→ Retry on failure
   
5. Download updates (optional)
   ├─→ GET /api/sync/templates
   ├─→ Updated checklists
   └─→ Configuration changes
   
6. Update sync timestamp
   └─→ "Last synced: 15 Nov 2025, 18:45"
```

**Manual Sync Option:**
```
Settings > Data Sync
├── Last Sync: 2 hours ago ✓
├── Pending: 3 assessments, 47 photos
├── Server Status: ● Connected
└── [Sync Now] button
```

### Laptop Server Components

**1. Database (PostgreSQL)**
```sql
-- Same schema as phone SQLite
-- Stores all historical assessments
-- Optimized for querying and reporting
-- Automatic daily backups to external drive

Tables:
├── assessments (342 records)
├── floors (2,847 records)
├── rooms (8,234 records)
├── fire_safety_items (47,892 records)
└── photos (15,234 files)

Storage: ~50GB per year of assessments
```

**2. API Server (Node.js + Express)**
```javascript
// Lightweight REST API
// Runs on local network only (192.168.1.50:3000)
// No internet exposure

Endpoints:
├── POST /api/sync/assessment - Phone uploads data
├── POST /api/sync/photos - Photo upload
├── GET  /api/sync/status - Check sync state
├── GET  /api/assessments - Query assessments
├── GET  /api/reports/generate - Generate PDFs
└── GET  /api/analytics - Statistics
```

**3. Web Dashboard (React)**
```
Accessible at: http://192.168.1.50:3000

Features:
├── Assessment list with search/filter
├── Detailed view of any assessment
├── Generate PDF reports (single or batch)
├── Export to Excel/CSV
├── Analytics dashboard
└── Configuration management
```

**4. Backup System**
```bash
# Automated daily backup
# Runs at 2 AM daily
# Stores to external drive

Backup includes:
├── PostgreSQL database dump
├── All photos folder
├── Configuration files
└── 30-day retention

Backup location: /Volumes/Backup/FireAssessments/
```

### Server Setup

**Option 1: Docker (Recommended - 10 minutes)**
```bash
# On laptop (macOS/Linux/Windows)
git clone https://github.com/[your-repo]/fire-assessment-server
cd fire-assessment-server

# Single command to start everything
docker-compose up -d

# Services started:
# ✓ PostgreSQL database (port 5432)
# ✓ Node.js API (port 3000)
# ✓ Web dashboard (http://192.168.1.50:3000)
# ✓ Auto-start on boot

# Done! Server is running
```

**Option 2: Native Installation (30 minutes)**
```bash
# Install PostgreSQL
brew install postgresql  # macOS
# or: sudo apt install postgresql  # Linux

# Install Node.js 18+
brew install node

# Clone and setup
git clone [repo]
cd fire-assessment-server
npm install

# Initialize database
npm run setup-db

# Start server
npm start

# Optional: Auto-start on boot
npm run install-service
```

**Server Requirements:**
- **OS:** macOS, Linux, or Windows 10/11
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 100GB+ free (for 5 years of assessments)
- **Network:** WiFi or Ethernet
- **Always-on:** Laptop should be running when assessor returns home

### Network Configuration

**Static IP Assignment (Recommended):**
```
Router settings:
├── Laptop MAC address: XX:XX:XX:XX:XX:XX
├── Reserved IP: 192.168.1.50
└── Hostname: fire-assessment-server

Phone settings:
└── Server address: http://192.168.1.50:3000
```

**Security:**
```
✓ No internet exposure
✓ Local network only
✓ Firewall rules restrict to 192.168.1.x
✓ Optional: Password protection for web dashboard
✓ Optional: SSL/TLS for encrypted sync
```

### Conflict Resolution

**Single-User System (Simple):**
```
Phone is source of truth:
├── New assessments always from phone
├── Laptop is historical archive
├── No multi-user editing conflicts
└── Last-write-wins for any updates

Rare conflicts handled:
├── Phone data takes precedence
├── Server logs conflicts for review
└── Manual resolution if needed
```

**Multi-User Future Enhancement:**
```
If multiple assessors needed:
├── Each phone has assessor ID
├── Timestamp-based conflict detection
├── Server-side merge logic
└── Conflict notification system
```

### Data Management

**Phone Storage Strategy:**
```
Active assessments:
├── Keep last 30 days on phone
├── ~2-5GB typical

After sync:
├── Option 1: Keep all (if storage allows)
├── Option 2: Archive to laptop, keep recent only
└── User configurable

Settings > Storage Management:
├── Used: 4.2 GB / 128 GB
├── Synced assessments: 47 (archived)
├── [Clear Synced Data] button
└── Always keep recent 30 days
```

**Laptop Storage Strategy:**
```
PostgreSQL database:
├── Year 1: ~10-20 GB
├── Year 5: ~50-100 GB
├── Compressed backups: ~30% of DB size
└── Photos: ~20-40 GB per year

Total for 5 years: ~150-300 GB
Easily fits on modern laptop
External drive for backups recommended
```

### Cost Analysis

**Local Server Approach:**
```
One-time costs:
├── Laptop: £0 (already owned)
├── External drive: £50 (optional, for backups)
└── Development: Same as phone-only approach

Ongoing costs:
├── Hosting: £0/month
├── Database: £0/month
├── Storage: £0/month
├── Electricity: ~£2/month (laptop idle)
└── Internet: £0 (works offline)

Year 1 total: ~£74
Year 5 total: ~£170
```

**vs Cloud Hosting Alternative:**
```
Ongoing costs:
├── Server (AWS/DigitalOcean): £20-50/month
├── Database (managed): £10-20/month
├── Storage (S3/equivalent): £5-10/month
├── Bandwidth: £5-10/month
└── Total: £40-90/month

Year 1 total: £480-1,080
Year 5 total: £2,400-5,400

Savings with local server: £2,200-5,200 over 5 years
```

### Backup & Disaster Recovery

**Automatic Backups:**
```
Daily backup schedule:
├── Time: 02:00 AM
├── Full database dump
├── Incremental photo backup
├── Retention: 30 days
├── Location: External USB drive
└── Notification on failure

Weekly backup verification:
└── Test restore procedure
```

**Manual Backup:**
```
Dashboard > Settings > Backup
├── [Create Backup Now]
├── Last backup: 14 Nov 2025, 02:00
├── Size: 47.3 GB
└── Location: /Volumes/Backup/

Creates .tar.gz archive:
├── database.sql
├── photos/
├── config/
└── restore-instructions.txt
```

**Disaster Recovery:**
```
If laptop fails:
1. Phone data is safe (local SQLite)
2. Install server on new laptop
3. Restore from backup drive
4. Phone syncs on next WiFi connection
5. System operational within hours

If phone fails:
1. All synced data safe on laptop
2. Restore to new phone from laptop
3. Download last X days of assessments
4. Continue working
```

### Web Dashboard Features

**Dashboard Home:**
```
┌─────────────────────────────────────────────────────┐
│  Fire Assessment Dashboard                           │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Summary (Last 30 Days)                              │
│  ├── Assessments Completed: 47                       │
│  ├── Properties Inspected: 42                        │
│  ├── Items Requiring Action: 156                     │
│  └── Critical Issues: 7 ⚠️                            │
│                                                       │
│  Recent Assessments                                  │
│  ┌─────────────────────────────────────────────┐    │
│  │ Oak Towers - Floors 2-15    15 Nov 2025 ⚠️  │    │
│  │ Elm House - Complete        14 Nov 2025 ✓   │    │
│  │ Maple Court - Communal      14 Nov 2025 ⚠️  │    │
│  │ Birch Lodge - In Progress   14 Nov 2025 ○   │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  Quick Actions                                       │
│  [Generate Report] [Export Data] [Analytics]         │
└─────────────────────────────────────────────────────┘
```

**Assessment Search & Filter:**
```
Search: [Oak Tower_______________] [🔍]

Filters:
├── Date Range: [Last 30 days ▼]
├── Status: [All ▼]
├── Priority: [All ▼]
├── Assessor: [All ▼]
└── Property Type: [All ▼]

Results (47):
┌──────────────────────────────────────────────────────┐
│ ✓ Oak Towers          15 Nov 2025  3 high priority   │
│ ✓ Elm House           14 Nov 2025  All compliant     │
│ ⚠️ Maple Court         14 Nov 2025  7 medium priority │
│ ...                                                   │
└──────────────────────────────────────────────────────┘

[Export Selected] [Generate Batch Report]
```

**Analytics Dashboard:**
```
Compliance Trends
├── Overall compliance rate: 94.8%
├── Most common issues: Expired fire extinguishers
├── Properties with critical issues: 12
└── Average items per property: 127

Charts:
├── Compliance rate over time (line graph)
├── Issue types breakdown (pie chart)
├── Properties by risk level (bar chart)
└── Monthly assessment volume (area chart)

Export options:
└── [Excel] [CSV] [PDF Report]
```

### Advantages Summary

**vs Pure Offline Phone-Only:**
```
✓ Automatic backup to laptop
✓ Access historical data from laptop
✓ Professional web interface for coordinators
✓ Better for batch operations (reports, exports)
✓ Data analytics across all properties
✓ Coordinator can review without needing phone
✓ No risk of phone data loss
```

**vs Cloud Hosting:**
```
✓ Zero monthly hosting costs (£0 vs £40-90/month)
✓ No internet required for any operations
✓ Complete data privacy (never leaves home network)
✓ Faster sync (local gigabit WiFi vs internet)
✓ One-time setup (no ongoing server management)
✓ No vendor lock-in
✓ Works even if internet is down
✓ Simpler architecture (no cloud APIs, auth, etc.)
```

**Best of Both Worlds:**
```
✓ Phone works offline in field (100% uptime)
✓ Automatic backup when home (peace of mind)
✓ Professional laptop interface (coordinator tools)
✓ Zero cloud dependencies (privacy + cost)
✓ Simple setup (Docker one-liner)
✓ Scalable (could add cloud sync later if needed)
```

### Floor Plan Strategy: Schematic Representation

**Problem:** Cannot use true-to-scale architectural drawings on mobile screens
- 200m corridors would make 2m cupboards invisible
- Impossible to annotate hazards on tiny spaces
- Unusable for on-site work

**Solution:** Non-scale schematic floor plans (inspired by London Underground map)
- Each room represented as standard-sized block on screen
- Shows spatial relationships and connections
- Actual dimensions displayed as text labels
- Prioritizes usability over architectural accuracy

**Example Schematic:**
```
┌─────────────┐  ┌──────┐  ┌─────────────┐
│  Entrance   │──│ Lift │  │  Stairwell  │
│   Lobby     │  │ 2x2m │  │   3x4m      │
│   4x6m      │  └──────┘  └─────────────┘
└─────────────┘      │            │
       │             │            │
┌─────────────────────────────────────────┐
│    Main Corridor (40m x 2m)             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │Flat │ │Flat │ │Flat │ │Flat │       │
│  │  1  │ │  2  │ │  3  │ │  4  │       │
└──┴─────┴─┴─────┴─┴─────┴─┴─────┴───────┘
```

### User Interface Flow

#### Level 1: Assessment List
```
My Assessments
├── Oak Towers (In Progress)
│   └── Started: 14 Nov 2025
├── Elm House (Completed)
│   └── Completed: 10 Nov 2025
└── [+ New Assessment]
```

#### Level 2: Building Structure
```
Oak Towers - 25 Floor Block
├── Ground Floor [12 rooms] ✓
├── Floor 1 [8 rooms] ✓
├── Floor 2 [8 rooms] ⚠️  (3 issues found)
├── Floor 3 [8 rooms] ○  (Not started)
├── ...
├── Floor 24 [8 rooms]
└── Roof Access [2 rooms]

Icons:
✓ = Completed with no issues
⚠️ = Completed with issues found
○ = Not yet inspected
```

#### Level 3: Floor Room List
```
Floor 2 - Communal Areas
┌────────────────────────────────┐
│ Landing               ✓        │
│ Corridor A            ⚠️ [3]   │  ← 3 items failed
│ Corridor B            ✓        │
│ Stairwell             ○        │
│ Bin Store             ○        │
│ Plant Room            ○        │
└────────────────────────────────┘

[+ Add Room]
```

#### Level 4: Room Inspection
```
┌────────────────────────────────┐
│ CORRIDOR A - FLOOR 2            │
│ Dimensions: 40m x 2m            │
├────────────────────────────────┤
│ [View Floor Plan Schematic]     │
├────────────────────────────────┤
│ Fire Safety Items:              │
│                                 │
│ Emergency Lights (4):           │
│ • EL #1 (Near Flat 21)    ✓    │
│ • EL #2 (Mid corridor)    ✓    │
│ • EL #3 (Near Flat 30)    ❌   │
│ • EL #4 (Near stairwell)  ✓    │
│                                 │
│ Fire Extinguishers (2):         │
│ • FE #1 (Left wall)       ❌   │
│ • FE #2 (Near exit)       ✓    │
│                                 │
│ Fire Alarms (2):                │
│ • FA #1 (Ceiling)         ✓    │
│ • FA #2 (Near lift)       ✓    │
│                                 │
│ [+ Add Item]                    │
│ [Complete Room]                 │
└────────────────────────────────┘
```

#### Level 5: Individual Item Detail
```
┌────────────────────────────────┐
│ Emergency Light #3              │
│ Code: F2-CORR-A-EL-003         │
├────────────────────────────────┤
│ Location:                       │
│ Between Flats 29 & 30          │
│ Ceiling mounted, left side      │
│                                 │
│ [Mark on Floor Plan]            │
│                                 │
│ Status:                         │
│ ○ Pass  ● Fail  ○ Missing      │
│                                 │
│ Issue Details:                  │
│ ┌────────────────────────────┐ │
│ │ Not illuminating when      │ │
│ │ mains power cut            │ │
│ └────────────────────────────┘ │
│                                 │
│ Remedial Action:                │
│ ┌────────────────────────────┐ │
│ │ Replace emergency light    │ │
│ │ unit                       │ │
│ └────────────────────────────┘ │
│                                 │
│ Priority:                       │
│ ○ Critical  ● High             │
│ ○ Medium    ○ Low              │
│                                 │
│ Photos:                         │
│ [📷 Take Photo] [📁 Gallery]   │
│ [img] [img] [img]              │
│                                 │
│ [Save]                          │
└────────────────────────────────┘
```

### Efficiency Features

#### 1. Floor Template Duplication
For buildings with identical floor layouts (common in high-rise blocks):
```
You're on Floor 3
┌────────────────────────────────┐
│ This floor matches:             │
│ ☑ Floor 1                       │
│ ☐ Floor 2                       │
│                                 │
│ Copy room layout and expected   │
│ items from Floor 1?             │
│                                 │
│ You'll still inspect each item, │
│ this just saves setup time.     │
│                                 │
│ [Copy Layout]  [Start Fresh]   │
└────────────────────────────────┘
```

**Result:** Room list, item types, and locations pre-populated. Assessor just updates pass/fail status.

#### 2. Quick Status Mode
For rooms with all compliant items (most common case):
```
Corridor B - Quick Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Emergency Lights (4):
□ EL #1  □ EL #2  □ EL #3  □ EL #4
[✓ All Pass]  [Individual Status]

Fire Extinguishers (2):
□ FE #1  □ FE #2
[✓ All Pass]  [Individual Status]

Fire Alarms (2):
□ FA #1  □ FA #2
[✓ All Pass]  [Individual Status]

[Save & Next Room]
```

**Only failed items require:**
- Photo
- Detailed notes
- Remedial action description
- Priority setting

#### 3. Item Auto-Numbering
System automatically generates unique identifiers:
- Format: `{Floor}-{Room}-{Type}-{Number}`
- Examples:
  - `GF-LOBBY-EL-001` = Ground Floor, Lobby, Emergency Light #1
  - `F2-CORR-A-EL-003` = Floor 2, Corridor A, Emergency Light #3
  - `F12-PLANT-FE-002` = Floor 12, Plant Room, Fire Extinguisher #2

**Benefits:**
- Unique identification for contractors
- Easy to reference in reports
- Sortable and filterable
- Professional appearance

### PDF Report Generation

#### Report Structure

**Page 1: Cover Page**
- Property name and address
- Assessment date
- Assessor details and credentials
- Client/housing association branding
- Report reference number

**Page 2: Executive Summary**
```
Assessment Summary
─────────────────────────────────
Property: Oak Towers, 25 floors
Date: 15 November 2025
Assessor: [Name], [Credentials]

Overall Status: REQUIRES ATTENTION

Items Inspected: 847
├── Pass: 812 (95.9%)
└── Require Attention: 35 (4.1%)

Priority Breakdown:
├── Critical: 5 items
├── High: 12 items
├── Medium: 18 items
└── Low: 0 items

Compliance Standard: PAS 79:2020
Overall Risk Rating: MODERATE
```

**Page 3: Floor-by-Floor Summary Table**
```
Floor | Rooms | Items | Pass | Fail | Issues
------|-------|-------|------|------|--------
GF    | 12    | 45    | 42   | 3    | ⚠️
F1    | 8     | 32    | 32   | 0    | ✓
F2    | 8     | 32    | 29   | 3    | ⚠️
F3    | 8     | 32    | 31   | 1    | ⚠️
...   | ...   | ...   | ...  | ...  | ...
F24   | 8     | 32    | 30   | 2    | ⚠️
Roof  | 2     | 8     | 8    | 0    | ✓
------|-------|-------|------|------|--------
TOTAL | 206   | 847   | 812  | 35   |
```

**Pages 4-X: Detailed Findings (Issues Only)**

Only include rooms/floors with failed items. Each issue gets:

```
═══════════════════════════════════════════════
FLOOR 2 - CORRIDOR A
───────────────────────────────────────────────
Room Dimensions: 40m x 2m
Floor Plan Reference: See Appendix A, Page X

[Schematic diagram showing item locations]

ITEMS REQUIRING ATTENTION:

─────────────────────────────────────────────
1. Emergency Light #3
   Item Code: F2-CORR-A-EL-003
   Location: Between Flats 29 & 30, ceiling mounted
   
   Current Status: FAILED
   Issue: Not illuminating when mains power cut
   Last Service: Unknown
   
   [PHOTO]
   
   Remedial Action Required:
   Replace emergency light unit with equivalent 
   3-hour battery backup model
   
   Priority: HIGH
   Target Completion: Within 30 days
   Estimated Cost: £80-120
─────────────────────────────────────────────

2. Fire Extinguisher #1
   Item Code: F2-CORR-A-FE-001
   Location: Left wall, opposite Flat 25
   
   Current Status: EXPIRED SERVICE
   Issue: Last service date 15/03/2023 (expired)
   Next Service Due: 15/03/2024 (overdue by 8 months)
   
   [PHOTO]
   
   Remedial Action Required:
   Arrange immediate service inspection and 
   recertification by approved contractor
   
   Priority: MEDIUM
   Target Completion: Within 14 days
   Estimated Cost: £45-60
─────────────────────────────────────────────
═══════════════════════════════════════════════
```

**Pages Y-Z: Appendices**
- Appendix A: Floor plan schematics (all floors)
- Appendix B: Photographic evidence (all photos)
- Appendix C: Assessor credentials and certifications
- Appendix D: Compliance standards reference

**Final Pages: Contractor Action List**
```
REMEDIAL ACTIONS SCHEDULE
═════════════════════════════════════════════

CRITICAL PRIORITY (Action within 7 days)
─────────────────────────────────────────────
□ F12-CORR-B-FD-002
  Floor 12, Corridor B - Fire Door (Stairwell)
  Issue: Door closer mechanism damaged
  Action: Replace door closer
  Est. Cost: £150-200
  Sign-off: __________ Date: __________

□ GF-PLANT-FE-003
  Ground Floor, Plant Room - Fire Extinguisher
  Issue: Missing from designated location
  Action: Install new CO2 extinguisher
  Est. Cost: £90-120
  Sign-off: __________ Date: __________

HIGH PRIORITY (Action within 30 days)
─────────────────────────────────────────────
□ F2-CORR-A-EL-003
  Floor 2, Corridor A - Emergency Light #3
  Issue: Not illuminating
  Action: Replace unit
  Est. Cost: £80-120
  Sign-off: __________ Date: __________

□ F8-LOBBY-FA-001
  Floor 8, Lift Lobby - Fire Alarm
  Issue: Intermittent fault
  Action: Test and replace if necessary
  Est. Cost: £120-180
  Sign-off: __________ Date: __________

MEDIUM PRIORITY (Action within 90 days)
─────────────────────────────────────────────
□ F2-CORR-A-FE-001
  Floor 2, Corridor A - Fire Extinguisher #1
  Issue: Service expired
  Action: Arrange service/recertification
  Est. Cost: £45-60
  Sign-off: __________ Date: __________

[... continues for all items requiring attention]

─────────────────────────────────────────────
Total Estimated Cost: £3,450 - £4,680
─────────────────────────────────────────────

Coordinator Sign-off:
All works reviewed and assigned: ________________
Date: __________

Completion Certificate:
All remedial actions completed: _________________
Date: __________
Final inspection required: ☐ Yes  ☐ No
```

## Development Roadmap

### Phase 1: Core Android Application (Weeks 1-8)

#### Week 1-2: Project Setup & Basic Structure
**Deliverables:**
- React Native project initialized
- Navigation structure implemented (5-level hierarchy)
- Basic data models in SQLite
- Assessment CRUD operations
- Simple list views (assessments, floors, rooms)

**Technical Tasks:**
- Set up React Native CLI project
- Configure ESLint, Prettier
- Install core dependencies
- Design database schema (SQLite for phone)
- Implement local storage layer
- Create basic navigation stack

**Success Criteria:**
- Can create new assessment
- Can add floors and rooms
- Can navigate between screens
- Data persists between app restarts

#### Week 3-4: Manual Floor Plan Sketcher
**Deliverables:**
- Canvas-based drawing interface
- Room shape tools (rectangle, L-shape, polygon)
- Room labeling and dimensioning
- Basic schematic rendering
- Floor plan save/load functionality

**Technical Tasks:**
- Implement React Native Canvas or SVG
- Create drawing tools UI
- Build shape manipulation (drag, resize)
- Add text labels and dimension inputs
- Implement zoom/pan for large plans
- Export floor plan as PNG overlay

**Success Criteria:**
- Can draw simple room layouts
- Can add multiple rooms per floor
- Rooms can be labeled and dimensioned
- Floor plans save correctly
- Visual quality acceptable for reports

#### Week 5-6: Fire Safety Item Management
**Deliverables:**
- Item creation and editing interface
- Item type picker (emergency lights, extinguishers, etc.)
- Photo capture and attachment
- Location marking on floor plans
- Status tracking (pass/fail/missing)
- Auto-numbering system

**Technical Tasks:**
- Build item detail form
- Integrate react-native-image-picker
- Implement photo annotation tools
- Create location picker for floor plans
- Build item code generation logic
- Implement item status workflow

**Success Criteria:**
- Can add items to rooms
- Can capture and attach photos
- Items correctly numbered and coded
- Can mark item locations on floor plan
- Status changes tracked properly

#### Week 7-8: Assessment Workflow & Templates
**Deliverables:**
- Floor template duplication feature
- Quick status mode for compliant items
- Room completion tracking
- Assessment progress indicators
- Notes and observations system

**Technical Tasks:**
- Build template copying logic
- Create quick-check UI
- Implement progress calculation
- Add completion confirmations
- Build notes/comments system
- Create status summary views

**Success Criteria:**
- Can copy floor layouts efficiently
- Quick mode speeds up compliant rooms
- Progress accurately tracked
- Can mark assessments as complete
- All data properly validated

### Phase 2: Reporting & Polish (Weeks 9-12)

#### Week 9-10: PDF Report Generation
**Deliverables:**
- Professional PDF template
- Multi-page report structure
- Photo gallery integration
- Floor plan embeddings
- Contractor action list

**Technical Tasks:**
- Integrate react-native-pdf or alternative
- Design PDF layout components
- Implement page generation logic
- Add photo compression/optimization
- Build action list sorting/filtering
- Create PDF preview functionality

**Success Criteria:**
- PDF matches expected format
- All data correctly populated
- Photos display properly
- Floor plans render clearly
- Action list properly formatted

#### Week 11: Testing & Refinement
**Deliverables:**
- Complete end-to-end testing
- Performance optimization
- Bug fixes
- UI/UX improvements based on feedback

**Technical Tasks:**
- Conduct full assessment workflow tests
- Test with realistic data volumes (1000+ items)
- Optimize database queries
- Improve loading times
- Refine UI based on user testing
- Fix identified bugs

**Success Criteria:**
- App handles large assessments smoothly
- No critical bugs
- UI responsive and intuitive
- Real-world assessment can be completed

#### Week 12: Documentation & Initial Deployment
**Deliverables:**
- User manual/guide
- Technical documentation
- First production release (phone-only)

**Technical Tasks:**
- Write user documentation
- Create video tutorials
- Build signed APK
- Conduct final testing
- Deploy to test users

**Success Criteria:**
- Documentation complete
- App ready for production use
- Deployment successful
- User can operate independently

### Phase 3: Local Server Development (Weeks 13-18)

#### Week 13-14: Server Backend & Database
**Deliverables:**
- PostgreSQL database setup
- Node.js/Express API server
- Sync endpoints
- Database migration scripts
- Docker containerization

**Technical Tasks:**
- Design PostgreSQL schema (matches phone SQLite)
- Set up Node.js + Express project
- Implement REST API endpoints:
  - POST /api/sync/assessment
  - POST /api/sync/photos
  - GET /api/sync/status
  - GET /api/assessments
  - GET /api/reports/generate
- Create database migration scripts
- Build Docker Compose configuration
- Implement backup system

**Success Criteria:**
- Server runs on laptop
- API endpoints functional
- Database stores assessment data
- Docker setup works
- Automatic backup configured

#### Week 15: Phone-to-Server Sync
**Deliverables:**
- WiFi detection in phone app
- Sync service implementation
- Upload/download logic
- Progress indicators
- Error handling and retry

**Technical Tasks:**
- Integrate @react-native-community/netinfo
- Implement sync service:
  ```javascript
  - detectHomeWiFi()
  - checkServerAvailability()
  - uploadAssessments()
  - uploadPhotos()
  - downloadUpdates()
  ```
- Add sync progress UI
- Implement chunked photo upload
- Build retry logic for failed syncs
- Add sync status notifications

**Success Criteria:**
- Phone detects home WiFi automatically
- Successfully uploads assessments to server
- Photos upload correctly (compressed)
- Progress shown to user
- Handles network interruptions gracefully

#### Week 16-17: Web Dashboard
**Deliverables:**
- React web application
- Assessment list and search
- Detailed assessment view
- Report generation
- Export functionality

**Technical Tasks:**
- Create React web app (using Create React App or Vite)
- Build components:
  - Dashboard home page
  - Assessment list with search/filter
  - Assessment detail view
  - Report generation interface
  - Analytics/statistics page
- Implement data fetching from API
- Add PDF generation on server
- Build export to Excel/CSV
- Responsive design for laptop screens

**Success Criteria:**
- Dashboard accessible at http://192.168.1.50:3000
- Can view all synced assessments
- Search and filter works
- Can generate reports from web
- Export functions work

#### Week 18: Integration Testing & Documentation
**Deliverables:**
- End-to-end sync testing
- Server setup documentation
- Network configuration guide
- Backup/restore procedures
- Deployment package

**Technical Tasks:**
- Test complete sync workflow
- Test with realistic data volumes
- Document server setup (Docker + native)
- Write network configuration guide
- Create backup/restore scripts
- Package Docker deployment
- Write troubleshooting guide

**Success Criteria:**
- Sync works reliably
- Setup documentation clear
- Non-technical user can set up server
- Backup/restore tested
- All edge cases handled

### Phase 4: iOS/iPad Integration (Weeks 19-26)

#### Week 19-20: iOS Port
**Deliverables:**
- React Native app running on iOS
- All features working on iPad
- iOS-specific UI adjustments

**Technical Tasks:**
- Configure Xcode project
- Test all features on iOS
- Adjust UI for iOS design patterns
- Handle iOS-specific permissions
- Optimize for iPad screen sizes
- Test sync on iOS/iPad

**Success Criteria:**
- App runs on iPhone and iPad
- All features work on iOS
- UI matches iOS design guidelines
- Sync works from iOS devices

#### Week 21-22: RoomPlan API Integration
**Deliverables:**
- LiDAR-based floor plan scanning
- Real-time floor plan generation
- Integration with existing workflow
- Mode switching (LiDAR vs manual)

**Technical Tasks:**
- Implement Apple RoomPlan API
- Create scanning interface
- Convert RoomPlan output to app format
- Build LiDAR vs manual mode toggle
- Integrate RoomPlan data with items system
- Test on iPad Pro with LiDAR

**Success Criteria:**
- Can scan room with LiDAR
- Real-time floor plan generation works
- Floor plan integrates with assessment
- Can switch between LiDAR and manual modes
- Works on supported iPads

#### Week 23-24: iOS Feature Parity & Testing
**Deliverables:**
- iOS version feature-complete
- Cross-platform testing completed
- Platform-specific features documented
- Performance optimization

**Technical Tasks:**
- Ensure all Android features work on iOS
- Test sync from both platforms
- Optimize performance on iPad
- Add Apple Pencil support for annotations
- Test with large datasets
- Fix platform-specific bugs

**Success Criteria:**
- Feature parity between Android and iOS
- Both platforms sync to same server
- Performance acceptable
- No critical bugs

#### Week 25-26: iOS Deployment & Documentation
**Deliverables:**
- App Store submission
- iOS production release
- Cross-platform documentation
- Final testing and polish

**Technical Tasks:**
- Prepare App Store assets
- Build signed IPA
- Submit to App Store
- Update documentation for iOS
- Create iOS-specific user guide
- Final round of testing

**Success Criteria:**
- App available on App Store
- iOS version stable
- Documentation complete
- Cross-platform workflow documented

### Phase 5: Enhancements & Optimization (Week 27+)

#### Potential Future Features (Priority Order)

**1. Advanced Analytics (Weeks 27-28)**
- Compliance trends over time
- Property risk scoring
- Predictive maintenance alerts
- Contractor performance tracking

**2. Multi-User Support (Weeks 29-31)**
- Multiple assessor accounts
- Role-based access control
- Coordinator review workflow
- Team assignment system

**3. External Integrations (Weeks 32-34)**
- Housing association system API
- Contractor management platforms
- Email automation for reports
- Calendar integration for scheduling

**4. Enhanced Floor Plans (Weeks 35-36)**
- Import existing architectural plans
- Auto-detect rooms from imported plans
- 3D visualization option
- Measurement tools

**5. Mobile Optimization (Weeks 37-38)**
- Voice notes and dictation
- Hands-free operation mode
- Offline speech-to-text
- Audio notes attached to items

### Milestone Summary

**Month 2:** Working Android app (offline-only)
**Month 3:** PDF generation + production ready
**Month 4.5:** Local server sync operational
**Month 6.5:** iOS/iPad version complete
**Month 7+:** Enhancements and integrations

### Resource Requirements

**Development Time:**
- Weeks 1-12: 40-60 hours/week (core app)
- Weeks 13-18: 30-40 hours/week (server)
- Weeks 19-26: 40-50 hours/week (iOS)
- Total: ~1,200-1,500 hours

**Hardware Needed:**
- Android phone (OnePlus Nord CE 2 - ✓ available)
- Mac for iOS development (required for weeks 19-26)
- Laptop for server (✓ available)
- Optional: iPad Pro with LiDAR for testing (£400-600)

**Testing Devices:**
- Minimum: 1 Android phone
- Recommended: 1 Android + 1 iPhone/iPad
- Server: Any laptop (macOS/Linux/Windows)

## Technical Considerations

### Offline-First Architecture
**Requirement:** Phone app must work completely without internet connectivity
- All data stored locally in SQLite on phone
- Photos stored in app's local file system
- Reports generated locally on phone
- No cloud dependencies for core functionality
- Sync to local server when WiFi available (optional enhancement)

### Local Server Sync Architecture
**Design Philosophy:** Server enhances but never blocks field work
- Phone never waits for server
- Sync happens in background when home WiFi detected
- Failed syncs retry automatically
- Server unavailable = phone continues normally
- No internet required anywhere in system

**Sync Implementation:**
```javascript
// Non-blocking sync pattern
const syncToServer = async () => {
  try {
    // Check WiFi without blocking
    const isHomeWiFi = await checkHomeNetwork();
    if (!isHomeWiFi) return;
    
    // Ping server (2 second timeout)
    const serverAvailable = await pingServer({ timeout: 2000 });
    if (!serverAvailable) return;
    
    // Sync in background
    await uploadPendingData();
    showNotification('Sync complete ✓');
  } catch (error) {
    // Silent failure - user doesn't care
    logSyncError(error);
  }
};

// Trigger on WiFi connect
NetInfo.addEventListener(syncToServer);

// Manual trigger available
Settings > [Sync Now]
```

### Performance Requirements
**Large Dataset Handling:**
- 25-30 floors per building
- 200+ rooms per assessment
- 1000+ individual items per assessment
- 2000+ photos per assessment
- Multiple assessments in progress simultaneously

**Phone Optimization Strategies:**
- **Lazy loading:** Load floors/rooms on demand, not all at once
- **Image compression:** Compress photos to 1-2MB before storage
- **Thumbnail generation:** Create 200px thumbnails for lists
- **Database indexing:** Index on assessment_id, room_id, item_type
- **Pagination:** Show 20 items at a time, load more on scroll
- **Virtual scrolling:** Only render visible items in long lists
- **Caching:** Cache frequently accessed data in memory

**Server Optimization Strategies:**
- **Chunked uploads:** Photos uploaded in 5MB chunks
- **Background processing:** Generate reports asynchronously
- **Database connection pooling:** Reuse connections efficiently
- **Query optimization:** Indexed queries, avoid N+1 problems
- **Photo storage:** Organize by date folders to avoid huge directories
- **Compression:** Gzip API responses

### Data Export/Import
**Critical Features:**

**Phone Export:**
```
Settings > Export Assessment
├── Format: JSON + Photos (.zip)
├── Size: Compressed ~50-200MB
├── Share via: Email, Drive, USB
└── Use case: Backup, transfer to new phone
```

**Server Export:**
```
Dashboard > Export
├── Single assessment: PDF + data
├── Batch export: Multiple PDFs
├── Data export: Excel/CSV for housing association
├── Backup: Full database dump + photos
└── Use case: Reporting, integration, archival
```

**Import Capabilities:**
```
Phone:
├── Restore from backup .zip
├── Import assessment from colleague
└── Merge data from old phone

Server:
├── Bulk import from CSV
├── Restore from backup
└── Migrate from other systems
```

### Security & Privacy
**Data Protection Considerations:**

**Phone Security:**
- App lock with PIN/biometric (optional)
- Photos stored in private app directory
- SQLite database encrypted at rest (optional)
- No sensitive data in logs
- Secure file sharing (encrypted when possible)

**Server Security:**
```
Network level:
├── Local network only (192.168.x.x)
├── Firewall rules: Block external access
├── No port forwarding on router
└── Optional: VPN for remote access

Application level:
├── Password protection for web dashboard (optional)
├── HTTPS/TLS for sync (optional but recommended)
├── Database password protected
└── Backup files encrypted (optional)
```

**Privacy Benefits vs Cloud:**
```
✓ Data never leaves local network
✓ No third-party access
✓ No terms of service changes
✓ No data mining
✓ No subpoenas to cloud provider
✓ Full control and ownership
✓ GDPR compliant by design
✓ No cloud provider security breaches
```

### Network Requirements

**Phone:**
- WiFi or cellular for email (report sharing)
- WiFi for sync to server (automatic when home)
- No internet required for core functionality

**Laptop Server:**
- Local network (WiFi or Ethernet)
- No internet required for operation
- Optional: Internet for updates/backups to cloud

**Sync Network:**
```
Recommended setup:
├── Laptop connected via Ethernet (faster, reliable)
├── Laptop assigned static IP (192.168.1.50)
├── Phone connects via WiFi (password protected)
└── Network speed: Standard home WiFi sufficient

Typical sync performance:
├── Assessment data: <1 second
├── Photos (50 images): 2-3 minutes
└── Full day's work: 3-5 minutes total
```

### Scalability Considerations

**Current Design (Single User):**
```
Supported:
├── 1 assessor
├── 1 phone
├── 1 laptop server
├── 1,000+ assessments per year
└── 50,000+ items tracked
```

**Future Multi-User Extension:**
```
If needed:
├── Multiple phones → Same server
├── Each assessor has account
├── Conflict detection system
├── Role-based access (assessor vs coordinator)
└── Requires: User authentication, sync conflict resolution
```

**Server Hardware Scaling:**
```
Current laptop sufficient for:
├── 5 years of data
├── 1,000 assessments/year
├── 50,000 items/year
├── 100,000 photos

If outgrows laptop:
├── Migrate to dedicated server
├── Use NAS for photo storage
├── Scale PostgreSQL
└── Architecture supports this
```

## Future Enhancements

### Post-MVP Features (Priority Order)

1. **Cloud Sync & Backup**
   - Automatic backup to cloud storage
   - Multi-device sync
   - Data recovery options

2. **Team Collaboration**
   - Multiple assessor accounts
   - Share assessments between team members
   - Coordinator review workflow

3. **Analytics Dashboard**
   - Aggregate statistics across properties
   - Trend analysis
   - Compliance tracking over time

4. **Integration with External Systems**
   - Housing association management systems
   - Contractor management platforms
   - Compliance reporting to authorities

5. **Advanced Floor Plan Features**
   - Import existing architectural plans
   - Auto-detect rooms from imported plans
   - 3D visualization option

6. **Template Library**
   - Pre-built room templates
   - Common layout patterns
   - Customizable checklists per property type

7. **Voice Notes & Dictation**
   - Voice-to-text for observations
   - Audio notes attached to items
   - Hands-free operation mode

8. **Scheduling & Calendar Integration**
   - Assessment scheduling
   - Reminders for follow-ups
   - Integration with calendar apps

## Critical Questions Requiring Answers

Before proceeding with detailed technical implementation, the following questions must be answered to ensure the system meets all requirements and avoids costly rework.

### **Category 1: Sample Reports & Current Workflow**

**CRITICAL - Need actual examples to design correctly:**

1. **Sample PDF Reports**
   - Can you provide 2-3 complete PDF reports she currently generates?
   - What sections are mandatory vs optional?
   - What is the exact format for contractor action lists?
   - Are there regulatory requirements for report format (PAS 79:2020 specific layout)?
   - Does she use any templates or forms currently?

2. **Report Recipients & Usage**
   - Who receives these reports? (Housing association managers, building owners, residents, regulatory bodies?)
   - How are reports currently delivered? (Email PDF, upload to portal, printed copies?)
   - What do coordinators do with the reports? (Assign work, track compliance, etc.)
   - Do contractors need specific formats or can they work with PDFs?
   - Is there a sign-off process that needs to be captured?

3. **Current Time & Pain Points**
   - How long does a typical assessment take now? (On-site + post-visit admin)
   - How much time is spent on report writing after the visit?
   - What takes the longest during the on-site assessment?
   - What errors or issues happen most frequently?
   - What would save the most time in the new system?

### **Category 2: Fire Safety Standards & Checklists**

**CRITICAL - Must get compliance requirements exactly right:**

4. **Compliance Standards**
   - Is PAS 79:2020 the only standard, or are there others?
   - Are there UK fire safety regulations specific to housing associations?
   - Different standards for residential vs commercial properties?
   - What makes a report "compliant" vs "non-compliant"?
   - Are there certification or accreditation requirements for the assessor?

5. **Inspection Checklists**
   - Can you provide the actual checklist she uses during inspections?
   - Is it the same for all property types or different checklists?
   - Are there mandatory questions that must be answered?
   - How are checklist items organized? (By room type, by risk category, etc.)
   - Does the checklist change based on property size or type?

6. **Fire Safety Item Types**
   - What are ALL the types of fire safety items she inspects?
     - Emergency lighting?
     - Fire extinguishers?
     - Fire alarms/smoke detectors?
     - Fire doors?
     - Fire exits?
     - Sprinkler systems?
     - Fire blankets?
     - Fire hose reels?
     - Emergency signage?
     - Others?
   - What status options are needed for each item? (Pass/fail/missing/expired/damaged?)
   - What makes an item "critical" vs "high" vs "medium" priority?
   - Are there service date tracking requirements?

### **Category 3: Property Types & Typical Scale**

**Important for UI design and performance optimization:**

7. **Property Size Ranges**
   - Smallest assessment: How many rooms? (e.g., 3-room flat hallway)
   - Typical assessment: How many rooms? (e.g., 10-20 communal areas)
   - Largest assessment: How many rooms? (e.g., 30-floor block with 200+ areas)
   - Average number of fire safety items per room?
   - How many photos typically taken per assessment?

8. **Property Type Breakdown**
   - What percentage of work is:
     - Blocks of flats (communal areas)?
     - Sheltered housing?
     - Small businesses (restaurants, shops, garages)?
     - Other types?
   - Are there property types with unique requirements?
   - Do different property types need different templates?

9. **Assessment Frequency**
   - How many assessments per day typically? (1-2? 3-5? More?)
   - How many assessments per week/month?
   - Are there seasonal variations (e.g., more in certain months)?
   - How often are properties re-assessed? (Annual? Bi-annual?)
   - Do you ever need to reference previous assessments of the same property?

### **Category 4: Floor Plan Requirements**

**Critical for designing the schematic system:**

10. **Floor Plan Detail Level**
    - Does the floor plan need to show:
      - Exact room dimensions? (meters)
      - Door locations and types?
      - Window locations?
      - Furniture placement?
      - Fire safety equipment locations?
      - Structural features (stairs, lifts, etc.)?
    - How accurate must dimensions be? (Rough estimates ok? Exact measurements required?)
    - Do contractors use the floor plan to locate items?

11. **Floor Plan Current Practice**
    - Does she currently create floor plans? If so, how?
    - Are there existing building plans she can reference?
    - Does she sketch on-site or recreate later?
    - What format are floor plans delivered in now? (Hand-drawn? CAD? None?)
    - Do housing associations have floor plans she can import?

12. **Multi-Floor Buildings**
    - For a 25-floor building, does she inspect:
      - All floors every time?
      - Sample of floors?
      - Only floors with issues?
    - Are floor layouts typically identical (Floor 2-24 same)?
    - How does she currently handle documenting identical floors?
    - Does she need to show vertical connections (stairs, lifts between floors)?

### **Category 5: User Workflow & Preferences**

**Important for UX design:**

13. **On-Site Workflow**
    - Does she work alone or with others?
    - Does she go room-by-room or area-by-area?
    - Does she complete one floor entirely before moving to next?
    - How does she currently take notes? (Paper forms? Voice notes? Mental notes?)
    - When does she take photos? (During inspection? At end? Both?)

14. **Data Entry Preferences**
    - Would she prefer:
      - Quick checkboxes for compliant items + detailed notes only for failures?
      - Full details for every item regardless of status?
      - Voice input for notes?
      - Pre-populated common observations to select from?
    - How much typing is acceptable on-site vs prefer buttons/checkboxes?

15. **Floor Plan Sketching Preference**
    - Which approach would she prefer for creating floor plans:
      - **Option A:** Draw entire floor layout first, then mark hazards
      - **Option B:** Add rooms one-by-one as she inspects them
      - **Option C:** Select from common templates (corridor, stairwell, etc.)
      - **Option D:** Import existing building plan and annotate
    - How important is the visual appearance vs just having locations marked?
    - Would she use templates for identical floors? (Copy Floor 1 layout to Floors 2-24?)

### **Category 6: Team & Coordination**

**Important for multi-user planning:**

16. **Users & Access**
    - Is she the only person doing assessments?
    - Are there other assessors in the team?
    - Do coordinators need access to view reports?
    - Do contractors need access to see their assigned work?
    - Does anyone else need to review assessments before they're final?

17. **Coordinator Workflow**
    - What does a coordinator do with completed assessments?
    - How are remedial actions assigned to contractors?
    - How is completion tracked and signed off?
    - Do coordinators need to generate aggregate reports (e.g., all properties in a month)?
    - Do they need to track trends or compliance statistics?

18. **Housing Association Integration**
    - Does the housing association have systems you need to integrate with?
    - Do they require data in specific formats?
    - How are reports currently submitted to them?
    - Do they have APIs or data import capabilities?
    - Would they want direct access to the web dashboard?

### **Category 7: Branding & Output**

**For PDF template design:**

19. **Branding Requirements**
    - Company/assessor branding on reports?
    - Housing association branding?
    - Both?
    - Logo files available?
    - Specific color schemes required?
    - Header/footer requirements?

20. **Report Format Preferences**
    - Professional/formal vs simple/functional?
    - Detailed technical vs summary-focused?
    - How much technical jargon is appropriate?
    - Should reports include guidance for non-experts?
    - Any regulatory requirements for report format?

### **Category 8: Technical Environment**

**For deployment planning:**

21. **Laptop/Server Details**
    - What operating system does the laptop run? (macOS? Windows? Linux?)
    - How much storage available? (For 5 years of data: need 100-300GB)
    - RAM? (8GB minimum, 16GB recommended)
    - Is laptop on most of the time or just when needed?
    - WiFi network name (SSID) for auto-sync detection?
    - Technical comfort level for server setup? (Docker ok? Need simple installer?)

22. **Phone Details**
    - Primary phone model confirmed: Samsung Galaxy S25 series?
    - Storage available on phone?
    - Operating system version?
    - Will she upgrade phone soon? (Affects testing)
    - Any other phones that need to work? (Backup phone? Other team members?)

23. **Network Setup**
    - Home/office WiFi details:
      - Single WiFi network or multiple?
      - Router access for static IP assignment?
      - Technical person available for network setup?
    - Internet connection available? (For initial setup, updates, backups to cloud)
    - External hard drive for backups?

### **Category 9: Budget & Timeline**

**For realistic planning:**

24. **Budget Considerations**
    - Is this a funded project or personal investment?
    - Budget for iPad Pro with LiDAR? (~£500-800 refurbished)
    - Budget for external backup drive? (~£50-100)
    - Any budget for ongoing costs? (Even though hosting is £0, there may be other costs)
    - Timeline pressure? (Need it working by specific date?)

25. **iPad Purchase Timeline**
    - Planning to buy iPad in Phase 1 or wait until Phase 4?
    - Want to test iOS version before committing?
    - Preference: Buy now and test early, or wait until Android proven?
    - Budget flexibility if iPad proves essential earlier?

### **Category 10: Data & Privacy**

**Important for compliance:**

26. **Data Retention**
    - How long must assessment data be retained?
    - Any regulatory requirements for data retention?
    - Privacy concerns about storing property photos?
    - GDPR compliance requirements?
    - Data deletion/anonymization requirements?

27. **Backup Requirements**
    - How critical is data loss prevention? (Life/death? Legal liability? Just inconvenient?)
    - Acceptable backup frequency? (Daily? Weekly?)
    - Need off-site backup? (Cloud backup despite local server?)
    - Disaster recovery time acceptable? (Hours? Days?)

### **Category 11: Future Considerations**

**Nice to know but not blocking:**

28. **Future Features**
    - What features would be "nice to have" in future?
    - Any planned expansion (more assessors, different property types)?
    - Integration wishes (other software, systems)?
    - Mobile app for contractors to view assigned work?
    - Client portal for property owners to see results?

29. **Scalability**
    - Expect assessment volume to increase?
    - Expect to hire more assessors?
    - Expect to expand service offerings?
    - Any plans this might need to accommodate?

### **Category 12: Validation Questions**

**To confirm our understanding:**

30. **Assumption Validation**
    - Confirm: Private flats/apartments NOT inspected (only communal areas)?
    - Confirm: Same assessor completes entire property assessment (not split between people)?
    - Confirm: Assessment completed in single visit (not multiple visits)?
    - Confirm: Report delivered within 24-48 hours of assessment?
    - Confirm: Laptop will be running when she returns home from assessments?

### **Priority Classification**

**MUST ANSWER BEFORE CODING:**
- Questions 1, 2 (Sample reports - CRITICAL)
- Questions 4, 5, 6 (Compliance standards and checklists - CRITICAL)
- Questions 7, 8 (Property scale - Important for performance)
- Questions 10, 15 (Floor plan requirements - Critical for design)
- Questions 21, 22, 23 (Technical environment - Needed for setup)

**SHOULD ANSWER BEFORE UI DESIGN:**
- Questions 13, 14 (User workflow - Important for UX)
- Questions 16, 17 (Team coordination - Affects architecture)
- Questions 19, 20 (Branding - Affects PDF templates)

**CAN ANSWER DURING DEVELOPMENT:**
- Questions 24, 25 (Budget/timeline - Planning)
- Questions 26, 27 (Data retention - Can add later)
- Questions 28, 29 (Future features - Post-MVP)

### **How to Answer These Questions**

**Recommended approach:**

1. **Sample Reports First** - Share 2-3 complete PDF examples
   - This answers many questions about format, content, structure
   - More valuable than written descriptions

2. **Checklists Next** - Share the inspection forms/checklists used
   - Shows exact data capture requirements
   - Clarifies fire safety item types and statuses

3. **Workflow Video** - Record a short video of her workflow (or describe it)
   - Walking through a property
   - How she takes notes
   - How she currently creates reports

4. **Written Answers** - For remaining questions
   - Can use the numbered list above
   - Don't need essay answers, bullet points fine
   - "Not sure" or "flexible" is a valid answer for some

**Don't worry about:**
- Having perfect answers to everything
- Technical jargon in questions you don't understand
- Future planning questions (28-29) - can defer
- Being "wrong" - we can adjust as we learn

## Open Questions Requiring Input

**NOTE:** Detailed questions have been organized in the "Critical Questions Requiring Answers" section above. This section remains for historical reference and will be removed once questions are answered.

### Awaiting Client Feedback (LEGACY - See Above for Full List)

The comprehensive question list above supersedes these items:

~~1. **Sample Report Format**~~
   - See Questions 1-2 in Category 1 above

~~2. **Fire Safety Checklists**~~
   - See Questions 4-6 in Category 2 above

~~3. **Workflow Details**~~
   - See Questions 13-15 in Category 5 above

~~4. **User Preferences**~~
   - See Questions 14-15 in Category 5 above

~~5. **Business Requirements**~~
   - See Questions 16-18 in Category 6 above

## Success Metrics

### Key Performance Indicators

**Efficiency Gains:**
- Time to complete assessment (target: 30% reduction)
- Time from assessment to report delivery (target: same-day)
- Reduction in post-assessment admin time
- Accuracy of contractor action items

**User Adoption:**
- Percentage of assessments completed in app
- User satisfaction rating
- Feature usage analytics
- Bug/issue frequency

**Quality Improvements:**
- Reduction in missing information
- Contractor feedback on action clarity
- Reduction in follow-up queries
- Compliance with standards

## Project Team

**Developer:** Solo developer with React/Python experience
**End User/Product Owner:** Fire risk assessor (housing association)
**Test Devices:** 
- OnePlus Nord CE 2 (Android 13, OxygenOS)
- Samsung Galaxy S25 series (target deployment)
- Future: iPad Pro with LiDAR

## Repository Structure

```
fire-assessment-app/
├── README.md (this file)
├── docs/
│   ├── API.md
│   ├── DATABASE_SCHEMA.md
│   ├── USER_GUIDE.md
│   └── DEPLOYMENT.md
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── services/
│   ├── utils/
│   └── assets/
├── android/
├── ios/ (future)
└── tests/
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- React Native CLI
- Android Studio
- Git

### Installation
```bash
# Clone repository
git clone [repository-url]
cd fire-assessment-app

# Install dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### Development Workflow
1. Create feature branch
2. Implement feature with tests
3. Test on physical device
4. Submit pull request
5. Code review
6. Merge to main
7. Deploy to test environment

## License

[To be determined]

## Contact

[Project maintainer contact information]

---

**Last Updated:** 15 November 2025
**Version:** 0.1.0 (Planning Phase)
**Status:** Awaiting sample reports and final requirements confirmation
