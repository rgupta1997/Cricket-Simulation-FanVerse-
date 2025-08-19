import axios from 'axios';

// Base API URLs - using Vite proxy to avoid CORS issues
const SPORTZ_BASE_URL = '/api/sportz'; // Proxied through Vite dev server
const CUSTOM_API_BASE = 'https://videoscorecard.sportz.io'; // Keep original for fixtures

// For production, you might want to use environment variables:
// const SPORTZ_BASE_URL = import.meta.env.PROD ? 'https://demo.sportz.io/sifeeds/repo/cricket/live/json' : '/api/sportz';

// API Service for WebApp.jsx
class WebAppApiService {
  
  // Get fixtures/events from FillEvents API (replaces hardcoded matches.json)
  async getFixtures(startDate, endDate) {
    try {
      const body = JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        sport_id: 1,
        op_type: "1"
      });
      
      const response = await axios.post(
        `${CUSTOM_API_BASE}/api/FillEvents`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      // Filter for coverage_id: "8" as requested
      const events = response.data.events || [];
      const filteredEvents = events.filter(event => event.coverage_id === "8");
      
      // Transform to match our existing data structure
      return this.transformFixturesData(filteredEvents);
      
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      throw new Error('Failed to fetch fixtures');
    }
  }

  // Get full match data (replaces hardcoded cricketData.json)
  async getMatchData(matchFile) {
    try {
      const response = await axios.get(
        `${SPORTZ_BASE_URL}/${matchFile}.json`
      );
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to fetch match data');
      }
    } catch (error) {
      console.error('Error fetching match data:', error);
      throw new Error('Failed to fetch match data');
    }
  }

  // Get complete match data - combines scorecard + commentary APIs (replaces hardcoded live updates)
  async getLiveInningsData(matchFile) {
    try {
      console.log('🚀 Starting comprehensive data fetch for match:', matchFile);
      
      // Step 1: Fetch main scorecard data
      console.log('📊 Fetching scorecard data...');
      const scorecardResponse = await axios.get(`${SPORTZ_BASE_URL}/${matchFile}.json`);
      
      if (scorecardResponse.status !== 200) {
        throw new Error('Failed to fetch scorecard data');
      }
      
      const scorecardData = scorecardResponse.data;
      console.log('🏏 Scorecard API Response for', matchFile, ':', scorecardData);
      
      // Step 2: Determine number of innings from scorecard data (use new structure)
      const inningsCount = scorecardData.Innings ? scorecardData.Innings.length : 2; // Default to 2 if not available
      console.log('📈 Found', inningsCount, 'innings in scorecard data');
      
      // Step 3: Fetch commentary for all innings
      console.log('💬 Fetching commentary for all innings...');
      const commentaryData = await this.fetchAllInningsCommentary(matchFile, inningsCount);
      
      // Step 4: Combine scorecard + commentary into cricketData.json structure
      console.log('🔄 Combining scorecard and commentary data...');
      const combinedData = this.combineMatchData(scorecardData, commentaryData, matchFile);
      
      console.log('✅ Complete match data transformation completed');
      return combinedData;
      
    } catch (error) {
      console.error('❌ Error fetching complete match data:', error);
      throw new Error('Failed to fetch complete match data: ' + error.message);
    }
  }

  // Get commentary data (replaces hardcoded commentary.json)
  async getCommentaryData(matchFile, inningNo) {
    try {
      const response = await axios.get(
        `${SPORTZ_BASE_URL}/${matchFile}_commentary_all_${inningNo}.json`
      );
      
      if (response.status === 200) {
        console.log('💬 Commentary API Response for', matchFile, 'inning', inningNo, ':', response.data);
        
        // Transform the API response to match our cricketData.json structure
        const transformedData = this.transformCommentaryData(response.data, inningNo);
        console.log('🔄 Transformed Commentary Data:', transformedData);
        
        return transformedData;
      } else {
        throw new Error('Failed to fetch commentary');
      }
    } catch (error) {
      console.error('Error fetching commentary:', error);
      throw new Error('Failed to fetch commentary');
    }
  }

  // Transform fixtures data to match existing structure
  transformFixturesData(events) {
    console.log('🔄 Transforming fixtures data, sample event:', events[0]);
    
    return events.map(event => {
      const matchId = event.match_id;
      // console.log('📝 Creating fixture with matchId:', matchId, 'Type:', typeof matchId, 'From event.match_id:', event.match_id);
      
      return {
        matchId: matchId,
        matchFile: event.match_file_name, // Crucial for API calls
      matchName: event.match_name, // Single match name from API
      matchFullName: event.match_full_name || event.match_name, // Full match name if available
      seriesName: event.series_name, // Series name from API
      matchStatus: event.match_status, // Match status from API
      matchType: event.match_type || 'T20',
      status: this.determineMatchStatus(event),
      team1Id: event.team1_id || '1', // Fallback to default if not provided
      team2Id: event.team2_id || '2', // Fallback to default if not provided
      venueId: event.venue_id || '1',
      date: event.matchdate,
      time: event.match_start_time, // Map match_start_time to time field
      timezone: 'Asia/Kolkata',
      coverageId: event.coverage_id,
      matchStatusId: event.match_status_id,
      noOfDays: event.no_of_day || '1',
      // Add scores if available
      scores: event.scores || null,
      result: event.result || null
      };
    });
  }

  // Determine match status based on match_status_id
  determineMatchStatus(event) {
    if (event.match_status_id === "114") {
      return 'completed'; // Match Ended
    } else if (event.match_status_id === "113") {
      return 'live'; // Match Running
    } else {
      return 'upcoming'; // Default to upcoming
    }
  }

  // Get team details (placeholder - you may need to create this API)
  async getTeamDetails(teamId) {
    // This would replace hardcoded teams.json
    // For now, return a better default structure
    const teamDefaults = {
      '1': { name: 'Team Alpha', shortName: 'ALP' },
      '2': { name: 'Team Beta', shortName: 'BET' },
      '3': { name: 'Team Gamma', shortName: 'GAM' },
      '4': { name: 'Team Delta', shortName: 'DEL' },
      '5': { name: 'Team Echo', shortName: 'ECH' },
      '6': { name: 'Team Foxtrot', shortName: 'FOX' },
      '7': { name: 'Team Golf', shortName: 'GOL' },
      '8': { name: 'Team Hotel', shortName: 'HOT' }
    };
    
    const defaultTeam = teamDefaults[teamId] || { 
      name: `Team ${teamId}`, 
      shortName: `T${teamId}` 
    };
    
    return {
      id: teamId,
      name: defaultTeam.name,
      shortName: defaultTeam.shortName,
      logoUrl: null, // Will trigger default SVG logo
      primaryColor: '#3b82f6'
    };
  }

  // Get venue details (placeholder - you may need to create this API)
  async getVenueDetails(venueId) {
    // This would replace hardcoded venues.json
    // For now, return a better default structure
    const venueDefaults = {
      '1': { name: 'Central Stadium', city: 'Mumbai' },
      '2': { name: 'National Ground', city: 'Delhi' },
      '3': { name: 'City Arena', city: 'Bangalore' },
      '4': { name: 'Metro Stadium', city: 'Chennai' },
      '5': { name: 'Sports Complex', city: 'Kolkata' },
      '6': { name: 'Regional Ground', city: 'Hyderabad' },
      '7': { name: 'Community Stadium', city: 'Pune' },
      '8': { name: 'District Arena', city: 'Ahmedabad' }
    };
    
    const defaultVenue = venueDefaults[venueId] || { 
      name: `Venue ${venueId}`, 
      city: 'Unknown City' 
    };
    
    return {
      id: venueId,
      name: defaultVenue.name,
      city: defaultVenue.city
    };
  }

  // Get enhanced match data (if available locally)
  async getEnhancedMatchData(matchFile) {
    try {
      const enhancedData = (await import('../data/UpdatedMatchFile.json')).default;
      console.log('📈 Using enhanced local match data:', enhancedData);
      return enhancedData;
    } catch (error) {
      console.log('📡 Enhanced match data not available locally:', error.message);
      return null;
    }
  }

  // Fetch commentary for all innings dynamically
  async fetchAllInningsCommentary(matchFile, inningsCount) {
    console.log(`🏏 Fetching commentary for match: ${matchFile}, innings: ${inningsCount}`);
    
    const commentaryPromises = [];
    const commentaryResults = {};
    
    // Fetch commentary for each inning
    for (let inning = 1; inning <= inningsCount; inning++) {
      commentaryPromises.push(
        this.fetchInningCommentary(matchFile, inning)
          .then(data => {
            commentaryResults[inning] = data;
            console.log(`📊 Stored ${data.length} commentary items for inning ${inning}`);
            if (data.length > 0) {
              console.log(`📝 Sample commentary for inning ${inning}:`, data[0]);
            }
            return data;
          })
          .catch(error => {
            console.warn(`⚠️ Could not fetch commentary for inning ${inning}:`, error.message);
            commentaryResults[inning] = [];
            return [];
          })
      );
    }
    
    await Promise.all(commentaryPromises);
    console.log('📝 Commentary fetch completed for', inningsCount, 'innings');
    console.log('🎯 Final commentary results structure:', Object.keys(commentaryResults).map(key => ({
      inning: key,
      count: commentaryResults[key].length,
      hasData: commentaryResults[key].length > 0
    })));
    
    return commentaryResults;
  }

  // Fetch commentary for a specific inning
  async fetchInningCommentary(matchFile, inningNo) {
    try {
      console.log(`💬 Fetching commentary for match: ${matchFile}, inning: ${inningNo}`);
      
      const response = await axios.get(
        `${SPORTZ_BASE_URL}/${matchFile}_commentary_all_${inningNo}.json`
      );
      
      if (response.status === 200) {
        console.log(`💬 Commentary API Response for inning ${inningNo}:`, response.data);
        console.log(`📊 Commentary items count for inning ${inningNo}:`, response.data.Commentary?.length || 0);
        
        // The actual API returns commentary in 'Commentary' array (capital C)
        return response.data.Commentary || [];
      } else {
        throw new Error(`Failed to fetch commentary for inning ${inningNo}`);
      }
    } catch (error) {
      console.warn(`⚠️ Commentary fetch failed for inning ${inningNo}:`, error.message);
      
    }
  }

  // Combine scorecard and commentary data into cricketData.json structure
  combineMatchData(scorecardData, commentaryData, matchFile) {
    try {
      console.log('🔄 Starting data combination...', scorecardData);
      
      const matchId = this.extractMatchIdFromFile(matchFile);
      
      // Extract basic match info
      const matchInfo = this.extractMatchInfo(scorecardData);
      const teams = scorecardData.Teams || {};
      const players = this.transformInningsData(scorecardData);
      
      // Transform commentary data to cricketData.json format
      const transformedCommentary = this.transformAllCommentaryData(commentaryData);
      
      // Extract current match state from latest commentary
      const currentMatchState = this.extractCurrentMatchState(commentaryData);
      
      // Extract scores for quick access
      const scores = this.extractLiveScores(scorecardData);
      
      // Combine everything into cricketData.json structure
      const combinedData = {
        // Match basic info
        matchId: matchId,
        matchInfo: matchInfo,
        Teams: teams,
        
        // Player data (batting, bowling, etc.)
        players: players,
        
        // Commentary data
        commentary: transformedCommentary,
        
        // Current match state (striker, non-striker, bowler)
        currentState: currentMatchState,
        
        // Live scores
        scores: scores,
        
        // Wagon wheel (dummy data as requested)
        wagonWheel: this.getDummyWagonWheelData(),
        
        // Key facts
        keyFacts: this.extractKeyFacts(scorecardData),
        
        // Ball by ball data
        ballByBall: this.extractBallByBall(scorecardData),
        
        // Raw data for debugging
        rawScorecardData: scorecardData,
        rawCommentaryData: commentaryData,
        matchDetails: scorecardData,
        Innings: scorecardData.Innings || []
      };
      
      console.log('✅ Data combination completed successfully');
      return combinedData;
      
    } catch (error) {
      console.error('❌ Error combining match data:', error);
      throw error;
    }
  }

  // Get points table (placeholder - you may need to create this API)
  async getPointsTable(tournamentId) {
    // This would replace hardcoded pointsTable.json
    // For now, return empty array
    return [];
  }

  // Helper methods for data extraction and transformation

  // Extract match info from scorecard data
  extractMatchInfo(scorecardData) {
    console.log('ℹ️ Extracting match info from scorecard...');
    console.log('📝 Available fields:', Object.keys(scorecardData));
    
    const matchDetail = scorecardData.Matchdetail || {};
    const series = scorecardData.Series || {};
    const venue = scorecardData.Venue || {};
    const officials = scorecardData.Officials || {};
    
    return {
      tournament: series.Name || series.Series_short_display_name || 'Cricket Match',
      date: matchDetail.Date || matchDetail.StartDate || new Date().toISOString().split('T')[0],
      time: matchDetail.Time || matchDetail.StartDate || 'Time TBD',
      venue: venue.Name || 'Venue TBD',
      toss: matchDetail.Tosswonby && matchDetail.Toss_elected_to 
        ? `Team ${matchDetail.Tosswonby} won toss and elected to ${matchDetail.Toss_elected_to}`
        : 'Toss details not available',
      umpires: officials.Umpires || 'Umpires TBD',
      referee: officials.Referee || 'Referee TBD',
      manOfTheMatch: matchDetail.Player_Match || 'TBD'
    };
  }

  // Extract teams info from scorecard data
  extractTeamsInfo(scorecardData) {
    console.log('🏏 Extracting teams from scorecard data...');
    console.log('📊 Teams data structure:', scorecardData.Teams);
    
    // Get team IDs from match detail
    const team1Id = scorecardData.Matchdetail?.Team_Home;
    const team2Id = scorecardData.Matchdetail?.Team_Away;
    
    console.log('🏏 Team IDs - Home:', team1Id, 'Away:', team2Id);
    
    // Access teams data from the Teams object
    const teamsData = scorecardData.Teams || {};
    const team1Data = teamsData[team1Id] || {};
    const team2Data = teamsData[team2Id] || {};
    
    console.log('🔍 Team 1 ALL FIELDS:', Object.keys(team1Data));
    console.log('🔍 Team 1 OBJECT:', team1Data);
    console.log('🔍 Team 2 ALL FIELDS:', Object.keys(team2Data));
    console.log('🔍 Team 2 OBJECT:', team2Data);
    
    return {
      team1: {
        id: team1Id,
        name: team1Data.Name_Full || 'Team 1',
        shortName: team1Data.Name_Short || 'T1',
        logoUrl: team1Data.LogoUrl || null,
        players: team1Data.Players || {}
      },
      team2: {
        id: team2Id,
        name: team2Data.Name_Full || 'Team 2', 
        shortName: team2Data.Name_Short || 'T2',
        logoUrl: team2Data.LogoUrl || null,
        players: team2Data.Players || {}
      }
    };
  }

  // Transform innings data to cricketData.json players format
  transformInningsData(scorecardData) {
    const players = {};
    
    if (scorecardData.Innings && Array.isArray(scorecardData.Innings)) {
      scorecardData.Innings.forEach((inning, index) => {
        const inningKey = (index + 1).toString();
        
        players[inningKey] = {
          batting: this.transformBattingData(inning.Batsmen || []),
          bowling: this.transformBowlingData(inning.Bowlers || []),
          extras: `${inning.Byes || 0}b ${inning.Legbyes || 0}lb ${inning.Wides || 0}w ${inning.Noballs || 0}nb`,
          total: `${inning.Total || 0}/${inning.Wickets || 0}`,
          didNotBat: this.extractDidNotBat(scorecardData, inning.Battingteam, inning.Batsmen || []),
          fallOfWickets: this.transformFallOfWickets(inning.FallofWickets || [])
        };
      });
    }
    
    return players;
  }

  // Transform commentary data for all innings to cricketData.json format
  transformAllCommentaryData(commentaryData) {
    const transformedCommentary = {};
    
    Object.keys(commentaryData).forEach(inningNo => {
      const inningCommentary = commentaryData[inningNo] || [];
      
      transformedCommentary[inningNo] = inningCommentary
      
      // Sort by over and ball number (latest first as mentioned)
      // transformedCommentary[inningNo].sort((a, b) => {
      //   if (b.over !== a.over) return b.over - a.over;
      //   return b.ball - a.ball;
      // });
    });
    
    return transformedCommentary;
  }

  // Extract current match state from latest commentary
  extractCurrentMatchState(commentaryData) {
    console.log('🎯 Extracting current match state from commentary...');
    console.log('📊 Commentary data structure:', Object.keys(commentaryData));
    
    let latestEntry = null;
    let latestInning = 0;
    
    // Find the latest commentary entry across all innings
    Object.keys(commentaryData).forEach(inningNo => {
      const inningCommentary = commentaryData[inningNo] || [];
      console.log(`📝 Inning ${inningNo} commentary items:`, inningCommentary.length);
      
      if (inningCommentary.length > 0) {
        console.log(`🔍 First few entries for inning ${inningNo}:`, inningCommentary.slice(0, 3));
        
        // Find the first actual ball entry (not just text commentary)
        const firstBallEntry = inningCommentary.find(entry => 
          entry.Isball === true && entry.Over && entry.Ball_Number
        );
        
        if (firstBallEntry) {
          console.log(`⚡ Found ball entry for inning ${inningNo}:`, {
            Over: firstBallEntry.Over,
            Ball_Number: firstBallEntry.Ball_Number,
            Batsman_Name: firstBallEntry.Batsman_Name,
            Isball: firstBallEntry.Isball
          });
          
          // Compare with current latest to find the most recent ball
          if (!latestEntry || 
              parseFloat(firstBallEntry.Over) > parseFloat(latestEntry.Over) || 
              (parseFloat(firstBallEntry.Over) === parseFloat(latestEntry.Over) && parseInt(firstBallEntry.Ball_Number) > parseInt(latestEntry.Ball_Number))) {
            latestEntry = firstBallEntry;
            latestInning = parseInt(inningNo);
            console.log(`🎯 New latest ball entry found from inning ${inningNo}`);
          }
        } else {
          console.log(`⚠️ No actual ball entries found in inning ${inningNo}`);
        }
      }
    });
    
    if (latestEntry) {
      console.log('📍 Latest commentary entry found:', latestEntry);
      
      return {
        currentInning: latestInning,
        striker: latestEntry.Batsman_Name || null,
        nonStriker: latestEntry.Non_Striker_Name || null,
        bowler: latestEntry.Bowler_Name || null,
        over: parseFloat(latestEntry.Over) || 0,
        ball: parseInt(latestEntry.Ball_Number) || parseInt(latestEntry.Ball) || 0,
        totalRuns: this.parseScoreFromString(latestEntry.Score) || 0,
        totalWickets: this.parseWicketsFromString(latestEntry.Score) || 0,
        lastBallRuns: parseInt(latestEntry.Runs) || 0,
        // Additional match state info
        ballSpeed: latestEntry.Ball_Speed || null,
        commentary: latestEntry.Commentary || null,
        isWicket: latestEntry.Detail === 'W' || false
      };
    }
    
    console.log('⚠️ No commentary data found for current match state');
    return {
      currentInning: 1,
      striker: null,
      nonStriker: null,
      bowler: null,
      over: 0,
      ball: 0,
      totalRuns: 0,
      totalWickets: 0,
      lastBallRuns: 0
    };
  }

  // Extract live scores from scorecard data
  extractLiveScores(scorecardData) {
    const scores = {};
    
    if (scorecardData.Innings && Array.isArray(scorecardData.Innings)) {
      scorecardData.Innings.forEach((inning, index) => {
        const teamKey = `team${index + 1}`;
        scores[teamKey] = {
          runs: parseInt(inning.Total) || 0,
          wickets: parseInt(inning.Wickets) || 0,
          overs: inning.Overs || '0.0',
          target: parseInt(inning.Target) || null,
          required: null, // Could be calculated if needed
          requiredRate: null // Could be calculated if needed
        };
      });
    }
    
    return scores;
  }

  // // Transform scorecard API response to match cricketData.json structure
  // transformScorecardData(apiData, matchFile) {
  //   console.log('apiData:', apiData);
  //   try {
  //     console.log('🔄 Starting scorecard transformation for:', matchFile);
      
  //     const matchId = this.extractMatchIdFromFile(matchFile);
      
  //     // Basic match info transformation
  //     const matchInfo = {
  //       tournament: apiData.title || 'Cricket Match',
  //       date: apiData.date_start_ist || new Date().toISOString().split('T')[0],
  //       time: apiData.date_start_ist || 'Time TBD',
  //       venue: apiData.venue?.name || 'Venue TBD',
  //       toss: apiData.toss || 'Toss details not available',
  //       umpires: apiData.umpires || 'Umpires TBD',
  //       referee: apiData.referee || 'Referee TBD',
  //       manOfTheMatch: apiData.man_of_the_match || 'TBD'
  //     };

  //     // Team information
  //     const teams = {
  //       team1: {
  //         name: apiData.team1?.name || 'Team 1',
  //         shortName: apiData.team1?.short_name || 'T1',
  //         logoUrl: apiData.team1?.logo_url || null
  //       },
  //       team2: {
  //         name: apiData.team2?.name || 'Team 2', 
  //         shortName: apiData.team2?.short_name || 'T2',
  //         logoUrl: apiData.team2?.logo_url || null
  //       }
  //     };

  //     // Batting and bowling data transformation
  //     const playersData = this.transformPlayersData(apiData);

  //     // Live scores for quick access
  //     const scores = {
  //       team1: this.extractTeamScore(apiData, 'team1'),
  //       team2: this.extractTeamScore(apiData, 'team2')
  //     };

  //     // Keep wagon wheel as dummy data as requested
  //     const wagonWheel = this.getDummyWagonWheelData();

  //     const transformedData = {
  //       matchId: matchId,

  //       matchInfo,
        
  //       players: playersData,
  //       scores,
  //       wagonWheel,
  //       keyFacts: this.extractKeyFacts(apiData),
  //       ballByBall: this.extractBallByBall(apiData),
  //       rawApiData: apiData // Keep original for debugging
  //     };

  //     console.log('✅ Scorecard transformation completed successfully');
  //     return transformedData;
      
  //   } catch (error) {
  //     console.error('❌ Error transforming scorecard data:', error);
  //     console.log('📋 Raw API data causing error:', apiData);
  //     throw error;
  //   }
  // }

  // Transform commentary API response to match cricketData.json structure
  transformCommentaryData(apiData, inningNo) {
    try {
      console.log('🔄 Starting commentary transformation for inning:', inningNo);
      
      if (!apiData.commentary || !Array.isArray(apiData.commentary)) {
        console.warn('⚠️ No commentary array found in API response');
        return [];
      }

      const transformedCommentary = apiData.commentary.map(ball => ({
        over: ball.over_number || 0,
        ball: ball.ball_number || 0,
        runs: ball.runs || 0,
        totalRuns: ball.total_runs || 0,
        wickets: ball.wickets || 0,
        batsman: ball.batsman?.name || 'Unknown Batsman',
        bowler: ball.bowler?.name || 'Unknown Bowler',
        commentary: ball.commentary_text || 'No commentary available'
      }));

      console.log('✅ Commentary transformation completed, items:', transformedCommentary.length);
      return transformedCommentary;
      
    } catch (error) {
      console.error('❌ Error transforming commentary data:', error);
      console.log('📋 Raw commentary data causing error:', apiData);
      return [];
    }
  }

  // Helper function to extract match ID from file name
  extractMatchIdFromFile(matchFile) {
    // Try to extract numeric ID from file name, fallback to hash
    const numericMatch = matchFile.match(/(\d+)/);
    if (numericMatch) {
      return parseInt(numericMatch[1]);
    }
    // Fallback: use hash of filename
    return matchFile.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  // Helper function to transform players data (batting/bowling)
  transformPlayersData(apiData) {
    try {
      const players = {};
      
      // Process each innings
      if (apiData.innings && Array.isArray(apiData.innings)) {
        apiData.innings.forEach((inning, index) => {
          const inningKey = (index + 1).toString();
          
          players[inningKey] = {
            batting: this.transformBattingData(inning.batting || []),
            bowling: this.transformBowlingData(inning.bowling || []),
            extras: inning.extras_string || '0',
            total: inning.total_string || '0/0',
            didNotBat: inning.did_not_bat || [],
            fallOfWickets: this.transformFallOfWickets(inning.fall_of_wickets || [])
          };
        });
      }
      
      return players;
    } catch (error) {
      console.error('❌ Error transforming players data:', error);
      return {};
    }
  }

  // Transform batting data
  transformBattingData(batsmenArray) {
    return batsmenArray
      .filter(batsman => batsman.Runs !== "" && batsman.Balls !== "") // Only players who batted
      .map(batsman => ({
        name: `Player ${batsman.Batsman}`, // Will be enriched with actual names from Teams data
        runs: batsman.Runs || "0",
        balls: batsman.Balls || "0",
        strikeRate: batsman.Strikerate || "0.00",
        fours: batsman.Fours || "0",
        sixes: batsman.Sixes || "0",
        dismissal: batsman.Howout_short || batsman.Dismissal || "not out"
      }));
  }

  // Transform bowling data
  transformBowlingData(bowlersArray) {
    return bowlersArray
      .filter(bowler => bowler.Overs !== "" && bowler.Runs !== "") // Only bowlers who bowled
      .map(bowler => ({
        name: `Player ${bowler.Bowler}`, // Will be enriched with actual names from Teams data
        overs: bowler.Overs || "0",
        runs: bowler.Runs || "0",
        wickets: bowler.Wickets || "0",
        economy: bowler.Economyrate || "0.00",
        dots: bowler.Dots || "0"
      }));
  }

  // Transform fall of wickets
  transformFallOfWickets(fowArray) {
    return fowArray.map(wicket => ({
      score: wicket.Score || "0",
      wicket: wicket.Wicket_No || 1,
      over: wicket.Overs || "0",
      batsman: wicket.Batsman || 'Unknown'
    }));
  }

  // Extract team scores
  extractTeamScore(apiData, teamKey) {
    try {
      if (apiData.innings && apiData.innings.length > 0) {
        const teamInning = apiData.innings.find(inning => 
          inning.batting_team_id === apiData[teamKey]?.id
        );
        
        if (teamInning) {
          return {
            runs: teamInning.runs || 0,
            wickets: teamInning.wickets || 0,
            overs: teamInning.overs || '0.0'
          };
        }
      }
      
      return { runs: 0, wickets: 0, overs: '0.0' };
    } catch (error) {
      console.error(`❌ Error extracting score for ${teamKey}:`, error);
      return { runs: 0, wickets: 0, overs: '0.0' };
    }
  }

  // Extract key facts
  extractKeyFacts(scorecardData) {
    const matchDetail = scorecardData.Matchdetail || {};
    const currentInning = scorecardData.Innings && scorecardData.Innings.length > 0 
      ? scorecardData.Innings[scorecardData.Innings.length - 1] 
      : {};
    
    const partnershipCurrent = currentInning.Partnership_Current || {};
    const lastWicket = currentInning.FallofWickets && currentInning.FallofWickets.length > 0
      ? currentInning.FallofWickets[currentInning.FallofWickets.length - 1]
      : null;
    
    // Get team names for toss info
    const teams = scorecardData.Teams || {};
    const tossWinningTeam = teams[matchDetail.Tosswonby];
    
    return {
      partnership: partnershipCurrent.Runs 
        ? `${partnershipCurrent.Runs} runs in ${partnershipCurrent.Balls || 0} balls`
        : 'Current partnership details not available',
      lastWicket: lastWicket ? lastWicket.Batsman : 'None',
      tossInfo: matchDetail.Tosswonby && matchDetail.Toss_elected_to && tossWinningTeam
        ? `${tossWinningTeam.Name_Full} won the toss and elected to ${matchDetail.Toss_elected_to}`
        : 'Toss details not available'
    };
  }

  // Extract ball by ball data (limited)
  extractBallByBall(_scorecardData) {
    try {
      // For now, return empty object as ball-by-ball data would come from commentary
      // The commentary already provides detailed ball-by-ball information
      console.log('ℹ️ Ball-by-ball data available in commentary section');
      return {};
    } catch (error) {
      console.error('❌ Error extracting ball by ball:', error);
      return {};
    }
  }

  // Helper function to extract "did not bat" players
  extractDidNotBat(scorecardData, battingTeamId, batsmen) {
    try {
      const team = scorecardData.Teams?.[battingTeamId];
      if (!team?.Players) return [];
      
      const playersWhoBatted = batsmen
        .filter(batsman => batsman.Runs !== "" && batsman.Balls !== "")
        .map(batsman => batsman.Batsman);
      
      const allPlayers = Object.keys(team.Players);
      const didNotBat = allPlayers.filter(playerId => !playersWhoBatted.includes(playerId));
      
      // Convert player IDs to names
      return didNotBat.map(playerId => 
        team.Players[playerId]?.Name_Full || `Player ${playerId}`
      );
    } catch (error) {
      console.error('❌ Error extracting did not bat players:', error);
      return [];
    }
  }

  // Get dummy wagon wheel data (as requested)
  getDummyWagonWheelData() {
    return {
      team1: {
        offSide: { runs: 78, percentage: 39 },
        onSide: { runs: 122, percentage: 61 },
        runsByArea: {
          squareLeg: { runs: 18, boundaries: 1, angle: "270-315", region: "Square Leg" },
          fineLeg: { runs: 14, boundaries: 2, angle: "315-360", region: "Fine Leg" },
          thirdMan: { runs: 16, boundaries: 2, angle: "0-45", region: "Third Man" },
          point: { runs: 6, boundaries: 0, angle: "45-90", region: "Point" },
          cover: { runs: 33, boundaries: 3, angle: "90-135", region: "Cover" },
          longOff: { runs: 23, boundaries: 2, angle: "135-180", region: "Long Off" },
          longOn: { runs: 31, boundaries: 2, angle: "180-225", region: "Long On" },
          midWicket: { runs: 26, boundaries: 3, angle: "225-270", region: "Mid Wicket" }
        }
      },
      team2: {
        offSide: { runs: 65, percentage: 42 },
        onSide: { runs: 89, percentage: 58 },
        runsByArea: {
          squareLeg: { runs: 12, boundaries: 1, angle: "270-315", region: "Square Leg" },
          fineLeg: { runs: 8, boundaries: 1, angle: "315-360", region: "Fine Leg" },
          thirdMan: { runs: 22, boundaries: 3, angle: "0-45", region: "Third Man" },
          point: { runs: 15, boundaries: 2, angle: "45-90", region: "Point" },
          cover: { runs: 28, boundaries: 4, angle: "90-135", region: "Cover" },
          longOff: { runs: 19, boundaries: 2, angle: "135-180", region: "Long Off" },
          longOn: { runs: 25, boundaries: 3, angle: "180-225", region: "Long On" },
          midWicket: { runs: 18, boundaries: 2, angle: "225-270", region: "Mid Wicket" }
        }
      }
    };
  }

  // Fetch match scorecard data for ScorecardTab
  async fetchMatchScorecard(matchFile) {
    try {
      console.log('🏏 WebAppApiService: Fetching scorecard for match:', matchFile);
      
      // Try to fetch from API first
      try {
        const response = await axios.get(`${SPORTZ_BASE_URL}/${matchFile}.json`);
        
        if (response.status === 200 && response.data) {
          console.log('✅ WebAppApiService: Successfully fetched scorecard from API');
          return response.data;
        }
      } catch (apiError) {
        console.warn('⚠️ WebAppApiService: API fetch failed, trying local fallback:', apiError.message);
      }
      
      // Fallback to local files if API fails
      try {
        // Try UpdatedMatchFile.json first (latest structure)
        const localResponse = await axios.get('/UpdatedMatchFile.json');
        console.log('✅ WebAppApiService: Using local UpdatedMatchFile.json as fallback');
        return localResponse.data;
      } catch (localError) {
        console.warn('⚠️ WebAppApiService: Local UpdatedMatchFile.json not found, trying alternative');
        
        // Fallback to original match data structure
        const altResponse = await axios.get('/match-data.json');
        console.log('✅ WebAppApiService: Using local match-data.json as fallback');
        return altResponse.data;
      }
    } catch (error) {
      console.error('❌ WebAppApiService: All scorecard fetch attempts failed:', error);
      throw new Error(`Failed to fetch scorecard data: ${error.message}`);
    }
  }

  // Helper methods to parse score strings
  parseScoreFromString(scoreString) {
    if (!scoreString || typeof scoreString !== 'string') return 0;
    // Extract runs from format like "2/1" or "186/5"
    const match = scoreString.match(/^(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  parseWicketsFromString(scoreString) {
    if (!scoreString || typeof scoreString !== 'string') return 0;
    // Extract wickets from format like "2/1" or "186/5"
    const match = scoreString.match(/\/(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  }
}

const webAppApiService = new WebAppApiService();

export default webAppApiService;

// Named exports for individual functions
export const { 
  getFixtures, 
  getMatchData, 
  getLiveInningsData, 
  getCommentaryData, 
  getEnhancedMatchData,
  fetchAllInningsCommentary,
  fetchInningCommentary,
  fetchMatchScorecard
} = webAppApiService;
