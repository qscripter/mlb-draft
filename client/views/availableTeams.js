Template.availableTeams.helpers({
  teams: function () {
    return Teams.find({owned: false});
  },
  squad: function () {
    return Squads.findOne({name: Session.get('squad')});
  }
});

Template.availableTeams.events({
  'click .nominate': function (event) {
    Meteor.call('nominate', event.target.id, Session.get('squad'));
  }
});