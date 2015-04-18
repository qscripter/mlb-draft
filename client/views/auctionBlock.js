var clock = 15;

Template.auctionBlock.helpers({
  teamOnBlock: function () {
    return Teams.findOne({onBlock: true});
  },
  nominate: function () {
    return Squads.findOne({nominate: true});
  },
  bidValue: function () {
    var team = Teams.findOne({onBlock: true});
    if (team)  {
      return Teams.findOne({onBlock: true}).highBid + 1;
    }
  },
  canBid: function () {
    var squad = Squads.findOne({name: Session.get('squad')});
    var team = Teams.findOne({onBlock: true});
    if (squad && team && squad.maxBid > team.highBid && squad.teams.length < 3) {
      console.log(team);
      return true;
    }
    return false;
  }
});

Tracker.autorun(function () {
  var team = Teams.findOne({onBlock: true});
  var color = 'green';
  if (team) {
    if (team.clock < 6) {
      color = 'red';
    }
    $('.dial').trigger('configure', {
      'fgColor': color,
      'inputColor': color
    });
    $('.dial')
      .val(team.clock)
      .trigger('change');
  }
});

Tracker.autorun(function () {
  var squad = Squads.findOne({nominate: true});
  var color = 'green';
  if (squad) {
    if (squad.nominateTime < 6) {
      color = 'red';
    }
    $('.dial').trigger('configure', {
      'fgColor': color,
      'inputColor': color
    });
    $('.dial')
      .val(squad.nominateTime)
      .trigger('change');
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
     'width': 80,
     'readOnly': true,
     'value': clock,
     'fgColor': 'green'
   });
};