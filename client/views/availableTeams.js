Template.availableTeams.helpers({
  teams: function () {
    return Teams.find({owned: false}, {sort: {projW: -1}});
  },
  squad: function () {
    return Squads.findOne({name: Session.get('squad')});
  },
  ableToNominate: function () {
    var squad = Squads.findOne({name: Session.get('squad')});
    if (squad) {
      return Teams.find({onBlock: true}).count() === 0 && squad.nominate;
    }
    
  }
});

Template.availableTeams.events({
  'click .nominate': function (event) {
    Meteor.call('nominate', event.target.id, Session.get('squad'));
  }
});