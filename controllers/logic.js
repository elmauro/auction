const logic = { };
logic.scope = { };

logic.validateAuction = () => {
  if (logic.scope.currentAuction.seller) {
    logic.scope.errorMessage = 'There is an auction in progress!';
    return false;
  }

  if (logic.scope.qtyAuction > logic.scope.selectedItem.quantity) {
    logic.scope.errorMessage = 'The quantity can’t be greater than the available item quantity!';
    return false;
  }

  if (logic.scope.qtyAuction <= 0 || logic.scope.minBidAuction <= 0) {
    logic.scope.errorMessage = 'The values must be greater that 0!';
    return false;
  }

  return true;
};

logic.validateBid = () => {
  if (!logic.scope.currentAuction.seller) {
    logic.scope.bidErrorMessage = 'There is not an auction in progress!';
    return false;
  }

  if (logic.scope.bid < logic.scope.currentAuction.minBid && logic.scope.currentAuction.winBid === 0) {
    logic.scope.bidErrorMessage = 'The bid value must be  at least equal to the minimum bid!';
    return false;
  }

  if (logic.scope.bid <= logic.scope.currentAuction.winBid) {
    logic.scope.bidErrorMessage = 'The bid value must always be higher than the current winning bid!';
    return false;
  }

  if (logic.scope.user.username === logic.scope.currentAuction.seller) {
    logic.scope.bidErrorMessage = 'No, you are the same seller!';
    return false;
  }

  if (logic.scope.bid > logic.scope.user.coins) {
    logic.scope.bidErrorMessage = 'You must to have more coins!';
    return false;
  }

  logic.scope.bidErrorMessage = undefined;
  return true;
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = logic;
}
