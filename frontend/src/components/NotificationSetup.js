import { useState, useEffect } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { requestNotificationPermission, onMessageListener } from '../firebase-config';

export default function NotificationSetup() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    // Listen for foreground messages
    onMessageListener()
      .then((payload) => {
        toast.success(payload.notification.title, {
          description: payload.notification.body
        });
      })
      .catch((err) => console.log('Failed to receive message:', err));

    // Check if user already has notifications enabled
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const user = await response.json();
        setNotificationsEnabled(!!user.fcm_token && user.notifications_enabled !== false);
      }
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        // Save token to backend
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            fcm_token: token,
            notifications_enabled: true
          })
        });

        if (response.ok) {
          setNotificationsEnabled(true);
          setPermission('granted');
          toast.success('Notifications enabled!', {
            description: 'You\'ll receive reminders for your fermentation projects'
          });
        }
      } else {
        toast.error('Failed to enable notifications', {
          description: 'Please allow notifications in your browser settings'
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          notifications_enabled: false
        })
      });

      if (response.ok) {
        setNotificationsEnabled(false);
        toast.success('Notifications disabled');
      }
    } catch (error) {
      toast.error('Failed to disable notifications');
    }
  };

  const handleTestNotification = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/notifications/test`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Test notification sent!', {
          description: 'Check your browser for the notification'
        });
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to send test notification');
      }
    } catch (error) {
      toast.error('Failed to send test notification');
    }
  };

  if (permission === 'denied') {
    return (
      <Card className="p-6 border-destructive/50">
        <div className="flex items-start gap-4">
          <BellOff className="h-8 w-8 text-destructive flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Notifications Blocked</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You've blocked notifications for this site. To enable reminders, please:
            </p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Find "Notifications" and change to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Bell className={`h-8 w-8 flex-shrink-0 mt-1 ${notificationsEnabled ? 'text-ferment-green' : 'text-muted-foreground'}`} />
        <div className="flex-1">
          <h3 className="font-semibold mb-2">Push Notifications</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get browser notifications when it's time to stir, taste, or check your fermentation projects.
          </p>
          
          {notificationsEnabled ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-ferment-green">
                <Check className="h-4 w-4" />
                <span>Notifications are enabled</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleTestNotification}
                  variant="outline"
                  size="sm"
                  data-testid="test-notification-btn"
                >
                  Send Test Notification
                </Button>
                <Button
                  onClick={handleDisableNotifications}
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                >
                  Disable
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleEnableNotifications}
              disabled={loading}
              data-testid="enable-notifications-btn"
              className="bg-ferment-green text-white hover:bg-ferment-green-dark"
            >
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          )}
          
          <p className="text-xs text-muted-foreground mt-4">
            Premium feature • Requires browser notification permission
          </p>
        </div>
      </div>
    </Card>
  );
}
