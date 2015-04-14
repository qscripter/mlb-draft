var playerNames = ["Andy", "Topher", "Quinn", "Tommy", "Pecos", "Lentz", "Nico", "PVG", "Trey", "Reid"];
var teams = [
  'Atlanta',
  'Baltimore',
  'Chicago Sox',
  'NY Yankees',
  'LA Angels',
  'San Diego',
  'LA Dodgers',
  'Milwaukee',
  'Toronto',
  'Texas',
  'Cincinnati',
  'Minnesota',
  'Oakland',
  'Pittsburgh',
  'Miami',
  'Washington',
  'Seattle',
  'Chicago Cubs',
  'Detroit',
  'Arizona',
  'NY Mets',
  'San Francisco',
  'Houston',
  'Tampa Bay',
  'St. Louis',
  'Kansas City',
  'Philadelphia',
  'Boston',
  'Cleveland',
  'Colorado'
];

Meteor.startup(function () {
  //Teams.remove({});
  //Squads.remove({});
  if (Teams.find().fetch().length === 0) {
    for (var i=0; i < teams.length; i++) {
      Teams.insert({
        name: teams[i],
        owned: false
      });
    }
  }

  if (Squads.find().fetch().length === 0) {
    for (var i=0; i < playerNames.length; i++) {
      Squads.insert({
        name: playerNames[i],
        maxBid: 28,
        teams: [],
        nominateOrder: i,
        nominate: (i === 0)
      });
    }
  }
});