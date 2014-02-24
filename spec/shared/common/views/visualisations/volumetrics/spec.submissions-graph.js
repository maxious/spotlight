define([
  'common/views/visualisations/volumetrics/submissions-graph',
  'extensions/collections/collection',
  'extensions/models/model'
],
function (SubmissionsGraph, Collection, Model) {

  function collectionForPeriod(period) {
    var CollectionWithPeriod =  Collection.extend({
      queryParams: function () {
        return {
          period: period
        };
      }
    });

    return new CollectionWithPeriod();
  }

  var graph;
  beforeEach(function () {
    var model = new Model({
      'value-attr': 'someAttr'
    });
    graph = new SubmissionsGraph({
      collection: new Collection(),
      model: model
    });
  });

  describe('getConfigNames', function () {
    it('returns configuration for week by default', function () {
      expect(graph.getConfigNames()).toEqual(['stack', 'week']);
    });

    it('returns configuration for day when query period is for day', function () {
      var graph = new SubmissionsGraph({
        collection: collectionForPeriod('day')
      });

      expect(graph.getConfigNames()).toEqual(['stack', 'day']);
    });

    it('returns configuration for when axis period is set', function () {
      var collection = new Collection([], { axisPeriod: 'month' });
      var graph = new SubmissionsGraph({ collection: collection });

      expect(graph.getConfigNames()).toEqual(['stack', 'month']);
    });
  });

});
