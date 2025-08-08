import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackPageView, trackEvent as analyticsTrackEvent } from '../lib/analytics';

export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);

  useEffect(() => {
    if (location !== prevLocationRef.current) {
      trackPageView(location);
      prevLocationRef.current = location;
    }
  }, [location]);

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    analyticsTrackEvent(eventName, properties?.category, properties?.label, properties?.value);
  };

  return {
    trackEvent
  };
};