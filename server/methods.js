var interval;
var nominateInterval;
var onBlock;

var playerNames = ["Quinn", "Topher", "Andy", "Tommy", "Pecos", "Lentz", "Nico", "PVG", "Trey", "Reid"];
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

function nextNominator () {
  var previousNominator = Squads.findOne({nominate: true});
  var squads = Squads.find().fetch();
  squads = _.sortBy(squads, function (squad) {
    return squad.nominateOrder;
  });
  var indexOfPrevious = _.indexOf(_.pluck(squads, '_id'), previousNominator._id);
  for (var i=indexOfPrevious+1; i < squads.length; i++) {
    if (squads[i].teams.length < 3) {
      return squads[i]._id;
    }
  }
  for (var i=0; i < squads.length; i++) {
    if (squads[i].teams.length < 3) {
      return squads[i]._id;
    }
  }
  return false;
}

function tick () {
  var team = Teams.findOne(onBlock);
  if  (team.clock === 1) {
    Meteor.clearInterval(interval);
    Teams.update(onBlock, {$set: {
      owned: true,
      onBlock: false
    }});
    var squad = Squads.findOne({name: team.bidder});
    Squads.update({name: team.bidder}, {$addToSet: {teams: {
      name: team.name,
      price: team.highBid
    }}});
    Squads.update({name: team.bidder}, {$set: {maxBid: squad.maxBid - team.highBid + 1}});

    var teamsOwned = Teams.find({owned: true}).count();
    var squadsAlive = Squads.find({$where: 'this.teams.length < 3'}).count();
    var next = nextNominator();
    Squads.update({}, {$set: {nominate: false}}, {multi: true});
    Squads.update(next, {$set: {
      nominate: true,
      nominateTime: 15
    }});
    if (Teams.find({owned: false}).count() > 0) {
      nominateInterval = Meteor.setInterval(nominateTick, 1000);
    }
  }
  Teams.update(onBlock, {$set: {clock: team.clock - 1}});
}

function nominateTick () {
  var squad = Squads.findOne({nominate: true});
  if (squad.nominateTime === 1) {
    var team = Teams.find({owned: false}, {sort: {projW: -1}}).fetch()[0];
    nominateTeam(team._id, squad.name);
  }
  Squads.update(squad._id, {$set: {nominateTime: squad.nominateTime - 1}});
}

function nominateTeam (id, squadName) {
    var team = Teams.findOne(id);
    var squad = Squads.findOne({name: squadName});
    var nominatedTeam = Teams.findOne({onBlock: true});
    if (squad.nominate && !team.owned && !nominatedTeam) {
      onBlock = id;
      Teams.update({}, {$set: {onBlock: false}}, {multi: true});
      Teams.update(id, {$set: {
        onBlock: true,
        clock: 15,
        highBid: 1,
        bidder: squadName
      }});
      //Squads.update(squad._id, {$set: {nominate: false}});
      Meteor.clearInterval(nominateInterval);
      interval = Meteor.setInterval(tick, 1000);
    }
  }

Meteor.methods({
  nominate: nominateTeam,
  bid: function (squadName) {
    var team = Teams.findOne({onBlock: true});
    var squad = Squads.findOne({name: squadName});
    if (squadName != team.bidder && team.clock > 0 && team.highBid < squad.maxBid && squad.teams.length < 3) {
      Teams.update({onBlock: true}, {$set: {
        highBid: team.highBid + 1,
        clock: 15,
        bidder: squadName
      }});
    }
  },
  reset: function (passkey) {
    if (passkey === 'foo') {
      Teams.remove({});
      Squads.remove({});

      if (Teams.find().fetch().length === 0) {
        for (var i=0; i < teamObjects.length; i++) {
          Teams.insert(teamObjects[i]);
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
    }
  }
});