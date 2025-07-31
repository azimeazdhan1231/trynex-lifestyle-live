
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface Order {
  id: string;
  tracking_id: string;
  customer_name: string;
  total: string;
  created_at: string;
  status: string;
}

export function useOrderNotifications() {
  const [lastOrderCount, setLastOrderCount] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Initialize audio
  useEffect(() => {
    // Create notification sound using Web Audio API
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playNotificationSound = () => {
        // Create a pleasant notification sound
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // First tone - higher pitch
        oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator1.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        
        // Second tone - lower pitch for harmony
        oscillator2.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);
        oscillator2.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator1.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.15);
        
        oscillator2.start(audioContext.currentTime + 0.1);
        oscillator2.stop(audioContext.currentTime + 0.3);
      };
      
      return playNotificationSound;
    };

    const playSound = createNotificationSound();
    audioRef.current = { play: playSound } as any;
  }, []);

  // Fetch orders with real-time polling
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    refetchInterval: 3000, // Check every 3 seconds
    refetchIntervalInBackground: true,
  });

  // Check for new orders
  useEffect(() => {
    if (!isInitialized) {
      setLastOrderCount(orders.length);
      setIsInitialized(true);
      return;
    }

    if (orders.length > lastOrderCount) {
      const newOrdersCount = orders.length - lastOrderCount;
      const latestOrder = orders[0]; // Assuming orders are sorted by creation date

      // Play notification sound
      if (audioRef.current?.play) {
        try {
          audioRef.current.play();
        } catch (error) {
          console.log('Audio play failed:', error);
        }
      }

      // Show toast notification
      toast({
        title: "🔔 নতুন অর্ডার!",
        description: `${newOrdersCount}টি নতুন অর্ডার এসেছে। গ্রাহক: ${latestOrder?.customer_name || 'অজানা'}`,
        duration: 8000,
      });

      // Browser notification (if permission granted)
      if (Notification.permission === 'granted') {
        new Notification('নতুন অর্ডার এসেছে!', {
          body: `গ্রাহক: ${latestOrder?.customer_name || 'অজানা'}\nট্র্যাকিং: ${latestOrder?.tracking_id || 'N/A'}`,
          icon: '/favicon.ico',
          tag: 'new-order',
        });
      }

      setLastOrderCount(orders.length);
    }
  }, [orders, lastOrderCount, isInitialized, toast]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  return {
    orders,
    newOrdersCount: Math.max(0, orders.length - lastOrderCount),
    requestNotificationPermission,
    hasNotificationPermission: Notification.permission === 'granted',
  };
}
