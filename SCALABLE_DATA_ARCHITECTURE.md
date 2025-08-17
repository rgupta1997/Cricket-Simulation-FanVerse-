# Scalable Cricket Data Architecture

This document describes the new scalable data architecture implemented for the cricket simulation app.

## Overview

The cricket data has been restructured from a monolithic JSON file into a modular, scalable architecture with proper relationships and IDs.

## Data Structure

### 1. Teams Data (`src/data/teams.json`)
- Each team has a unique `id` (e.g., "rcb", "mi")
- Contains team information: name, shortName, colors, and logo URL
- Team logos are stored in `/public/logos/`

### 2. Venues Data (`src/data/venues.json`)
- Each venue has a unique `id` (e.g., "modi-stadium", "wankhede")
- Contains venue details: name, city, capacity

### 3. Matches Data (`src/data/matches.json`)
- Contains tournament information
- Each match has:
  - `matchId`: Unique identifier
  - `status`: "completed", "upcoming", or "live"
  - `team1Id` and `team2Id`: References to team IDs
  - `venueId`: Reference to venue ID
  - Scores, results, and other match data

### 4. Points Table (`src/data/pointsTable.json`)
- Organized by tournament ID
- Each entry references `teamId` instead of embedding team data

### 5. Match Details
- Currently stored in the old `cricketData.json` for backward compatibility
- In production, these would be fetched via API based on matchId

## Key Features

### 1. **No Hardcoded Values**
- All static values removed from components
- Components dynamically fetch data using helper functions

### 2. **Team Logos**
- Replaced hardcoded emoji balls with actual team logos
- Logo files generated in `/public/logos/`
- Fallback to colored circles with team initials if logo fails to load

### 3. **Match Status Support**
- **Upcoming Matches**: Show limited info (venue, date, broadcast)
- **Live Matches**: Display current score and status
- **Completed Matches**: Full scorecard and details available

### 4. **Wagon Wheel Improvements**
- Removed yellow lines as requested
- Text positioned in circular pattern around the field
- Clean visualization focused on run distribution

### 5. **Helper Functions** (`src/data/index.js`)
- `getTeamById(teamId)`: Fetch team details
- `getVenueById(venueId)`: Fetch venue details
- `getMatchById(matchId)`: Fetch match info
- `getMatchDetails(matchId)`: Fetch detailed match data
- `getPointsTable(tournamentId)`: Fetch tournament standings
- And more...

## Component Updates

### WebApp.jsx
- Uses data helpers instead of direct JSON access
- Dynamic team logos with fallback
- Proper handling of different match states
- Removed all hardcoded values

### PointsTableTab.jsx
- Accepts `tournamentId` prop for flexibility
- Uses team logos instead of emojis
- References team data by ID

### WagonWheelTab.jsx
- Clean circular field visualization
- No radial lines as requested
- Text labels positioned in circular pattern
- Run distribution shown as colored circles

### MatchInfoTab.jsx
- Accepts both `match` and `matchDetail` props
- Shows appropriate info based on match status
- Dynamic venue and team information

## Logo Generation

1. **SVG Logos**: Generated using `scripts/generate-logos.js`
2. **PNG Conversion**: Use `public/logos/generate-logos.html` in browser
3. **Fallback**: Colored circles with team initials if images fail

## Benefits

1. **Scalability**: Easy to add new teams, venues, or matches
2. **Maintainability**: Modular data structure
3. **Performance**: Smaller data files, lazy loading possible
4. **Flexibility**: Easy to integrate with backend APIs
5. **Type Safety**: Clear data relationships with IDs

## Future Enhancements

1. Move match details to separate API endpoints
2. Add player database with IDs
3. Implement real-time updates for live matches
4. Add more tournaments and historical data
5. Implement caching for better performance
