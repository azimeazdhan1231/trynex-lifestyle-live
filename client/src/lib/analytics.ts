// Analytics utilities for the e-commerce store
import { insertAnalyticsSchema, type SiteSettings } from "@shared/schema";

// Settings cache
let cachedSettings: Record<string, string> = {};

// Load settings from server
export async function loadSettings(): Promise<Record<string, string>> {
  try {
    if (Object.keys(cachedSettings).length === 0) {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings: SiteSettings[] = await response.json();
        cachedSettings = settings.reduce((acc, setting) => {
          acc[setting.key] = setting.value || '';
          return acc;
        }, {} as Record<string, string>);
      }
    }
    return cachedSettings;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {};
  }
}

// Facebook Pixel integration
declare global {
  interface Window {
    fbq: any;
  }
}

export async function loadFacebookPixelFromSettings(): Promise<void> {
  try {
    const settings = await loadSettings();
    const pixelId = settings['facebook_pixel_id'];

    if (pixelId && pixelId.trim()) {
      // Load Facebook Pixel script
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);

      // Also add noscript fallback
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
      document.head.appendChild(noscript);
    }
  } catch (error) {
    console.error('Failed to load Facebook Pixel:', error);
  }
}

// Google Analytics integration
declare global {
  interface Window {
    gtag: any;
    dataLayer: any[];
  }
}

export async function loadGoogleAnalyticsFromSettings(): Promise<void> {
  try {
    const settings = await loadSettings();
    const gaId = settings['google_analytics_id'];

    if (gaId && gaId.trim()) {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };

      // Configure GA
      window.gtag('js', new Date());
      window.gtag('config', gaId);

      // Load GA script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);
    }
  } catch (error) {
    console.error('Failed to load Google Analytics:', error);
  }
}

// Initialize all analytics
export async function initializeAnalytics(): Promise<void> {
  await Promise.all([
    loadFacebookPixelFromSettings(),
    loadGoogleAnalyticsFromSettings()
  ]);
}

// Track page view
export async function trackPageView(url: string): Promise<void> {
  try {
    // Track in our database
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'page_view',
        page_url: url,
        user_agent: navigator.userAgent,
        session_id: getSessionId(),
      }),
    });

    // Track with Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }

    // Track with Google Analytics
    if (window.gtag) {
      window.gtag('config', await getGoogleAnalyticsId(), {
        page_path: url,
      });
    }
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

// Track custom event
export async function trackEvent(eventType: string, metadata?: any): Promise<void> {
  try {
    // Track in our database
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        page_url: window.location.pathname,
        user_agent: navigator.userAgent,
        session_id: getSessionId(),
        metadata,
      }),
    });

    // Track with Facebook Pixel
    if (window.fbq) {
      window.fbq('track', eventType, metadata);
    }

    // Track with Google Analytics
    if (window.gtag) {
      window.gtag('event', eventType, metadata);
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// Utility functions
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

async function getGoogleAnalyticsId(): Promise<string> {
  const settings = await loadSettings();
  return settings['google_analytics_id'] || '';
}

// Specific tracking functions
export function trackProductView(productId: string, productName: string): void {
  trackEvent('ViewContent', {
    content_type: 'product',
    content_ids: [productId],
    content_name: productName,
  });
}

export function trackAddToCart(productId: string, productName: string, price: number): void {
  trackEvent('AddToCart', {
    content_type: 'product',
    content_ids: [productId],
    content_name: productName,
    value: price,
    currency: 'BDT',
  });
}

export function trackPurchase(orderId: string, value: number, items: any[]): void {
  trackEvent('Purchase', {
    transaction_id: orderId,
    value: value,
    currency: 'BDT',
    items: items,
  });
}

export function trackSearch(searchTerm: string): void {
  trackEvent('Search', {
    search_term: searchTerm,
  });
}