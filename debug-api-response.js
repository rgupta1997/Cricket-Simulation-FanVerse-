// Debug actual API response structure
// Run with: node debug-api-response.js

import axios from 'axios';
import fs from 'fs';

const SPORTZ_BASE_URL = 'https://demo.sportz.io/sifeeds/repo/cricket/live/json';
const MATCH_FILE = 'ausa08162025258915';

async function debugAPIResponse() {
  console.log('🔍 Debugging Actual API Response Structure');
  console.log('=' .repeat(60));
  
  try {
    // Test scorecard API and log full response
    console.log('\n📊 Fetching Scorecard Data');
    const scorecardResponse = await axios.get(`${SPORTZ_BASE_URL}/${MATCH_FILE}.json`);
    const scorecardData = scorecardResponse.data;
    
    console.log('✅ Scorecard Response Status:', scorecardResponse.status);
    console.log('📋 Response Data Keys:', Object.keys(scorecardData));
    console.log('📊 Full Response Structure:');
    console.log(JSON.stringify(scorecardData, null, 2));
    
    // Save to file for easier analysis
    fs.writeFileSync('scorecard-response.json', JSON.stringify(scorecardData, null, 2));
    console.log('💾 Saved to scorecard-response.json');
    
    // Test commentary API and log full response
    console.log('\n💬 Fetching Commentary Data (Inning 1)');
    try {
      const commentaryResponse = await axios.get(`${SPORTZ_BASE_URL}/${MATCH_FILE}_commentary_all_1.json`);
      const commentaryData = commentaryResponse.data;
      
      console.log('✅ Commentary Response Status:', commentaryResponse.status);
      console.log('📋 Commentary Data Keys:', Object.keys(commentaryData));
      console.log('📊 Full Commentary Structure:');
      console.log(JSON.stringify(commentaryData, null, 2));
      
      // Save to file for easier analysis
      fs.writeFileSync('commentary-response.json', JSON.stringify(commentaryData, null, 2));
      console.log('💾 Saved to commentary-response.json');
      
    } catch (error) {
      console.error('❌ Commentary Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Scorecard Error:', error.message);
    if (error.response) {
      console.error('📡 Response Status:', error.response.status);
      console.error('📡 Response Data:', error.response.data);
    }
  }
}

debugAPIResponse();
