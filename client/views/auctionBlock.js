Template.auctionBlock.helpers({
  teamOnBlock: function () {
    return Teams.findOne({onBlock: true});
  },
  nominate: function () {
    return Squads.findOne({nominate: true});
  },
  knobColor: function () {
    if (Teams.findOne({onBlock: true}).clock > 5) {
      return 'green';
    } else {
      return 'red';
    }
  },
  bidValue: function () {
    return Teams.findOne({onBlock: true}).highBid + 1;
  }
});

Template.auctionBlock.events({
  'click .bid': function (event) {
    var bid = $(event.target).attr('data-bid');
    Meteor.call('bid', Session.get('squad'), bid);
  }
});

Template.auctionBlock.rendered = function() {
   // init. 
   $(".dial").knob({
     'stepsize': 1,
     'width': 50,
     'readOnly': true
   });
};