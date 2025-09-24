import { Price } from '@domain/value-objects/Price';

describe('Price Value Object', () => {
  describe('constructor', () => {
    it('should create a valid price within range', () => {
      const price = new Price(25.5);
      expect(price.value).toBe(25.5);
    });

    it('should round to 2 decimal places', () => {
      const price = new Price(25.555);
      expect(price.value).toBe(25.56);
    });

    it('should throw error if price is below minimum', () => {
      expect(() => new Price(4.99)).toThrow('Price must be between 5 and 50');
    });

    it('should throw error if price is above maximum', () => {
      expect(() => new Price(50.01)).toThrow('Price must be between 5 and 50');
    });

    it('should accept boundary values', () => {
      expect(() => new Price(5)).not.toThrow();
      expect(() => new Price(50)).not.toThrow();
    });
  });

  describe('random', () => {
    it('should generate price within valid range', () => {
      const price = Price.random();
      expect(price.value).toBeGreaterThanOrEqual(5);
      expect(price.value).toBeLessThanOrEqual(50);
    });

    it('should generate different prices on multiple calls', () => {
      const prices = Array.from({ length: 10 }, () => Price.random().value);
      const uniquePrices = new Set(prices);
      expect(uniquePrices.size).toBeGreaterThan(1);
    });
  });

  describe('equals', () => {
    it('should return true for equal prices', () => {
      const price1 = new Price(25.5);
      const price2 = new Price(25.5);
      expect(price1.equals(price2)).toBe(true);
    });

    it('should return false for different prices', () => {
      const price1 = new Price(25.5);
      const price2 = new Price(30.0);
      expect(price1.equals(price2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should format price with 2 decimal places', () => {
      const price = new Price(25.5);
      expect(price.toString()).toBe('25.50');
    });

    it('should format whole numbers with .00', () => {
      const price = new Price(25);
      expect(price.toString()).toBe('25.00');
    });
  });

  describe('toJSON', () => {
    it('should return numeric value', () => {
      const price = new Price(25.5);
      expect(price.toJSON()).toBe(25.5);
    });
  });
});
