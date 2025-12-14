import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyB8aaa52bX0xUlFqnNqEPp4xbqnbjy9kE0",
  authDomain: "fermentory-591d2.firebaseapp.com",
  projectId: "fermentory-591d2",
  storageBucket: "fermentory-591d2.firebasestorage.app",
  messagingSenderId: "1052041406304",
  appId: "1:1052041406304:web:614990e454911eb58a6005"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      const token = await getToken(messaging, {
        vapidKey: 'BDEXtOelGQVhZkywjCCGS2jBU5mofv6AVbcdbrXxkx2uWmPtmnFQJmZnFntGKbW5kRUCh5YU6NCNzkGYHUHep94'
      });
      
      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });

export { messaging };
