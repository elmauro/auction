// Load controller
angular.module('UIApp')

  .controller('LoginController', [
    '$scope', 'SocketService', '$http', '$location', '$sessionStorage',
    function($scope, SocketService, $http, $location, $sessionStorage) {
      $scope.login = () => {
        $http.get(`http://localhost:8080/api/users/username/${$scope.username}`)
          .then((response) => {
            if (response.data.length > 0) {
              $sessionStorage.username = $scope.username;
              $location.path('/home');
            } else {
              $http({
                method: 'POST',
                url: '/api/users',
                data: {
                  username: $scope.username,
                  coins: 1000,
                  breads: 30,
                  carrots: 18,
                  diamond: 1,
                },
                headers: {
                  'Content-Type': 'application/json',
                },
              }).then((_response) => {
                if (_response.data.id) {
                  $scope.login();
                }
              }).catch((error) => {
                console.log(error);
              });
            }
          }).catch((error) => {
            console.log(error);
          });
      };
    }
  ]);
