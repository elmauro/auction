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
      };

      $scope.startAuction = () => {
        if ($scope.validateAuction()) {
          $scope.close();
          $scope.showMinimum = true;
          $scope.auction.selectedIndex = $scope.selectedIndex;
          $scope.auction.image = $scope.selectedItem.image;
          $scope.auction.name = $scope.selectedItem.name;
          $scope.auction.quantity = $scope.qtyAuction;
          $scope.auction.winBid = 0;
          $scope.auction.minBid = $scope.minBidAuction;
          $scope.auction.sellerId = $scope.user.id;
          $scope.auction.seller = $scope.user.username;
          $scope.auction.time = 90;

          $scope.qtyAuction = 0;
          $scope.minBidAuction = 0;
          SocketService.emit('Auction', $scope.auction);
        }
      };

      $scope.validateAuction = () => {
        if ($scope.currentAuction.seller) {
          $scope.errorMessage = 'There is an auction in progress!';
          return false;
        }

        if ($scope.qtyAuction > $scope.selectedItem.quantity) {
          $scope.errorMessage = 'The quantity can’t be greater than the available item quantity!';
          return false;
        }

        if ($scope.qtyAuction <= 0 || $scope.minBidAuction <= 0) {
          $scope.errorMessage = 'The values must be greater that 0!';
          return false;
        }

        return true;
      }

      $scope.placeBid = () => {
        if ($scope.validateBid()) {
          $scope.winner.id = $scope.user.id;
          $scope.winner.username = $scope.user.username;
          $scope.winner.bid = $scope.bid;
          SocketService.emit('placeBid', $scope.winner);
        }
      };

      $scope.validateBid = () => {
        if (!$scope.currentAuction.seller) {
          $scope.bidErrorMessage = 'There is not an auction in progress!';
          return false;
        }

        if ($scope.bid < $scope.currentAuction.minBid && $scope.currentAuction.winBid === 0) {
          $scope.bidErrorMessage = 'The bid value must be  at least equal to the minimum bid!';
          return false;
        }

        if ($scope.bid <= $scope.currentAuction.winBid) {
          $scope.bidErrorMessage = 'The bid value must always be higher than the current winning bid!';
          return false;
        }

        if ($scope.user.id === $scope.currentAuction.sellerId) {
          $scope.bidErrorMessage = 'No, you are the same seller!';
          return false;
        }

        if ($scope.bid > $scope.user.coins) {
          $scope.bidErrorMessage = 'You must to have more coins!';
          return false;
        }

        $scope.bidErrorMessage = undefined;
        return true;
      };

      $scope.updateSeller = () => {
        const name = $scope.currentAuction.name;
        const quantity = $scope.currentAuction.quantity;

        $http({
          method: 'PUT',
          url: `/api/users/${$scope.user.id}`,
          data: {
            username: $scope.user.username,
            coins: $scope.user.coins + $scope.winner.bid,
            breads: name === 'breads' ? $scope.user.breads - quantity : $scope.user.breads,
            carrots: name === 'carrots' ? $scope.user.carrots - quantity : $scope.user.carrots,
            diamond: name === 'diamond' ? $scope.user.diamond - quantity : $scope.user.diamond,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(() => {
          $scope.init();
        });
      };

      $scope.updateUser = () => {
        const name = $scope.currentAuction.name;
        const quantity = $scope.currentAuction.quantity;

        $http({
          method: 'PUT',
          url: `/api/users/${$scope.user.id}`,
          data: {
            username: $scope.user.username,
            coins: $scope.user.coins - $scope.winner.bid,
            breads: name === 'breads' ? $scope.user.breads + quantity : $scope.user.breads,
            carrots: name === 'carrots' ? $scope.user.carrots + quantity : $scope.user.carrots,
            diamond: name === 'diamond' ? $scope.user.diamond + quantity : $scope.user.diamond,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(() => {
          $scope.init();
        });
      };

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

      SocketService.on('currentAuction', (currentAuction) => {
        if (!$scope.currentAuction.seller) { 
          $scope.showCurrent = true;
          $scope.showMinimum = true;
        }
        $scope.currentAuction = currentAuction;
      });

      SocketService.on('currentBid', (winner) => {
        $scope.showMinimum = false;
        $scope.winner = winner;
        $scope.currentAuction.winBid = winner.bid;
      });

      SocketService.on('winner', (win) => {
        $scope.winner = win;

        if (win.username) {
          if ($scope.user.id === $scope.currentAuction.sellerId) {
            $scope.updateSeller();
          }

          if ($scope.user.id === $scope.winner.id) {
            $scope.updateUser();
          }

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
