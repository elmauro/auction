angular.module('UIApp')
.directive('widget1', function() {
    return {
      templateUrl: 'partials/partial-stats.html'
    };
});

angular.module('UIApp')
.directive('widget2', function() {
    return {
        templateUrl: 'partials/partial-inventory.html'
    };
});

angular.module('UIApp')
.directive('widget3', function() {
    return {
        templateUrl: 'partials/partial-auction.html'
    };
});

angular.module('UIApp')
.directive('modalDialog', function() {
    return {
        templateUrl: 'partials/partial-dialog.html'
    };
});