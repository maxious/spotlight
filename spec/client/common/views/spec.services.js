define([
  'client/views/services',
  'backbone'
], function (ServicesView, Backbone) {

  describe('Services View', function () {

    var $el;

    beforeEach(function () {
      spyOn(window.history, 'replaceState');
      $el = $('<div><input id="filter"/><select id="department"><option value="">All</option><option value="home-office">Home Office</option></select><select id="service"><option value="">All</option><option value="service1">Service 1</option></select></div>');
    });

    it('uses the history API to update the URL after filtering', function () {
      $el.find('#filter').val('passport');
      var view = new ServicesView({
        el: $el,
        model: new Backbone.Model()
      });
      view.filter();
      expect(window.history.replaceState).toHaveBeenCalledWith(null, null, '?filter=passport');
      $el.find('#department').val('home-office');
      view.filter();
      expect(window.history.replaceState).toHaveBeenCalledWith(null, null, '?filter=passport&department=home-office');
      $el.find('#filter').val('');
      view.filter();
      expect(window.history.replaceState).toHaveBeenCalledWith(null, null, '?department=home-office');
      $el.find('#service').val('service1');
      view.filter();
      expect(window.history.replaceState).toHaveBeenCalledWith(null, null, '?department=home-office&service=service1');
    });

  });

});
