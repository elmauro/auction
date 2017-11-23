const expect = require('chai').expect;
const logic = require('../controllers/logic');

logic.scope = {};

describe('Bussiness Logic', () => {
  beforeEach((done) => {
    logic.scope.user = {
      id: 'elmauro',
      coins: 1000,
    };

    logic.scope.currentAuction = {
      seller: undefined,
      minBid: 10,
      winBid: 100,
      sellerId: 'elalejo',
    };

    logic.scope.selectedItem = {
      quantity: 30,
    };

    logic.scope.qtyAuction = 10;
    logic.scope.minBidAuction = 100;

    logic.scope.bid = 200;

    done();
  });

  describe('Validate Auction', () => {
    it('validates a new auction', () => {
      const valid = logic.validateAuction();
      expect(valid).to.equal(true);
    });

    it('validates an Auction in progress', () => {
      logic.scope.currentAuction.seller = 'elmauro';
      const valid = logic.validateAuction();
      expect(valid).to.equal(false);
    });

    it('validates max quantity for a new Auction', () => {
      logic.scope.qtyAuction = 40;
      const valid = logic.validateAuction();
      expect(valid).to.equal(false);
    });

    it('validates min quantities for a new Auction', () => {
      logic.scope.qtyAuction = 0;
      logic.scope.minBidAuction = 0;
      const valid = logic.validateAuction();
      expect(valid).to.equal(false);
    });
  });

  describe('Validate Bid', () => {
    it('validates a bid', () => {
      logic.scope.currentAuction.seller = 'elmauro';
      const valid = logic.validateBid();
      expect(valid).to.equal(true);
    });

    it('validates a current Auction for a bid', () => {
      logic.scope.currentAuction.seller = undefined;
      const valid = logic.validateBid();
      expect(valid).to.equal(false);
    });

    it('validates min quantity for a bid', () => {
      logic.scope.currentAuction.seller = 'elmauro';
      logic.scope.bid = 10;
      logic.scope.currentAuction.minBid = 100;
      logic.scope.currentAuction.winBid = 0;
      const valid = logic.validateBid();
      expect(valid).to.equal(false);
    });

    it('validates min quantity for a bid agains win bid', () => {
      logic.scope.currentAuction.seller = 'elmauro';
      logic.scope.bid = 100;
      logic.scope.currentAuction.minBid = 100;
      logic.scope.currentAuction.winBid = 100;
      const valid = logic.validateBid();
      expect(valid).to.equal(false);
    });

    it('validates the same seller', () => {
      logic.scope.user.id = 'elmauro';
      logic.scope.currentAuction.sellerId = 'elmauro';
      logic.scope.currentAuction.seller = 'elmauro';
      const valid = logic.validateBid();
      expect(valid).to.equal(false);
    });

    it('validates the user coins', () => {
      logic.scope.currentAuction.seller = 'elmauro';
      logic.scope.bid = 200;
      logic.scope.user.coins = 30;
      const valid = logic.validateBid();
      expect(valid).to.equal(false);
    });
  });
});
