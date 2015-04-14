var interval;
var nominateInterval;
var onBlock;

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
    Squads.update({}, {$set: {nominate: false}}, {multi: true});
    Squads.update({nominateOrder: teamsOwned%10}, {$set: {
      nominate: true,
      nominateTime: 15
    }});
    nominateInterval = Meteor.setInterval(nominateTick, 1000);
  }
  Teams.update(onBlock, {$set: {clock: team.clock - 1}});
}

function nominateTick () {
  var squad = Squads.findOne({nominate: true});
  if (squad.nominateTime === 1) {
    var team = Teams.findOne({owned: false});
    nominateTeam(team._id, squad.name);
  }
  Squads.update(squad._id, {$set: {nominateTime: squad.nominateTime - 1}});
}

function nominateTeam (id, squadName) {
    var team = Teams.findOne(id);
    var squad = Squads.findOne({name: squadName});
    if (squad.nominate && !team.owned) {
      onBlock = id;
      Teams.update({}, {$set: {onBlock: false}}, {multi: true});
      Teams.update(id, {$set: {
        onBlock: true,
        clock: 15,
        highBid: 1,
        bidder: squadName
      }});
      Squads.update(squad._id, {$set: {nominate: false}});
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
  }
});