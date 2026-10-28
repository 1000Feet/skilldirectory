/**
 * This file contains utilities to mock Stripe functionality for testing purposes
 */

// Mock function to simulate Stripe.js elements update with discount
export function mockStripeElementsUpdate(elements: any, amount: number): Promise<void> {
  console.log('Updating Stripe Elements with amount:', amount);
  
  // This is a mock function that doesn't actually do anything
  // In a real implementation, this would update the Stripe Elements UI
  return Promise.resolve();
}

// Mock function to check if we're in a testing environment
export function isTestingEnvironment(): boolean {
  return !window.location.href.includes('skilldirectory.com');
}
