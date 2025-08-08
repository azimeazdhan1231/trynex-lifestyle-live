// Google Analytics functions
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (typeof window !== 'undefined' && measurementId) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    const gtag = (...args: any[]) => {
      window.dataLayer.push(args);
    };
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', measurementId);
  }
};

export const trackEvent = (eventName: string, category?: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Facebook Pixel tracking
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, {
      content_category: category,
      content_name: label,
      value: value
    });
  }
};

export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_path: path,
    });
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// Facebook Pixel functions
export const loadFacebookPixel = (pixelId: string) => {
  if (typeof window === 'undefined' || !pixelId || window.fbq) return;

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
};

export const loadFacebookPixelFromSettings = async () => {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      console.log('No settings available, skipping Facebook Pixel');
      return;
    }

    const settings = await response.json();

    // Check for Facebook Pixel ID in various possible keys
    const pixelId = settings.facebook_pixel_id || settings.fb_pixel_id || settings.fbPixelId;

    if (pixelId && pixelId.trim()) {
      console.log('Loading Facebook Pixel with ID:', pixelId);
      loadFacebookPixel(pixelId.trim());
    } else {
      console.log('No Facebook Pixel ID found in settings');
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('Facebook Pixel loading was cancelled');
    } else {
      console.warn('Failed to load Facebook Pixel from settings:', error);
    }
  }
};

// E-commerce tracking functions for compatibility
export const trackAddToCart = (productId: string, productName: string, price: number) => {
  trackEvent('add_to_cart', 'ecommerce', productName, price);
};

export const trackInitiateCheckout = (value: number, numItems?: number) => {
  trackEvent('begin_checkout', 'ecommerce', 'checkout_started', value);
};

export const trackProductView = (productId: string, productName: string, category?: string) => {
  trackEvent('view_item', 'ecommerce', productName);
};

export const trackPurchase = (value: number, transactionId: string) => {
  trackEvent('purchase', 'ecommerce', transactionId, value);
};

// Declare global types
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: any;
  }
}