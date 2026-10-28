# Update Stripe Coupon Function

This function updates an existing coupon in Stripe.

## Environment Variables Required
- STRIPE_SECRET_KEY: Your Stripe secret key

## Usage
```http
POST /functions/v1/updateStripeCoupon
Content-Type: application/json
Authorization: Bearer <supabase_access_token>

{
  "couponId": "coupon_id",
  "metadata": {
    "key": "value"
  }
}
```

## Response
```json
{
  "id": "coupon_id",
  "name": "WELCOME20",
  "percent_off": 20,
  "duration": "once",
  "metadata": {
    "key": "value"
  }
}
```
