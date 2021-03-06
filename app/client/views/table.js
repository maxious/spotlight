define([
  'extensions/views/table',
  'modernizr',
  'client/accessibility',
    'jquerydeparam'
],
function (TableView, Modernizr, accessibility, $) {

  return TableView.extend({

    initialize: function (options) {

      TableView.prototype.initialize.apply(this, arguments);

      this.options = _.extend({
        scrollable: true,
        saveSortInUrl: false
      }, options || {});

      this.sortFields = this.collection.options.axes.y ?
        _.cloneDeep(this.collection.options.axes.y) : [];
      if (this.collection.options.axes.x) {
        this.sortFields.unshift(this.collection.options.axes.x);
      }

      this.sortFields = _.object(_.pluck(this.sortFields, 'key'), this.sortFields);

      this.listenTo(this.collection, 'sort', this.render);
      this.listenTo(this.collection, 'reset', this.render);

      this.listenTo(this.model, 'change:sort-by change:sort-order', function () { this.sort(); });
      this.listenTo(this.model, 'sort-changed-external', _.bind(function(data) {
        this.screenreaderAnnounceSortChange(data['sort-by'], data['sort-order']);
        this.options.saveSortInUrl && this.updateUrlWithSort();
      }, this));

    },

    events: {
      'click .js-sort': 'sortCol'
    },

    sortCol: function (e) {
      e.preventDefault();

      var th = $(e.target).closest('th'),
        sorted = this.model.get('sort-by'),
        isDescending = this.model.get('sort-order') === 'descending',
        sortBy = th.attr('data-key');

      if (_.isArray(sortBy)) {
        sortBy = sortBy[0];
      }

      if (sorted === sortBy) {
        this.model.set('sort-order', isDescending ? 'ascending' : 'descending');
      } else {
        this.model.set({
          'sort-order': 'descending',
          'sort-by': sortBy
        });
      }
      this.screenreaderAnnounceSortChange(sortBy, this.model.get('sort-order'));
      this.options.saveSortInUrl && this.updateUrlWithSort();
    },

    render: function () {
      var bodyHtml;

      /* Could have just called render on the superclass to re-render the whole table including
      headings. The reason it's better just to re-render the body and update the classes on the
      header row, is keyboard focus remains on the selected column header link === better accessibility
       */
      this.$('tbody').remove();
      bodyHtml = TableView.prototype.renderBody.apply(this);
      this.$('table').append(bodyHtml);

      this.updateSortHeadings();

      if (Modernizr.touch) {
        this.$('table').addClass('touch-table');
      }
      this.adjustCellWidths();

    },

    updateSortHeadings: function () {
      var sortBy = this.model.get('sort-by'),
        sortOrder = this.model.get('sort-order'),
        $sortedCells,
        classDesc = 'descending',
        classAsc = 'ascending';

      if (sortBy) {
        var ths = this.$('thead th'),
          $allCells = this.$('th,td'),
          th = this.$('thead th[data-key="' + sortBy + '"]');

        ths.removeClass(classAsc);
        ths.removeClass(classDesc);
        ths.removeAttr('aria-sort');

        ths
          .find('.js-click-sort')
          .remove()
          .end()
          .find('.js-sort')
          .append(' <span class="js-click-sort visuallyhidden">Click to sort</span>');

        th
          .find('.js-click-sort')
          .remove();

        if (sortOrder === 'descending') {
          th.addClass(classDesc);
          th.attr('aria-sort', 'descending');
        } else {
          th.addClass(classAsc);
          th.attr('aria-sort', 'ascending');
        }

        $allCells.removeClass('sort-column');
        $sortedCells = this.$('[data-key="' + this.model.get('sort-by') + '"]');
        $sortedCells.addClass('sort-column');
      }

    },

    adjustCellWidths: function() {
      var $bodyCells = this.$('table').find('tbody td, tbody th'),
        $headerCells = this.$('table').find('thead th');
      $headerCells.attr('width', '');
      $bodyCells.attr('width', '');

      this.$('table').removeClass('floated-header');

      if (this.options.scrollable && ($bodyCells.length > $headerCells.length)) {
        _.each($headerCells, function (th, index) {
          $bodyCells[index].width = $bodyCells[index].offsetWidth;
        }, this);

        this.$('table').addClass('floated-header');

        _.each($headerCells, function (th, index) {
          th.width = $bodyCells[index].offsetWidth;
        }, this);
      }
    },

    screenreaderAnnounceSortChange: function(sortField, sortDirection) {
      var sortLabel = this.sortFields[sortField] && this.sortFields[sortField].label;
      if (sortLabel) {
        accessibility.updateLiveRegion('Transactions now sorted by ' + sortLabel + ' in ' + sortDirection + ' order');
      }
    },

    updateUrlWithSort: function() {
      var merged;
      if (Modernizr.history) {
        merged = this.mergeSortParams(window.location.search.substr(1), this.model.get('sort-by'),
          this.model.get('sort-order'));
        this.replaceUrlParams(merged);
      }
    },

    replaceUrlParams: function(params) {
      window.history.replaceState(null, null, '?' + params);
    }

  });

});