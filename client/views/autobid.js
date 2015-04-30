Template.autobid.helpers({
  teams: function () {
    return Teams.find();
  },
  squad: function () {
    return Squads.findOne({name: Session.get('squad')});
  },
  team: function (teamId) {
    return Teams.findOne(teamId).name;
  },
  autoBids: function () {
    var squad = Squads.findOne({name: Session.get('squad')});
    if (squad) {
      var autoBidTeams = _.map(squad.autoBids, function(value, key) {
        return {
          teamId: key,
          autoBid: value
        };
      });
      return autoBidTeams;
    }
  }
});

Template.autobid.events({
  'change input': function (event) {
    var $target = $(event.target);
    var update = {};
    update['autoBids.' + $target.attr('id')] = +$target.val();
    var squadId = Squads.findOne({name: Session.get('squad')})._id;
    Squads.update(squadId, {$set: update});
  }
});