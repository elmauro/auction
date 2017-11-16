// Load controller
angular.module('UIApp')

  .controller('MainController', [
    '$scope', 'SocketService', '$http', '$location', '$sessionStorage',
    function ($scope, SocketService, $http, $location, $sessionStorage) {
      let self;

      $scope.initValues = () => {
        $scope.showCurrent = false;
        $scope.showMinimum = false;

        $scope.qtyAuction = 0;
        $scope.minBidAuction = 0;
        $scope.bid = 0;
        $scope.selectedIndex = undefined;
        $scope.selectedItem = {};
        $scope.auction = {};

        $scope.errorMessage = undefined;
        $scope.bidErrorMessage = undefined;
        $scope.winningMessage = undefined;

        $scope.date = undefined;
        $scope.userDateConnection = undefined;
      };

      $scope.currentAuction = {};
      $scope.winner = {};

      $scope.date = new Date().getTime();
      $scope.userDateConnection = `${$sessionStorage.username}_${$scope.date}`;

      SocketService.emit('disconnectExistingUser', {
        username: $sessionStorage.username,
        connection: $scope.userDateConnection,
      });

      $scope.init = () => {
        let username;

        if ($scope.user) {
          username = $scope.user.username;
        } else {
          username = $sessionStorage.username;
        }

        $http.get(`http://localhost:8080/api/users/username/${username}`)
          .then((response) => {
            $scope.user = response.data[0];
            $scope.inventory = [
              { name: 'breads', quantity: $scope.user.breads, image: 'images/bread.jpg' },
              { name: 'carrots', quantity: $scope.user.carrots, image: 'images/carrot.png' },
              { name: 'diamond', quantity: $scope.user.diamond, image: 'images/diamond.jpg' }
            ];

            self = $scope;

            SocketService.emit('getCurrentAuction');
          });
      };

      $scope.leave = () => {
        $sessionStorage.username = '';
        $location.path('/');
      };

      $scope.open = (index) => {
        $scope.selectedIndex = index;
        $scope.selectedItem = $scope.inventory[index];
      };

      $scope.close = () => {
        $('#myModal').modal('toggle');
        $scope.errorMessage = undefined;
        $scope.qtyAuction = 0;
        $scope.minBidAuction = 0;
      };

      $scope.startAuction = () => {
        const scope = {};
        scope.currentAuction = {
          seller: $scope.currentAuction.seller,
          user: $scope.user,
        };
        scope.qtyAuction = $scope.qtyAuction;
        scope.selectedItem = $scope.selectedItem;
        scope.minBidAuction = $scope.minBidAuction;

        $scope.auction.user = $scope.user;
        $scope.auction.selectedIndex = $scope.selectedIndex;
        $scope.auction.image = $scope.selectedItem.image;
        $scope.auction.name = $scope.selectedItem.name;
        $scope.auction.quantity = $scope.qtyAuction;
        $scope.auction.winBid = 0;
        $scope.auction.minBid = $scope.minBidAuction;
        $scope.auction.seller = $scope.user.username;
        $scope.auction.time = 90;

        scope.auction = $scope.auction;
        SocketService.emit('Auction', scope);
      };

      SocketService.on('currentAuction', (response) => {
        if (response.valid === true) {
          if (response.currentAuction.seller === $scope.user.username && response.toggle) {
            $scope.close();
          }
          $scope.showMinimum = true;
          $scope.qtyAuction = 0;
          $scope.minBidAuction = 0;

          if (!$scope.currentAuction.seller) {
            $scope.showCurrent = true;
            $scope.showMinimum = true;
          }
          $scope.currentAuction = response.currentAuction;
        } else {
          $scope.errorMessage = response.message;
        }
      });

      $scope.placeBid = () => {
        const scope = {};
        scope.user = $scope.user;
        scope.currentAuction = {
          user: $scope.currentAuction.user,
          seller: $scope.currentAuction.seller,
          minBid: $scope.currentAuction.minBid,
          winBid: $scope.currentAuction.winBid,
        };
        scope.winner = $scope.user;
        scope.winner.bid = $scope.bid;
        scope.bid = $scope.bid;

        SocketService.emit('placeBid', scope);
      };

      SocketService.on('currentBid', (response) => {
        if (response.valid === true) {
          $scope.showMinimum = false;
          $scope.winner = response.winner;
          $scope.currentAuction.winBid = response.winner.bid;
        } else {
          $scope.bidErrorMessage = response.message;
        }
      });

      SocketService.on('counter', (count) => {
        $scope.currentAuction.time = count;

        if (count === 0) {
          $scope.initValues();
          if (!$scope.winner.id) {
            $scope.winner = {};
            $scope.currentAuction = {};
          }
        }
      });

      SocketService.on('winner', (win) => {
        $scope.winner = win;

        if (win.username) {
          $scope.init();

          $scope.winningMessage = `Winning bid ${win.bid} by ${win.username}`;
          let counter = 10;
          const WinnerCountdown = setInterval(() => {
            counter--;

            if (counter === -1) {
              SocketService.emit('clearWinningMessage');
              clearInterval(WinnerCountdown);
            }
          }, 1000);
        }
      });

      SocketService.on('clearMessage', () => {
        $scope.initValues();
        $scope.currentAuction = {};
        $scope.winner = {};
        $scope.winningMessage = undefined;
      });

      SocketService.on('disconnectUser', () => {
        self.leave();
      });

      $scope.initValues();
      $scope.init();
    }
  ]);
