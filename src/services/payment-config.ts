import { MembershipType } from "@/lib/auth-types";

// Membership prices and IDs for easy reference throughout the app
export const MEMBERSHIP_PRODUCTS = {
  basic: {
    amount: 0,       // $0.00 (free)
    priceId: 'price_1Qxp1X2ef3wsxdNewIs5Ewzl'
  },
  standard: {
    amount: 1900,    // $19.00
    priceId: 'price_1RHKoY2ef3wsxdNeoNN5iTmM'
  },
  premium: {
    amount: 4900,    // $49.00
    priceId: 'price_1RHKp42ef3wsxdNeAWZG9i4N'
  }
};

// Display names for membership types
export const MEMBERSHIP_NAMES = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium"
};

// Display prices for membership types
export const MEMBERSHIP_PRICES = {
  basic: "$0.00",
  standard: "$19.00",
  premium: "$49.00"
};

// Get the amount in cents for a given membership type
export function getMembershipAmount(membershipType: MembershipType): number {
  return MEMBERSHIP_PRODUCTS[membershipType]?.amount || 0;
}
