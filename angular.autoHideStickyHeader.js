!function() {
  'use strict';

  angular.module('angular.autoHideStickyHeader', [])
    .directive('autoHideStickyHeader', [ '$window', directive ]);


  function directive($window) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        cssClassHidden: '@?',
        showAtBottom: '@?'
      },
      transclude: true,
      template: '<header class="auto-hide-sticky-header" ng-transclude></header>',
      link: link
    };

    function link(scope, element) {
      var options = {
        cssClassHidden: scope.cssClassHidden || 'auto-hide-sticky-header-hidden',
        showAtBottom: scope.showAtBottom ? scope.showAtBottom === 'true' : true
      };

      var onChange = getOnChange(element, options);
      var scrolling = new Scrolling(options, onChange);

      var handle = angular.bind(scrolling, scrolling.handle);
      var $el = angular.element($window).on('scroll', handle);

      scope.$on('destroy', function() {
        $el.off('scroll', handle);
      });
    }

    function getOnChange(element, options) {
      return function change(hidden) {
        element.toggleClass(options.cssClassHidden, hidden);
      }
    }
  }


  function Scrolling(options, change) {
    this.options = options;
    this.change = change;

    this.dHeight = 0;
    this.wHeight = 0;
    this.current = 0;
    this.previous = 0;
    this.diff = 0;
  }

  Scrolling.prototype = {

    constructor: Scrolling,

    atBottom: function() {
      return (this.current + this.wHeight) >= this.dHeight;
    },

    down: function() {
      return this.diff < 0;
    },

    handle: function() {
      var hidden = false;
      var scrolling = this.update();

      if (scrolling.down()) {
        if (this.options.showAtBottom) {
          var bottom = scrolling.atBottom();
          hidden = !bottom;
        } else {
          hidden = true;
        }
      }

      this.change(hidden);
    },

    update: function() {
      this.dHeight = document.body.offsetHeight;
      this.wHeight = window.innerHeight;

      this.previous = this.current;
      this.current = window.pageYOffset;
      this.diff = this.previous - this.current;

      return this;
    }

  };

}(angular);