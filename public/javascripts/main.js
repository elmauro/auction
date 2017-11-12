(function () {
  const module = angular.module('UIApp', ['ui.router', 'btford.socket-io', 'ngStorage'])
    .config([
      '$stateProvider',
      '$urlRouterProvider',
      '$qProvider',
      function($stateProvider, $urlRouterProvider, $qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
        $urlRouterProvider.otherwise('/login');

        $stateProvider

          // HOME STATES AND NESTED VIEWS ========================================
          .state('home', {
            url: '/home',
            templateUrl: 'partials/partial-home.html',
            controller: 'MainController',
            params: { reload: true },
          })

          .state('login', {
            url: '/login',
            templateUrl: 'partials/partial-login.html',
            controller: 'LoginController',
          });
      }
    ]);
}());
