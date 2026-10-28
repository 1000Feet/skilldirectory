// This is a mock implementation for testing until the backend is ready
// Supported codes: SD20 (20% off) and SD50 (50% off)

export async function mockValidateCoupon(code: string): Promise<{
  valid: boolean;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  error?: string;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Case insensitive validation
  const normalizedCode = code.trim().toUpperCase();
  
  // Predefined valid promo codes
  const validCodes: Record<string, { type: 'percentage' | 'fixed'; value: number }> = {
    'SD20': { type: 'percentage', value: 20 },
    'SD50': { type: 'percentage', value: 50 }
  };
  
  if (validCodes[normalizedCode]) {
    return {
      valid: true,
      discount: validCodes[normalizedCode]
    };
  }
  
  return {
    valid: false,
    error: 'Invalid promo code. Please try another one.'
  };
}
