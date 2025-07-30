// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Facebook Pixel Integration
export const initFacebookPixel = (pixelId: string) => {
  if (!pixelId) {
    console.warn('Missing Facebook Pixel ID');
    return;
  }

  const script = document.createElement('script');
  script.textContent = `
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

  // Add noscript fallback
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1">`;
  document.head.appendChild(noscript);
};

// Track Facebook Pixel events
export const trackFBEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, parameters);
  }
};

// E-commerce tracking functions
export const trackPurchase = (orderId: string, value: number, currency: string = 'BDT') => {
  // Google Analytics
  trackEvent('purchase', 'ecommerce', orderId, value);
  
  // Facebook Pixel
  trackFBEvent('Purchase', {
    value: value,
    currency: currency,
    content_ids: [orderId],
    content_type: 'product'
  });
};

export const trackAddToCart = (productId: string, productName: string, value: number) => {
  // Google Analytics
  trackEvent('add_to_cart', 'ecommerce', productName, value);
  
  // Facebook Pixel
  trackFBEvent('AddToCart', {
    value: value,
    currency: 'BDT',
    content_ids: [productId],
    content_name: productName,
    content_type: 'product'
  });
};

export const trackProductView = (productId: string, productName: string, category: string) => {
  // Google Analytics
  trackEvent('view_item', 'ecommerce', productName);
  
  // Facebook Pixel
  trackFBEvent('ViewContent', {
    content_ids: [productId],
    content_name: productName,
    content_category: category,
    content_type: 'product'
  });
};

export const trackInitiateCheckout = (value: number, numItems: number) => {
  // Google Analytics
  trackEvent('begin_checkout', 'ecommerce', 'checkout_started', value);
  
  // Facebook Pixel
  trackFBEvent('InitiateCheckout', {
    value: value,
    currency: 'BDT',
    num_items: numItems,
    content_type: 'product'
  });
};