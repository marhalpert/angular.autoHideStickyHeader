!function() {
  'use strict';

  angular.module('angular.autoHideStickyHeader', [])
    .directive('autoHideStickyHeader', ['$window', directive]);


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

      var handle = throttle(angular.bind(scrolling, scrolling.handle), 250);
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


  function Scrolling(options, change /* (boolean) => void */) {
    this.options = options;
    this.change = change;

    this.dHeight = 0;
    this.wHeight = 0;
    this.current = 0;
    this.previous = 0;
    this.diff = 0;
  }

  angular.extend(Scrolling.prototype, {

    atBottom: function() /* boolean */ {
      return (this.current + this.wHeight) >= this.dHeight;
    },

    down: function() /* boolean */ {
      return this.diff < 0;
    },

    handle: function() /* void */ {
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

    update: function() /* Scrolling */ {
      this.dHeight = document.body.offsetHeight;
      this.wHeight = window.innerHeight;

      this.previous = this.current;
      this.current = window.pageYOffset;
      this.diff = this.previous - this.current;

      return this;
    }

  });


  function throttle(func /* () => void */, threshold /* number */) /* () => void */ {
    var timer, previous = +new Date();
    return function() {
      function execute() {
        func.apply(this, arguments);
        previous = current;
      }

      var fn = execute.bind(this, arguments);

      var current = +new Date();
      if (current > (previous + threshold)) {
        fn();
      } else {
        clearTimeout(timer);
        timer = setTimeout(fn, threshold);
      }
    }
  }

}(angular);