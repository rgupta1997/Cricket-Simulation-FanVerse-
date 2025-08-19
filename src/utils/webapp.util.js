// Reusable utility functions for the WebApp

/**
 * Extract player information from match detail for a specific inning
 * @param {Object} matchDetail - The match detail object from API response
 * @param {number} selectedInning - The inning number (1, 2, etc.)
 * @returns {Object} Object containing batting, bowling, and fallOfWickets arrays
 */
export const extractPlayersInfo = (matchDetail, selectedInning) => {
    console.log('matchDetail', matchDetail);
    console.log('firstInning', selectedInning);
  if (!matchDetail?.Innings || !matchDetail.teams) {
    return { batting: [], bowling: [], fallOfWickets: [] };
  }

  const currentInning = matchDetail.Innings[selectedInning - 1];
  if (!currentInning) {
    return { batting: [], bowling: [], fallOfWickets: [] };
  }

  // Get team information
  const battingTeamId = currentInning.Battingteam;
  const bowlingTeamId = currentInning.Bowlingteam;
  const battingTeamPlayers = matchDetail.teams[battingTeamId]?.Players || {};
  const bowlingTeamPlayers = matchDetail.teams[bowlingTeamId]?.Players || {};

  // Extract batting data
  const batting = (currentInning.Batsmen || [])
    .filter(batsman => batsman.Runs !== "" && batsman.Balls !== "") // Only players who batted
    .map(batsman => {
      const playerInfo = battingTeamPlayers[batsman.Batsman];
      return {
        name: playerInfo?.Name_Full || `Player ${batsman.Batsman}`,
        runs: batsman.Runs || "0",
        balls: batsman.Balls || "0",
        strikeRate: batsman.Strikerate || "0",
        fours: batsman.Fours || "0",
        sixes: batsman.Sixes || "0",
        dismissal: batsman.Howout_short || batsman.Dismissal || "not out"
      };
    });

  // Extract bowling data
  const bowling = (currentInning.Bowlers || [])
    .filter(bowler => bowler.Overs !== "" && bowler.Runs !== "") // Only bowlers who bowled
    .map(bowler => {
      const playerInfo = bowlingTeamPlayers[bowler.Bowler];
      return {
        name: playerInfo?.Name_Full || `Player ${bowler.Bowler}`,
        overs: bowler.Overs || "0",
        runs: bowler.Runs || "0",
        wickets: bowler.Wickets || "0",
        economy: bowler.Economyrate || "0.00",
        dots: bowler.Dots || "0"
      };
    });

  // Extract fall of wickets (simplified)
  const fallOfWickets = (currentInning.FallofWickets || []).map((wicket, index) => ({
    batsman: `Wicket ${index + 1}`,
    runs: wicket.Runs || "0",
    over: wicket.Overs || "0"
  }));

  // Add a default wicket if none exist
  if (fallOfWickets.length === 0) {
    fallOfWickets.push({ batsman: "No wickets", runs: "0", over: "0" });
  }

  return { batting, bowling, fallOfWickets };
};

/**
 * Extract key facts from match detail
 * @param {Object} matchDetail - The match detail object from API response
 * @returns {Object} Object containing partnership and toss information
 */
export const extractKeyFacts = (matchDetail) => {
  if (!matchDetail?.Matchdetail) {
    return {
      partnership: "N/A",
      tossInfo: "N/A"
    };
  }

  const tosswonby = matchDetail.Matchdetail.Tosswonby;
  const tossElectedTo = matchDetail.Matchdetail.Toss_elected_to;
  const teams = matchDetail.Teams || {};
  
  let tossInfo = "N/A";
  if (tosswonby && tossElectedTo) {
    const tossWinningTeam = teams[tosswonby]?.Name_Full || `Team ${tosswonby}`;
    tossInfo = `${tossWinningTeam} won the toss and elected to ${tossElectedTo}`;
  }

  return {
    partnership: "Current partnership", // This would need to be calculated from live data
    tossInfo
  };
};

/**
 * Get team information by team ID
 * @param {Object} matchDetail - The match detail object from API response
 * @param {string} teamId - The team ID
 * @returns {Object} Team information object
 */
export const getTeamInfo = (matchDetail, teamId) => {
  if (!matchDetail?.Teams || !teamId) {
    return { name: "Unknown Team", shortName: "UNK", players: {} };
  }

  const team = matchDetail.Teams[teamId];
  return {
    name: team?.Name_Full || "Unknown Team",
    shortName: team?.Name_Short || "UNK",
    players: team?.Players || {}
  };
};

