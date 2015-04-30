var interval;
var nominateInterval;
var onBlock;

var playerNames = ['Quinn', 'Topher', 'Andy', 'Tommy', 'Pecos', 'Lentz', 'Nico', 'PVG', 'Trey', 'Reid'];

function nextNominator() {
  var previousNominator = Squads.findOne({nominate: true});
  var squads = Squads.find({}, {sort: {nominateOrder: 1}}).fetch();
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

function bid(squadName, bid) {
  var team = Teams.findOne({onBlock: true});
  var squad = Squads.findOne({name: squadName});
  if (squadName != team.bidder && team.clock > 0 && team.highBid < squad.maxBid && squad.teams.length < 3 && team.highBid < bid) {
    Teams.update({onBlock: true}, {$set: {
      highBid: team.highBid + 1,
      clock: 15,
      bidder: squadName
    }});
  }
}

function processAutoBid(teamId) {
  var team = Teams.findOne(teamId);
  var autoBidQuery = {};
  var squadsBidding = [];
  autoBidQuery['autoBids.' + teamId] = {
    $gt: team.highBid
  };
  autoBidQuery.maxBid = {
    $gte: team.highBid
  };
  autoBidQuery.teams = {
    $not: {
      $size: 3
    }
  };
  squadsBidding = Squads.find(autoBidQuery).fetch();
  if (squadsBidding.length) {
    var randSquad = squadsBidding[_.random(squadsBidding.length-1)];
    bid(randSquad.name, team.highBid + 1);
  }
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
  processAutoBid(onBlock);
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
  bid: bid,
  reset: function (passkey) {
    if (passkey === 'foo') {
      Teams.remove({});
      Squads.remove({});
      Meteor.clearInterval(interval);
      Meteor.clearInterval(nominateInterval);
      var autoBids = {};

      if (Teams.find().fetch().length === 0) {
        for (var i=0; i < teamObjects.length; i++) {
          var id = Teams.insert(teamObjects[i]);
          autoBids[id] = 0;
        }
      }

      if (Squads.find().fetch().length === 0) {
        for (var i=0; i < playerNames.length; i++) {
          Squads.insert({
            name: playerNames[i],
            maxBid: 28,
            teams: [],
            nominateOrder: i,
            nominate: (i === 0),
            autoBids: autoBids
          });
        }
      }
    }
  }
});