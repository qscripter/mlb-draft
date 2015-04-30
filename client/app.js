Router.route('/', function () {
  // render the Home template with a custom data context
  this.render('pickSquad', {data: {title: 'My Title'}});
});

Router.route('/squad/:squad', function() {
  Session.set('squad', this.params.squad);
  this.render('main', {data: {squad: this.params.squad}});
});

Router.route('/autobid/:squad', function() {
  Session.set('squad', this.params.squad);
  this.render('autobid', {data: {squad: this.params.squad}});
});
