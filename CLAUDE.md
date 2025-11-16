# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Fire Risk Assessment (FRA) Mobile Application** - A cross-platform mobile app (React Native) for professional fire risk assessments in commercial and residential buildings, with local server backend for data sync and archival.

### Core Problem Solved
- **Delayed floor plan delivery**: No waiting 24 hours for professional plans
- **Individual item tracking**: Specific identification of failed items (e.g., "Emergency Light #3 near Flat 29")
- **Scale representation**: Schematic (non-scale) floor plans for usability on mobile
- **Multi-floor complexity**: Efficient navigation for 20-30 floor buildings with 100+ rooms, 1000+ items

### Key Characteristics
- **100% offline-capable**: Phone app works completely offline in field
- **Local server only**: No cloud exposure, no monthly hosting fees (£0/month)
- **Automatic sync**: WiFi detection triggers data upload to home laptop server
- **Private data**: Data never leaves local network
- **One assessor model** (currently): Single assessor, one phone, one laptop server

---

## Technology Stack

### Mobile App
- **Framework**: React Native (cross-platform: Android → iOS)
- **Local Database**: SQLite (phone storage)
- **Key Libraries**:
  - `react-native-canvas` or `react-native-svg` - Floor plan drawing
  - `react-native-image-picker` - Photo capture
  - `react-native-pdf` - Report generation
  - `@react-native-async-storage` - Local data persistence
  - `react-native-fs` - File system operations
  - `@react-native-community/netinfo` - WiFi detection for auto-sync
- **Target Devices**: Samsung Galaxy S25 series (primary), OnePlus Nord CE 2 (test device)
- **Minimum**: Android (iOS/iPad Phase 4 future)

### Local Server
- **Backend**: Node.js + Express (lightweight REST API)
- **Database**: PostgreSQL (historical archive on laptop)
- **Web Dashboard**: React web app
- **Deployment**: Docker containers (recommended) or native installation
- **Network**: Local WiFi only (192.168.x.x), NO internet exposure

### Architecture Pattern
```
┌─────────────────────┐         ┌──────────────────────┐
│  Phone (Field)      │  WiFi   │  Laptop (Server)     │
│ • Works offline     ├────────→│ • PostgreSQL DB      │
│ • SQLite local      │ Auto-   │ • Node.js API        │
│ • Generates PDFs    │ sync    │ • Web Dashboard      │
│ • Local photos      │         │ • Auto-backup        │
└─────────────────────┘         └──────────────────────┘

Sync triggered: WiFi detection → Check server → Upload assessments + photos
```

---

## Data Model

### Core Entities
```
Assessment
├── id (UUID)
├── property_name, property_address
├── assessor_name, assessor_credentials
├── status (in_progress, completed, reviewed)
├── created_at, updated_at
└── floors: Floor[]

Floor
├── id (UUID), assessment_id (FK)
├── floor_number, floor_name ("Ground Floor", "Floor 1")
├── is_template (for copying identical floors)
└── rooms: Room[]

Room
├── id (UUID), floor_id (FK)
├── room_number, room_name ("Main Corridor A")
├── room_type (corridor, stairwell, lobby, storage, plant_room, kitchen, office, other)
├── dimensions (text: "40m x 2m"), actual_length, actual_width
├── schematic_layout (JSON - non-scale representation)
├── connections (connected room IDs)
├── inspection_status (not_started, in_progress, completed)
└── fire_safety_items: FireSafetyItem[]

FireSafetyItem
├── id, room_id (FK)
├── item_code (auto-generated: "F2-CORR-A-EL-003")
├── item_number (sequential per type per room)
├── item_type (emergency_light, fire_extinguisher, fire_alarm, smoke_detector,
│             fire_door, emergency_exit, fire_blanket, sprinkler_head,
│             fire_hose_reel, emergency_signage, other)
├── location_description, location_on_schematic (JSON: {x, y})
├── status (pass, fail, missing, requires_attention)
├── failure_reason, remedial_action
├── priority (critical, high, medium, low)
├── last_service_date, next_service_due
└── photos: Photo[]

Photo
├── id, parent_id (room_id or item_id)
├── parent_type (room, item)
├── file_path, thumbnail_path
├── caption, annotation_data (JSON - arrows, circles, text)
└── taken_at
```

---

## Development Roadmap

### Phase 1: Core Android Application (Weeks 1-8) - CURRENT FOCUS
- **Weeks 1-2**: Project setup, basic navigation (5-level hierarchy), SQLite data models
- **Weeks 3-4**: Manual floor plan sketcher (canvas-based drawing, room tools, labeling)
- **Weeks 5-6**: Fire safety item management (form UI, photo capture, location marking, auto-numbering)
- **Weeks 7-8**: Assessment workflow & templates (floor duplication, quick status mode, progress tracking)
- **Expected completion**: Fully functional offline Android app

### Phase 2: Reporting & Polish (Weeks 9-12)
- **Weeks 9-10**: PDF report generation (professional multi-page template)
- **Week 11**: Testing & refinement, performance optimization
- **Week 12**: Documentation & initial deployment

