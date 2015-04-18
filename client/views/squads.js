Template.squads.helpers({
  squads: function () {
    return Squads.find({}, {sort: {nominateOrder: 1}});
  },
  isNominate: function () {
    if (this.nominate) {
      return 'nominate';
    }
  }
});