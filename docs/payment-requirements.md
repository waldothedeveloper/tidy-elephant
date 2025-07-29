# Payment Transaction Requirements

## Just the essentials since Stripe handles the heavy lifting

- `transactionID` - Your internal ID
- `bookingID` - References the booking
- `stripePaymentIntentID` - Stripe's payment intent ID
- `stripeChargeID` - Stripe's charge ID (when captured)
- `amount` - Amount in cents
- `type` - Enum: ["payment", "refund", "chargeback"]
- `status` - Enum: ["pending", "succeeded", "failed", "canceled"] (mirrors Stripe status)
- `createdAt` - When you created the record
- `updatedAt` - Last sync with Stripe
