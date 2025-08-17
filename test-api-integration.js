// Test script for API integration
// Run with: node test-api-integration.js

import axios from 'axios';

const SPORTZ_BASE_URL = 'https://demo.sportz.io/sifeeds/repo/cricket/live/json';

// Test sample match files (you can update these with actual match file names)
const TEST_MATCH_FILES = [
  // Add actual match file names here once you get them from fixtures
  'sample_match_1',
  'sample_match_2'
];

// Test scorecard API
async function testScorecardAPI(matchFile) {
  try {
    console.log(`\n🏏 Testing Scorecard API for: ${matchFile}`);
    console.log(`📡 URL: ${SPORTZ_BASE_URL}/${matchFile}.json\n`);
    
    const response = await axios.get(`${SPORTZ_BASE_URL}/${matchFile}.json`);
    
    console.log('✅ Scorecard API Response Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data Keys:', Object.keys(response.data));
    console.log('🎯 Sample Data Structure:');
    
    // Show structure without full data to avoid overwhelming output
    const sampleData = {
      title: response.data.title,
      date_start_ist: response.data.date_start_ist,
      venue: response.data.venue,
      team1: response.data.team1,
      team2: response.data.team2,
      innings: response.data.innings?.length ? `${response.data.innings.length} innings` : 'No innings data',
      // Add more fields as they appear in actual response
    };
    
    console.log(JSON.stringify(sampleData, null, 2));
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Scorecard API Error:', error.message);
    if (error.response) {
      console.error('📡 Response Status:', error.response.status);
      console.error('📡 Response Data:', error.response.data);
    }
    return null;
  }
}

// Test commentary API
async function testCommentaryAPI(matchFile, inningNo = 1) {
  try {
    console.log(`\n💬 Testing Commentary API for: ${matchFile}, Inning: ${inningNo}`);
    console.log(`📡 URL: ${SPORTZ_BASE_URL}/${matchFile}_commentary_all_${inningNo}.json\n`);
    
    const response = await axios.get(`${SPORTZ_BASE_URL}/${matchFile}_commentary_all_${inningNo}.json`);
    
    console.log('✅ Commentary API Response Success!');
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data Keys:', Object.keys(response.data));
    
    if (response.data.commentary && Array.isArray(response.data.commentary)) {
      console.log('💬 Commentary Items:', response.data.commentary.length);
      console.log('🎯 Sample Commentary Item:');
      console.log(JSON.stringify(response.data.commentary[0], null, 2));
    } else {
      console.log('⚠️ No commentary array found in response');
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Commentary API Error:', error.message);
    if (error.response) {
      console.error('📡 Response Status:', error.response.status);
      console.error('📡 Response Data:', error.response.data);
    }
    return null;
  }
}

// Test with fixtures API to get real match files
async function getActiveMatchFiles() {
  try {
    console.log('\n🎪 Getting active match files from fixtures...');
    
    const body = JSON.stringify({
      start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sport_id: 1,
      op_type: "1"
    });
    
    const response = await axios.post(
      'https://videoscorecard.sportz.io/api/FillEvents',
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    const events = response.data.events || [];
    const filteredEvents = events.filter(event => event.coverage_id === "8");
    
    console.log(`📅 Found ${filteredEvents.length} matches with coverage_id 8`);
    
    const matchFiles = filteredEvents
      .filter(event => event.match_file_name)
      .map(event => event.match_file_name)
      .slice(0, 3); // Test only first 3 matches
      
    console.log('🎯 Match files to test:', matchFiles);
    return matchFiles;
    
  } catch (error) {
    console.error('❌ Error fetching fixtures:', error.message);
    return [];
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Integration Tests...\n');
  console.log('=' .repeat(60));
  
  try {
    // Get real match files from fixtures
    const matchFiles = await getActiveMatchFiles();
    
    if (matchFiles.length === 0) {
      console.log('\n⚠️ No match files found, using test samples');
      // Fallback to test samples if no real matches
      matchFiles.push(...TEST_MATCH_FILES);
    }
    
    for (const matchFile of matchFiles) {
      if (!matchFile) continue;
      
      console.log('\n' + '='.repeat(60));
      console.log(`🎾 Testing Match File: ${matchFile}`);
      console.log('='.repeat(60));
      
      // Test scorecard API
      const scorecardData = await testScorecardAPI(matchFile);
      
      // Test commentary API for innings 1 and 2
      await testCommentaryAPI(matchFile, 1);
      await testCommentaryAPI(matchFile, 2);
      
      console.log('\n' + '-'.repeat(40));
    }
    
    console.log('\n✅ API Tests Completed!');
    console.log('\n📝 Summary:');
    console.log('- Check console output above for API response structures');
    console.log('- Look for any error messages or missing fields');
    console.log('- Update transformation mapping based on actual API structure');
    
  } catch (error) {
    console.error('\n❌ Test execution error:', error);
  }
}

// Run tests
runTests();
