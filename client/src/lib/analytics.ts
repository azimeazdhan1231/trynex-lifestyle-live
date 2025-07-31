
import { toast } from "@/hooks/use-toast";

interface SiteSettings {
  [key: string]: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

let isGoogleAnalyticsLoaded = false;
let isFacebookPixelLoaded = false;

export async function loadGoogleAnalyticsFromSettings(): Promise<void> {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) throw new Error('Failed to fetch settings');
    
    const settings: SiteSettings = await response.json();
    const gaId = settings.google_analytics_id;
    
    if (gaId && !isGoogleAnalyticsLoaded) {
      await loadGoogleAnalytics(gaId);
      isGoogleAnalyticsLoaded = true;
    }
  } catch (error) {
    console.error('Failed to load Google Analytics from settings:', error);
  }
}

export async function loadFacebookPixelFromSettings(): Promise<void> {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) throw new Error('Failed to fetch settings');
    
    const settings: SiteSettings = await response.json();
    const pixelId = settings.facebook_pixel_id;
    
    if (pixelId && !isFacebookPixelLoaded) {
      await loadFacebookPixel(pixelId);
      isFacebookPixelLoaded = true;
    }
  } catch (error) {
    console.error('Failed to load Facebook Pixel from settings:', error);
  }
}

function loadGoogleAnalytics(gaId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create the script element for gtag
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      
      script.onload = () => {
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer!.push(args);
        }
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', gaId, {
          page_title: document.title,
          page_location: window.location.href
        });
        
        console.log('Google Analytics loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Analytics script');
        reject(new Error('Failed to load Google Analytics'));
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error setting up Google Analytics:', error);
      reject(error);
    }
  });
}

function loadFacebookPixel(pixelId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Facebook Pixel Code
      !(function(f: any, b, e, v, n?, t?, s?) {
        if (f.fbq) return;
        n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        t.onload = () => {
          console.log('Facebook Pixel loaded successfully');
          resolve();
        };
        t.onerror = () => {
          console.error('Failed to load Facebook Pixel script');
          reject(new Error('Failed to load Facebook Pixel'));
        };
        s = b.getElementsByTagName(e)[0];
        s.parentNode!.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      
      window.fbq!('init', pixelId);
      window.fbq!('track', 'PageView');
    } catch (error) {
      console.error('Error setting up Facebook Pixel:', error);
      reject(error);
    }
  });
}

export async function trackPageView(path: string, title?: string): Promise<void> {
  try {
    // Track with Google Analytics
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path,
        page_title: title || document.title
      });
    }
    
    // Track with Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
    
    // Track in our own analytics
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'page_view',
        page_url: path,
        metadata: { title }
      }),
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

export async function trackEvent(eventName: string, parameters?: Record<string, any>): Promise<void> {
  try {
    // Track with Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, parameters);
    }
    
    // Track with Facebook Pixel
    if (window.fbq) {
      window.fbq('track', eventName, parameters);
    }
    
    // Track in our own analytics
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventName,
        metadata: parameters
      }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

export async function trackProductView(productId: string, productName?: string): Promise<void> {
  await trackEvent('view_item', {
    item_id: productId,
    item_name: productName
  });
  
  // Also track in our database
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'product_view',
        product_id: productId,
        metadata: { product_name: productName }
      }),
    });
  } catch (error) {
    console.error('Failed to track product view in database:', error);
  }
}

export async function trackAddToCart(productId: string, quantity: number, value?: number): Promise<void> {
  await trackEvent('add_to_cart', {
    item_id: productId,
    quantity,
    value
  });
}

export async function trackPurchase(orderId: string, value: number, items: any[]): Promise<void> {
  await trackEvent('purchase', {
    transaction_id: orderId,
    value,
    items
  });
}

// Initialize analytics when the module loads
export async function initializeAnalytics(): Promise<void> {
  try {
    await Promise.all([
      loadGoogleAnalyticsFromSettings(),
      loadFacebookPixelFromSettings()
    ]);
  } catch (error) {
    console.error('Failed to initialize analytics:', error);
  }
}
