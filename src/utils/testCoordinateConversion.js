// Test file to verify coordinate conversion functionality
import { convertApiToGameCoordinates, convertTrajectory } from '../utils/coordinateConverter.js';
import { SAMPLE_API_DATA, API_DATA_SETS } from '../constants/apiData.js';

// Test function to validate coordinate conversion
function testCoordinateConversion() {
  console.log('🏏 Testing Cricket Coordinate Conversion');
  console.log('=====================================');

  // Test 1: Basic conversion with sample API data
  console.log('\n📍 Test 1: Basic Conversion');
  console.log('API Sample Data:', SAMPLE_API_DATA);
  
  const convertedRelease = convertApiToGameCoordinates(SAMPLE_API_DATA.release, 'release');
  const convertedBounce = convertApiToGameCoordinates(SAMPLE_API_DATA.bounce, 'bounce');
  const convertedFinal = convertApiToGameCoordinates(SAMPLE_API_DATA.final, 'final');
  
  console.log('Converted Release:', convertedRelease);
  console.log('Converted Bounce:', convertedBounce);
  console.log('Converted Final:', convertedFinal);

  // Test 2: Full trajectory conversion
  console.log('\n🎯 Test 2: Full Trajectory Conversion');
  const fullTrajectory = convertTrajectory(SAMPLE_API_DATA);
  console.log('Full Trajectory:', JSON.stringify(fullTrajectory, null, 2));

  // Test 3: Test all API data sets
  console.log('\n🔄 Test 3: Multiple API Data Sets');
  Object.entries(API_DATA_SETS).forEach(([name, data]) => {
    console.log(`\n--- ${name.toUpperCase()} ---`);
    console.log('API Data:', data);
    const trajectory = convertTrajectory(data);
    console.log('Game Coordinates:');
    console.log('  Release:', trajectory.initial.position);
    console.log('  Bounce:', trajectory.bounce.position);
    console.log('  Final:', trajectory.target.position);
  });

  // Test 4: Edge cases with null values
  console.log('\n⚠️  Test 4: Edge Cases');
  const edgeCase1 = { x: null, y: null, z: null };
  const edgeCase2 = { x: 0, y: 15, z: 25 };
  
  console.log('All null values (release):', convertApiToGameCoordinates(edgeCase1, 'release'));
  console.log('Mixed values (final):', convertApiToGameCoordinates(edgeCase2, 'final'));

  // Test 5: Boundary conditions
  console.log('\n🎯 Test 5: Boundary Conditions');
  const minValues = { x: 0, y: 0, z: 0 };
  const maxValues = { x: 40, y: 30, z: 67 };
  
  console.log('Min API values (release):', convertApiToGameCoordinates(minValues, 'release'));
  console.log('Max API values (bounce):', convertApiToGameCoordinates(maxValues, 'bounce'));

  return {
    basicConversion: { convertedRelease, convertedBounce, convertedFinal },
    fullTrajectory,
    edgeCases: {
      allNull: convertApiToGameCoordinates(edgeCase1, 'release'),
      mixed: convertApiToGameCoordinates(edgeCase2, 'final')
    }
  };
}

// Test function for integration with PlayBall form
function testPlayBallIntegration() {
  console.log('\n🎮 Testing PlayBall Integration');
  console.log('===============================');

  // Simulate the form data structure
  const formData = {
    releasePosition: [0, 2, 15],
    bouncePosition: [0, 0, 0],
    finalPosition: [0, 0.5, -9],
    shotDegree: 0,
    shotDistance: 0,
    isLofted: false,
    useApiData: false
  };

  console.log('Default Form Data:', formData);

  // Simulate API data toggle
  const apiConvertedData = {
    ...formData,
    useApiData: true,
    releasePosition: convertApiToGameCoordinates(SAMPLE_API_DATA.release, 'release'),
    bouncePosition: convertApiToGameCoordinates(SAMPLE_API_DATA.bounce, 'bounce'),
    finalPosition: convertApiToGameCoordinates(SAMPLE_API_DATA.final, 'final')
  };

  console.log('API Converted Data:', apiConvertedData);

  return { formData, apiConvertedData };
}

// Test percentage calculation
function testPercentageCalculation() {
  console.log('\n📊 Testing Percentage Calculations');
  console.log('==================================');

  // Test specific percentage conversions
  const testCases = [
    { apiValue: 20, apiRange: [0, 40], gameRange: [-1.5, 1.5], expected: 0 },
    { apiValue: 0, apiRange: [0, 40], gameRange: [-1.5, 1.5], expected: -1.5 },
    { apiValue: 40, apiRange: [0, 40], gameRange: [-1.5, 1.5], expected: 1.5 },
    { apiValue: 10, apiRange: [0, 40], gameRange: [-1.5, 1.5], expected: -0.75 }
  ];

  testCases.forEach(({ apiValue, apiRange, gameRange, expected }, index) => {
    const percentage = (apiValue - apiRange[0]) / (apiRange[1] - apiRange[0]);
    const result = gameRange[0] + (percentage * (gameRange[1] - gameRange[0]));
    
    console.log(`Test ${index + 1}:`);
    console.log(`  API Value: ${apiValue} in range [${apiRange[0]}, ${apiRange[1]}]`);
    console.log(`  Percentage: ${(percentage * 100).toFixed(1)}%`);
    console.log(`  Game Result: ${result.toFixed(2)} (expected: ${expected})`);
    console.log(`  ✓ ${Math.abs(result - expected) < 0.01 ? 'PASS' : 'FAIL'}`);
  });
}

// Export test functions for use in browser console or testing
if (typeof window !== 'undefined') {
  window.testCoordinateConversion = testCoordinateConversion;
  window.testPlayBallIntegration = testPlayBallIntegration;
  window.testPercentageCalculation = testPercentageCalculation;
  
  // Auto-run tests when loaded
  console.log('🧪 Cricket Coordinate Conversion Tests Loaded');
  console.log('Run tests with:');
  console.log('- testCoordinateConversion()');
  console.log('- testPlayBallIntegration()');
  console.log('- testPercentageCalculation()');
}

export {
  testCoordinateConversion,
  testPlayBallIntegration,
  testPercentageCalculation
};
