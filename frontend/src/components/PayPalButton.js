import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { toast } from 'sonner';

export default function PayPalButton({ onSuccess }) {
  const initialOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'test',
    currency: 'USD',
    intent: 'subscription',
  };

  const createSubscription = (data, actions) => {
    return actions.subscription.create({
      plan_id: process.env.REACT_APP_PAYPAL_PLAN_ID || 'P-XXXXXXXXXXXXXXXXXXXX',
    });
  };

  const onApprove = async (data, actions) => {
    try {
      // Call backend to activate subscription
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscription/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subscription_id: data.subscriptionID,
          order_id: data.orderID
        })
      });

      if (response.ok) {
        toast.success('Subscription activated! Welcome to Premium!');
        if (onSuccess) onSuccess();
      } else {
        toast.error('Failed to activate subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('An error occurred');
    }
  };

  const onError = (err) => {
    console.error('PayPal error:', err);
    toast.error('Payment failed. Please try again.');
  };

  const onCancel = () => {
    toast.info('Payment cancelled');
  };

  // If no client ID is set, show setup message
  if (!process.env.REACT_APP_PAYPAL_CLIENT_ID || process.env.REACT_APP_PAYPAL_CLIENT_ID === 'test') {
    return (
      <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
        <p className="text-sm text-muted-foreground mb-2">
          PayPal integration is ready!
        </p>
        <p className="text-xs text-muted-foreground">
          Add your PayPal Client ID to .env to enable payments
        </p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{
          shape: 'pill',
          layout: 'vertical',
          color: 'gold',
          label: 'subscribe'
        }}
        createSubscription={createSubscription}
        onApprove={onApprove}
        onError={onError}
        onCancel={onCancel}
      />
    </PayPalScriptProvider>
  );
}