### Phase 3: Local Server Development (Weeks 13-18)
- **Weeks 13-14**: PostgreSQL database, Node.js API, Docker setup
- **Week 15**: Phone-to-server sync implementation (WiFi detection, upload/download logic)
- **Weeks 16-17**: React web dashboard (assessment list, search, report generation, export)
- **Week 18**: Integration testing, documentation, deployment package

### Phase 4: iOS/iPad Integration (Weeks 19-26)
- **Weeks 19-20**: iOS port, UI adjustments for iOS/iPad
- **Weeks 21-22**: RoomPlan API integration (LiDAR-based floor plan scanning on iPad)
- **Weeks 23-24**: Feature parity & testing, platform-specific optimization
- **Weeks 25-26**: App Store submission, final deployment

### Phase 5: Enhancements (Week 27+)
- Advanced analytics, multi-user support, external integrations, voice notes, etc.

---

## Key Architectural Decisions

### 1. Offline-First Design
- **Why**: Phone works 100% offline in field. Server enhances but never blocks
- **Implementation**: All data stored locally in SQLite. Sync happens in background when home WiFi detected
- **Non-blocking pattern**: If server unavailable, phone continues normally

### 2. Schematic Floor Plans (Non-Scale)
- **Why**: Can't use true-to-scale plans on mobile (200m corridors hide 2m cupboards)
- **Solution**: Non-scale schematic representation (like London Underground map)
- **Design**: Rooms shown as standard-sized blocks, with actual dimensions as text labels
- **Benefit**: Usable for annotating hazards, much more practical than architectural drawings

### 3. Auto-Numbering System
- **Format**: `{Floor}-{Room}-{Type}-{Number}`
- **Example**: `F2-CORR-A-EL-003` = Floor 2, Corridor A, Emergency Light #3
- **Benefit**: Unique identification for contractors, professional appearance, sortable/filterable

### 4. Efficiency Features Built-In
- **Floor template duplication**: Copy layouts from identical floors (2-24 in 25-floor building)
- **Quick status mode**: Minimal entry for compliant items (most cases), detailed notes only for failures
- **Template-based approach**: Pre-populate room lists, item types, location expectations

### 5. Server Architecture
- **Local network only**: Runs on home/office laptop via WiFi (no cloud exposure)
- **Cost**: £0/month vs £40-90/month cloud alternatives
- **Privacy**: Complete data privacy, never leaves local network
- **Simpler**: No internet required, no cloud APIs/auth complexity

---

## Important Constraints & Assumptions

### Current Project Stage
- **Status**: In planning phase (requirements gathering)
- **Dependency**: Awaiting sample PDF reports and completed questions checklist from client
- **UI/UX**: Not yet designed - decisions needed on workflow preferences
- **Codes**: No code repository yet - waiting for requirements confirmation

### Known Limitations (By Design)
- **Single assessor**: Currently designed for one person with one phone
- **No private flat inspection**: Only communal areas in residential buildings
- **Offline-only photos**: Photos stored locally (not synced to cloud)
- **No real-time collaboration**: Multi-user support is Phase 5 enhancement

### Required Documents (Not Yet Provided)
1. 2-3 sample PDF reports from current workflow
2. Actual inspection checklist/forms currently used
3. Confirmation of fire safety item types and priority definitions
4. Building floor plans for reference

---

## Common Development Tasks

### Setting Up Development Environment
```bash
# React Native setup
npx react-native-cli --version  # Install CLI if needed
npx react-native init FRA       # Initialize project

# Android setup
# Requires: Android Studio, SDK 28+, emulator or physical device

# Dependencies installation
npm install react-native-canvas react-native-image-picker @react-native-async-storage \
  react-native-fs @react-native-community/netinfo react-native-pdf

# Database setup (phone)
# SQLite is built-in, initialize schema on first app launch
```

### Running on Android
```bash
npm run android        # Build and run on connected device/emulator
npm run android -- --release  # Build release APK
```

### Database Schema Setup (Phone - SQLite)
- Initialize on first app launch (check if tables exist)
- Create if missing: assessments, floors, rooms, fire_safety_items, photos
- Use schema from main README (database design section)

### Server Setup (Future - Phase 3)
```bash
# Docker (recommended)
docker-compose up -d

# Or native Node.js + PostgreSQL
npm install
npm run migrate
npm run start
```

---

## Key Files & Directory Structure

