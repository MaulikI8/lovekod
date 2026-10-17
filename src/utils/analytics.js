/**
 * Conversion Event Tracking Utility for LoveKod.
 * Automatically dispatches events to Google Analytics (dataLayer) and Meta Pixel (fbq).
 */

export const trackEvent = (eventName, params = {}) => {
  // 1. Google Analytics (gtag / dataLayer)
  if (typeof window !== 'undefined') {
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...params });
    } else if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }

    // 2. Meta Pixel (Facebook / Instagram Ads)
    if (typeof window.fbq === 'function') {
      const fbEventMap = {
        view_item: 'ViewContent',
        add_to_cart: 'AddToCart',
        begin_checkout: 'InitiateCheckout',
        purchase: 'Purchase',
      };
      const fbName = fbEventMap[eventName] || 'Custom';
      window.fbq('track', fbName, params);
    }
  }

  // Developer mode logging
  if (import.meta.env?.DEV) {
    console.log(`[Analytics Event] ${eventName}:`, params);
  }
};

export const trackViewItem = (product) => {
  if (!product) return;
  trackEvent('view_item', {
    currency: 'NPR',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.fabricType || 'Kurtha',
      },
    ],
  });
};

export const trackAddToCart = (product, size) => {
  if (!product) return;
  trackEvent('add_to_cart', {
    currency: 'NPR',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_variant: size,
        price: product.price,
        quantity: 1,
      },
    ],
  });
};

export const trackBeginCheckout = (cartItems, total) => {
  trackEvent('begin_checkout', {
    currency: 'NPR',
    value: total,
    num_items: cartItems.length,
    items: cartItems.map((c) => ({
      item_id: c.productId,
      item_name: c.name,
      price: c.price,
      quantity: c.quantity,
    })),
  });
};

export const trackPurchase = (orderId, total, items = []) => {
  trackEvent('purchase', {
    transaction_id: orderId,
    currency: 'NPR',
    value: total,
    items: items.map((i) => ({
      item_id: i.productId || i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });
};
