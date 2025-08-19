// Import all data modules
// import teamsData from './teams.json';
// import venuesData from './venues.json';
// import matchesData from './matches.json';
import pointsTableData from './pointsTable.json';

// For now, import the old cricketData for match details
// In a real app, these would be fetched from an API based on matchId
// import oldCricketData from './cricketData.json';

// Helper functions to work with the data
export const getTeamById = (teamId) => {
  return teamsData.teams.find(team => team.id === teamId);
};

export const getVenueById = (venueId) => {
  return venuesData.venues.find(venue => venue.id === venueId);
};

export const getMatchById = (matchId) => {
  return matchesData.matches.find(match => match.matchId === matchId);
};

export const getMatchDetails = (matchId) => {
  // In a real app, this would be an API call
  // For now, we'll use the old data structure for match details
  return oldCricketData.matchDetails?.[String(matchId)] || null;
};

export const getMatchScorecard = (matchId) => {
  // In a real app, this would be an API call
  return oldCricketData.players?.[String(matchId)] || null;
};

export const getMatchCommentary = (matchId) => {
  // In a real app, this would be an API call
  return oldCricketData.commentary?.[String(matchId)] || null;
};

export const getTournamentById = (tournamentId) => {
  return matchesData.tournaments[tournamentId];
};

export const getPointsTable = (tournamentId) => {
  return pointsTableData.pointsTable[tournamentId] || [];
};

export const getMatchesByStatus = (status) => {
  return matchesData.matches.filter(match => match.status === status);
};

export const getMatchesByTeam = (teamId) => {
  return matchesData.matches.filter(match => 
    match.team1Id === teamId || match.team2Id === teamId
  );
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return {
    shortDate: `${months[date.getMonth()]} ${date.getDate()} - ${date.getFullYear()}`,
    dayTime: `${days[date.getDay()]} ${dateString.split('T')[0]}`
  };
};

// Export the data objects for direct access if needed
export {
  // teamsData,
  // venuesData,
  // matchesData,
  pointsTableData
};

// Default export with all data and helpers
export default {
  // teams: teamsData.teams,
  // venues: venuesData.venues,
  // matches: matchesData.matches,
  // tournaments: matchesData.tournaments,
  pointsTable: pointsTableData.pointsTable,
  getTeamById,
  getVenueById,
  getMatchById,
  getMatchDetails,
  getMatchScorecard,
  getMatchCommentary,
  getTournamentById,
  getPointsTable,
  getMatchesByStatus,
  getMatchesByTeam,
  formatDate
};