```
FRA/
├── CLAUDE.md (this file)
├── Documentation/
│   ├── README.md (main project documentation)
│   ├── SERVER-SETUP.md (server installation guide)
│   └── QUESTIONS-CHECKLIST.md (requirements gathering template)
├── src/ (to be created - Phase 1)
│   ├── screens/ - Hierarchical 5-level UI
│   │   ├── AssessmentListScreen.js
│   │   ├── BuildingStructureScreen.js
│   │   ├── FloorRoomListScreen.js
│   │   ├── RoomInspectionScreen.js
│   │   └── ItemDetailScreen.js
│   ├── components/
│   │   ├── FloorPlanCanvas.js - Drawing tools
│   │   ├── ItemForm.js - Item detail form
│   │   ├── PhotoCapture.js - Image picker integration
│   │   └── LocationMarker.js - Marking items on floor plan
│   ├── services/
│   │   ├── DatabaseService.js - SQLite operations
│   │   ├── SyncService.js - WiFi detection & upload
│   │   ├── ReportGenerator.js - PDF generation
│   │   └── ItemCodeGenerator.js - Auto-numbering
│   ├── navigation/
│   │   └── RootNavigator.js - 5-level hierarchy
│   └── utils/
│       ├── PhotoCompression.js
│       └── Validation.js
├── android/ - React Native Android project
├── server/ (Phase 3)
│   ├── src/
│   │   ├── api/
│   │   │   ├── sync.js - Sync endpoints
│   │   │   └── health.js - Health check
│   │   ├── models/
│   │   │   └── Database.js - PostgreSQL connection
│   │   └── middleware/
│   │       └── Auth.js
│   ├── dashboard/ - React web app
│   ├── docker-compose.yml
│   └── .env.example
└── tests/ (ongoing)
```

---

## Critical Design Decisions for Future Work

### Unresolved Questions (Awaiting Client Input)
1. **Report template**: Exact format, sections, regulatory requirements
2. **Fire safety items**: Confirmed list of item types and priority definitions
3. **Floor plan detail**: How precise? Show doors, windows, exact measurements?
4. **Workflow preference**: Draw all first vs add rooms as inspecting? Templates vs manual?
5. **Multi-floor approach**: Duplicate templates? Copy identical floors?

### Architectural Decisions Made
- ✅ Offline-first design (non-negotiable)
- ✅ Schematic floor plans (usability over architectural accuracy)
- ✅ Local server (privacy + cost + simplicity)
- ✅ SQLite on phone (no dependency on server)
- ✅ React Native (code reuse, iOS expansion)
- ⏳ Pending: UI flow, specific item types, report format

---

## Performance Considerations

### Large Dataset Handling (1000+ items per assessment)
- **Lazy loading**: Load floors/rooms on demand, not all at once
- **Image compression**: Compress photos to 1-2MB before storage
- **Thumbnail generation**: Create 200px thumbnails for lists
- **Database indexing**: Index on assessment_id, room_id, item_type
- **Pagination**: Show 20 items at a time, load more on scroll
- **Virtual scrolling**: Only render visible items in long lists

### Sync Performance
- **Chunked uploads**: Photos uploaded in 5MB chunks with retry logic
- **Background processing**: Generate reports asynchronously on server
- **Progress indicators**: Show upload/download progress to user
- **Timeout handling**: 2-second ping timeout (fail fast, don't block)

---

## Testing Strategy

### Unit Testing
- Database operations (CRUD)
- Item code generation
- Photo compression
- Validation logic

### Integration Testing
- End-to-end assessment workflow (offline)
- WiFi detection and sync trigger
- Report generation accuracy
- Sync upload/download cycle

### Device Testing
- OnePlus Nord CE 2 (test device)
- Samsung Galaxy S25 (target deployment)
- Various assessment sizes (small → 25-floor building)
- Realistic data volumes (1000+ items)

---

## Security & Privacy

### Phone-Level
- Optional app lock (PIN/biometric)
- Photos in private app directory
- Optional SQLite encryption
- No sensitive data in logs

### Server-Level
- Local network only (192.168.x.x)
- Firewall rules block external access
- No port forwarding
- Optional HTTPS/TLS for sync
- Database password protected

### Data Handling
- ✅ Data never leaves local network
- ✅ No cloud dependencies
- ✅ GDPR-compliant by design
- ✅ No third-party access

---

## Git Workflow

- Use **feature branches** for new features
- Commit frequently with descriptive messages
- All changes require code review before merge
- Test on physical device before marking complete
- Tag releases (vX.X.X format)

---

## Debugging & Troubleshooting

### Common Issues

**App won't connect to server:**
- Check WiFi connection (same network?)
- Verify laptop IP address in app settings
- Firewall blocking port 3000? (see SERVER-SETUP.md)
- Is server running? (`docker-compose ps` or `npm run start`)

**Sync not triggering:**
- Check WiFi SSID matches in .env
- Verify phone on correct network
- Check logs: `docker-compose logs -f api`
- Manual sync available in Settings

**Photos too large:**
- Implement compression before storage
- Target 1-2MB per photo (500x500px ~800KB)
- Thumbnail generation for lists

---

## Communication & Documentation

### Key Documents
- **README.md** (Documentation/): Full project specification and architecture
- **SERVER-SETUP.md**: Installation guide for local server (Docker or native)
- **QUESTIONS-CHECKLIST.md**: Requirements gathering template (awaiting client input)

### Code Documentation
- Inline comments for complex logic
- JSDoc for exported functions
- README.md in each major module
- Architecture decisions in this file

---

## Contact & Support

For questions about this project, see the Documentation folder for comprehensive guides.

**Last Updated:** November 15, 2025
**Project Status:** Requirements gathering phase (Phase 1 development pending)
**Repository:** https://github.com/safeathomeapp/FRA (pending creation)