/**
 * Get player information by player ID from a team
 * @param {Object} teamPlayers - The team players object
 * @param {string} playerId - The player ID
 * @returns {Object} Player information object
 */
export const getPlayerInfo = (teamPlayers, playerId) => {
  const player = teamPlayers[playerId];
  return {
    name: player?.Name_Full || `Player ${playerId}`,
    shortName: player?.Name_Short || `P${playerId}`,
    role: player?.Role || "Unknown",
    nationality: player?.nationality || "Unknown"
  };
};

/**
 * Format strike rate to 2 decimal places
 * @param {string|number} strikeRate - The strike rate value
 * @returns {string} Formatted strike rate
 */
export const formatStrikeRate = (strikeRate) => {
  const rate = parseFloat(strikeRate);
  return isNaN(rate) ? "0.00" : rate.toFixed(2);
};

/**
 * Format economy rate to 2 decimal places
 * @param {string|number} economyRate - The economy rate value
 * @returns {string} Formatted economy rate
 */
export const formatEconomyRate = (economyRate) => {
  const rate = parseFloat(economyRate);
  return isNaN(rate) ? "0.00" : rate.toFixed(2);
};

/**
 * Extract scorecard information from match detail (combines all innings)
 * @param {Object} matchDetail - The match detail object from API response
 * @returns {Object} Object containing combined batting, bowling, and fallOfWickets arrays
 */
export const extractScorecardInfo = (matchDetail) => {
  console.log('extractScorecardInfo - matchDetail', matchDetail);
  
  if (!matchDetail?.Innings || !matchDetail.Teams) {
    return { batting: [], bowling: [], fallOfWickets: [], extras: "0", total: "0/0", didNotBat: [] };
  }

  // For scorecard, we typically show the first innings (batting team)
  const firstInning = matchDetail.Innings[0];
  if (!firstInning) {
    return { batting: [], bowling: [], fallOfWickets: [], extras: "0", total: "0/0", didNotBat: [] };
  }

  // Get team information
  const battingTeamId = firstInning.Battingteam;
  const bowlingTeamId = firstInning.Bowlingteam;
  const battingTeamPlayers = matchDetail.Teams[battingTeamId]?.Players || {};
  const bowlingTeamPlayers = matchDetail.Teams[bowlingTeamId]?.Players || {};

  // Extract batting data
  const batting = (firstInning.Batsmen || [])
    .filter(batsman => batsman.Runs !== "" && batsman.Balls !== "") // Only players who batted
    .map(batsman => {
      const playerInfo = battingTeamPlayers[batsman.Batsman];
      return {
        name: playerInfo?.Name_Full || `Player ${batsman.Batsman}`,
        runs: batsman.Runs || "0",
        balls: batsman.Balls || "0",
        strikeRate: batsman.Strikerate || "0",
        fours: batsman.Fours || "0",
        sixes: batsman.Sixes || "0",
        dismissal: batsman.Howout_short || batsman.Dismissal || "not out"
      };
    });

  // Extract bowling data
  const bowling = (firstInning.Bowlers || [])
    .filter(bowler => bowler.Overs !== "" && bowler.Runs !== "") // Only bowlers who bowled
    .map(bowler => {
      const playerInfo = bowlingTeamPlayers[bowler.Bowler];
      return {
        name: playerInfo?.Name_Full || `Player ${bowler.Bowler}`,
        overs: bowler.Overs || "0",
        runs: bowler.Runs || "0",
        wickets: bowler.Wickets || "0",
        economy: bowler.Economyrate || "0.00",
        dots: bowler.Dots || "0"
      };
    });

  // Extract fall of wickets
  const fallOfWickets = (firstInning.FallofWickets || []).map(wicket => ({
    batsman: wicket.Batsman || "Unknown",
    score: wicket.Score || "0",
    wicket: wicket.Wicket_No || 1,
    over: wicket.Overs || "0"
  }));

  // Calculate extras
  const extras = `${firstInning.Byes || 0}b ${firstInning.Legbyes || 0}lb ${firstInning.Wides || 0}w ${firstInning.Noballs || 0}nb`;
  
  // Get total
  const total = `${firstInning.Total || 0}/${firstInning.Wickets || 0}`;

  // Get did not bat players
  const playersWhoBatted = batting.map(b => b.name);
  const allTeamPlayers = Object.values(battingTeamPlayers);
  const didNotBat = allTeamPlayers
    .filter(player => !playersWhoBatted.includes(player.Name_Full))
    .map(player => player.Name_Full)
    .slice(0, 5); // Limit to avoid too many names

  return { 
    batting, 
    bowling, 
    fallOfWickets, 
    extras, 
    total, 
    didNotBat 
  };
};
