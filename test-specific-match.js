// Test script for the specific match: ausa08162025258915
// Run with: node test-specific-match.js

import axios from 'axios';

const SPORTZ_BASE_URL = 'https://demo.sportz.io/sifeeds/repo/cricket/live/json';
const MATCH_FILE = 'ausa08162025258915';

// Test the specific match provided by the user
async function testSpecificMatch() {
  console.log('🚀 Testing specific match:', MATCH_FILE);
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Test scorecard API
    console.log('\n📊 Step 1: Testing Scorecard API');
    console.log(`📡 URL: ${SPORTZ_BASE_URL}/${MATCH_FILE}.json`);
    
    const scorecardResponse = await axios.get(`${SPORTZ_BASE_URL}/${MATCH_FILE}.json`);
    const scorecardData = scorecardResponse.data;
    
    console.log('✅ Scorecard API Success!');
    console.log('📊 Response Status:', scorecardResponse.status);
    console.log('📋 Scorecard Data Keys:', Object.keys(scorecardData));
    
    // Show important scorecard structure
    console.log('\n🎯 Scorecard Structure Analysis:');
    console.log('- Title:', scorecardData.title);
    console.log('- Date:', scorecardData.date_start_ist);
    console.log('- Team 1:', scorecardData.team1?.name);
    console.log('- Team 2:', scorecardData.team2?.name);
    console.log('- Innings Count:', scorecardData.innings?.length || 0);
    
    if (scorecardData.innings) {
      scorecardData.innings.forEach((inning, index) => {
        console.log(`- Inning ${index + 1}:`, {
          runs: inning.runs,
          wickets: inning.wickets,
          overs: inning.overs,
          batting_team: inning.batting_team?.name
        });
      });
    }
    
    // Step 2: Test commentary APIs
    const inningsCount = scorecardData.innings?.length || 2;
    console.log(`\n💬 Step 2: Testing Commentary APIs for ${inningsCount} innings`);
    
    for (let inning = 1; inning <= inningsCount; inning++) {
      try {
        console.log(`\n📡 Testing Commentary for Inning ${inning}`);
        console.log(`📡 URL: ${SPORTZ_BASE_URL}/${MATCH_FILE}_commentary_all_${inning}.json`);
        
        const commentaryResponse = await axios.get(
          `${SPORTZ_BASE_URL}/${MATCH_FILE}_commentary_all_${inning}.json`
        );
        
        const commentaryData = commentaryResponse.data;
        
        console.log(`✅ Commentary Inning ${inning} Success!`);
        console.log('📊 Response Status:', commentaryResponse.status);
        console.log('📋 Commentary Data Keys:', Object.keys(commentaryData));
        
        if (commentaryData.commentary && Array.isArray(commentaryData.commentary)) {
          const commentary = commentaryData.commentary;
          console.log(`💬 Commentary Items: ${commentary.length}`);
          
          if (commentary.length > 0) {
            console.log('\n🎯 Latest Commentary Entry (first in array):');
            const latest = commentary[0];
            console.log('- Over:', latest.over_number || latest.over);
            console.log('- Ball:', latest.ball_number || latest.ball);
            console.log('- Runs:', latest.runs || latest.runs_scored);
            console.log('- Striker:', latest.striker?.name || latest.batsman?.name);
            console.log('- Non-Striker:', latest.non_striker?.name);
            console.log('- Bowler:', latest.bowler?.name);
            console.log('- Commentary:', latest.commentary_text || latest.commentary);
            
            console.log('\n🎯 Sample Commentary Entry Structure:');
            console.log(JSON.stringify(latest, null, 2));
          }
        } else {
          console.log('⚠️ No commentary array found');
        }
        
      } catch (error) {
        console.error(`❌ Commentary Inning ${inning} Error:`, error.message);
        if (error.response) {
          console.error('📡 Response Status:', error.response.status);
        }
      }
    }
    
    // Step 3: Test combined data transformation
    console.log('\n🔄 Step 3: Testing Combined Data Transformation');
    console.log('This would simulate what our API service does...');
    
    // Simulate the combination logic
    const combinedData = {
      matchId: extractMatchId(MATCH_FILE),
      matchInfo: extractMatchInfo(scorecardData),
      teams: extractTeamsInfo(scorecardData),
      rawScorecardData: scorecardData
    };
    
    console.log('✅ Combined Data Sample:');
    console.log(JSON.stringify(combinedData, null, 2));
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
    if (error.response) {
      console.error('📡 Response Status:', error.response.status);
      console.error('📡 Response Data:', error.response.data);
    }
  }
}

// Helper functions to simulate API service logic
function extractMatchId(matchFile) {
  const numericMatch = matchFile.match(/(\d+)/);
  if (numericMatch) {
    return parseInt(numericMatch[1]);
  }
  return matchFile.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
}

function extractMatchInfo(scorecardData) {
  return {
    tournament: scorecardData.title || 'Cricket Match',
    date: scorecardData.date_start_ist || 'Date TBD',
    time: scorecardData.date_start_ist || 'Time TBD',
    venue: scorecardData.venue?.name || 'Venue TBD',
    toss: scorecardData.toss || 'Toss details not available'
  };
}

function extractTeamsInfo(scorecardData) {
  return {
    team1: {
      name: scorecardData.team1?.name || 'Team 1',
      shortName: scorecardData.team1?.short_name || 'T1'
    },
    team2: {
      name: scorecardData.team2?.name || 'Team 2',
      shortName: scorecardData.team2?.short_name || 'T2'
    }
  };
}

// Run the test
testSpecificMatch();
