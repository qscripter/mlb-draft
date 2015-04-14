Template.auctionBlock.helpers({
  teamOnBlock: function () {
    return Teams.findOne({onBlock: true});
  },
  nominate: function () {
    return Squads.findOne({nominate: true});
  }
});

Template.auctionBlock.events({
  'click .bid': function (event) {
    Meteor.call('bid', Session.get('squad'));
  }
});