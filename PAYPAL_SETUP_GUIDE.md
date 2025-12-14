# PayPal Integration Setup Guide

## Overview
Culture Club now has complete PayPal subscription integration ready. Follow these steps to enable real payments.

## Step 1: Create PayPal Developer Account

1. Go to https://developer.paypal.com/
2. Sign in with your PayPal account (or create one)
3. This gives you access to sandbox (testing) and production credentials

## Step 2: Get Sandbox Credentials (For Testing)

1. Go to https://developer.paypal.com/dashboard/
2. Click "Apps & Credentials"
3. Make sure you're in "Sandbox" mode (toggle at top)
4. Under "REST API apps", click "Create App"
5. Name it "Culture Club Sandbox"
6. Copy the **Client ID** and **Secret**

## Step 3: Create Subscription Plan

### Option A: Using PayPal Dashboard (Recommended)
1. Go to https://www.sandbox.paypal.com/ (for testing)
2. Log in with your sandbox business account
3. Go to "Products & Services" → "Subscriptions"
4. Click "Create Plan"
5. Fill in:
   - Product Name: "Culture Club Premium"
   - Billing Cycle: Monthly
   - Price: $9.99
6. Save and copy the **Plan ID** (starts with "P-")

### Option B: Using PayPal API
Run this curl command (replace CLIENT_ID and SECRET):

```bash
# Get access token
ACCESS_TOKEN=$(curl -s https://api-m.sandbox.paypal.com/v1/oauth2/token \
  -u "YOUR_CLIENT_ID:YOUR_SECRET" \
  -d "grant_type=client_credentials" | jq -r .access_token)

# Create product
PRODUCT_ID=$(curl -s https://api-m.sandbox.paypal.com/v1/catalogs/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Culture Club Premium",
    "description": "Monthly subscription to Culture Club Premium features",
    "type": "SERVICE",
    "category": "SOFTWARE"
  }' | jq -r .id)

# Create billing plan
curl -s https://api-m.sandbox.paypal.com/v1/billing/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "product_id": "'$PRODUCT_ID'",
    "name": "Culture Club Premium Monthly",
    "description": "Premium subscription with unlimited projects, posts, recipes, and analytics",
    "billing_cycles": [{
      "frequency": {
        "interval_unit": "MONTH",
        "interval_count": 1
      },
      "tenure_type": "REGULAR",
      "sequence": 1,
      "total_cycles": 0,
      "pricing_scheme": {
        "fixed_price": {
          "value": "9.99",
          "currency_code": "USD"
        }
      }
    }],
    "payment_preferences": {
      "auto_bill_outstanding": true,
      "setup_fee": {
        "value": "0",
        "currency_code": "USD"
      },
      "setup_fee_failure_action": "CONTINUE",
      "payment_failure_threshold": 3
    }
  }'
```

## Step 4: Update Environment Variables

### Backend (.env)
```bash
PAYPAL_CLIENT_ID="YOUR_SANDBOX_CLIENT_ID"
PAYPAL_SECRET="YOUR_SANDBOX_SECRET"
PAYPAL_MODE="sandbox"
PAYPAL_PLAN_ID="YOUR_PLAN_ID"
```

### Frontend (.env)
```bash
REACT_APP_PAYPAL_CLIENT_ID="YOUR_SANDBOX_CLIENT_ID"
REACT_APP_PAYPAL_PLAN_ID="YOUR_PLAN_ID"
```

## Step 5: Test the Integration

1. Restart services:
   ```bash
   sudo supervisorctl restart backend frontend
   ```

2. Go to http://localhost:3000/pricing

3. Click "Upgrade to Premium"

4. You'll see the PayPal button

5. Use PayPal Sandbox Test Account:
   - Email: sb-xxxxx@personal.example.com (from sandbox dashboard)
   - Password: (from sandbox dashboard)

6. Complete payment with fake money

7. Check if user is upgraded:
   ```bash
   mongosh --eval "use('test_database'); db.users.find({}, {_id:0, email:1, subscription_tier:1, is_premium:1})"
   ```

## Step 6: Setup Webhook (Important!)

1. Go to https://developer.paypal.com/dashboard/
2. Click your app
3. Scroll to "Webhooks"
4. Click "Add Webhook"
5. Webhook URL: `https://your-domain.com/api/webhooks/paypal`
6. Select events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`
7. Save

## Step 7: Go Production

When ready for real payments:

1. Get production credentials from https://developer.paypal.com/
2. Switch to "Live" mode in dashboard
3. Create production subscription plan
4. Update .env files:
   ```bash
   PAYPAL_MODE="live"
   PAYPAL_CLIENT_ID="YOUR_LIVE_CLIENT_ID"
   PAYPAL_SECRET="YOUR_LIVE_SECRET"
   PAYPAL_PLAN_ID="YOUR_LIVE_PLAN_ID"
   ```

## Troubleshooting

### PayPal button not showing
- Check browser console for errors
- Verify CLIENT_ID is set in frontend .env
- Make sure services restarted after .env changes

### Payment succeeds but user not upgraded
- Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
- Verify subscription ID is being saved
- Check MongoDB: `db.users.find({email: "your-email"})`

### Webhook not working
- Verify webhook URL is accessible publicly (not localhost)
- Check webhook signature verification (currently disabled for testing)
- View webhook logs in PayPal dashboard

## Security Notes

**For Production:**
1. Verify webhook signatures (currently TODO in code)
2. Verify subscription with PayPal API before activating (currently TODO)
3. Use HTTPS only
4. Keep SECRET in .env, never commit to git
5. Implement proper error handling and retry logic

## Current Status

✅ PayPal SDK integrated
✅ Subscription button component created
✅ Backend endpoints ready
✅ Webhook handler created
✅ Frontend dialog with PayPal button
⚠️ Needs real credentials to work
⚠️ Webhook signature verification needed
⚠️ Subscription verification with PayPal API needed

## Next Steps

1. Get your PayPal credentials
2. Create subscription plan
3. Update .env files
4. Test with sandbox
5. Setup webhook
6. Go live!

---

**Questions?** The integration structure is complete and ready for your credentials!
