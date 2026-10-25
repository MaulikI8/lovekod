/**
 * Shared formatting utilities for LoveKod atelier.
 * Keeps price, discount, and WhatsApp link logic DRY across Home, ProductDetail, and Cart.
 */

/**
 * Format a numeric price in Nepali Rupees with locale separators.
 * @param {number} price
 * @returns {string} e.g. "Rs. 2,999"
 */
export function formatPrice(price) {
  if (price == null || isNaN(price)) return '';
  return `Rs. ${Number(price).toLocaleString()}`;
}

/**
 * Compute the percentage discount between original and sale price.
 * @param {number} originalPrice
 * @param {number} salePrice
 * @returns {number} Rounded integer percentage, or 0 if invalid.
 */
export function calcDiscount(originalPrice, salePrice) {
  if (!originalPrice || originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Build a low-stock note string from a product's sizes map.
 * @param {Record<string, number>} sizes e.g. { S: 5, M: 1, L: 0, XL: 2 }
 * @returns {string} e.g. "1 left in M · 2 left in XL" or empty string
 */
export function buildLowStockNote(sizes) {
  if (!sizes) return '';
  return Object.entries(sizes)
    .filter(([, count]) => count > 0 && count <= 2)
    .map(([sz, count]) => `${count} left in ${sz}`)
    .join(' · ');
}

/**
 * Generate a WhatsApp inquiry link for a product.
 * @param {object} product Product object with name and price.
 * @param {string} phone Raw phone number (digits only).
 * @returns {string} Full wa.me URL
 */
export function getWhatsAppLink(product, phone = '9779717567133') {
  if (!product) return `https://wa.me/${phone}`;
  const cleanPhone = String(phone).replace(/[^\d]/g, '');
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://lovekod.com';
  const productUrl = `${origin}/product/${product.id || ''}`;
  const rawImg = product.image || '/images/kurtha-charcoal.jpg';
  const imgUrl = rawImg.startsWith('http') ? rawImg : `${origin}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
  const priceText = product.price ? `Rs. ${Number(product.price).toLocaleString()}` : '';

  const text = encodeURIComponent(
    `Namaste LoveKod! 🙏\nI would like to inquire about this outfit:\n\n` +
    `🛍️ Product: ${product.name}\n` +
    (priceText ? `💰 Price: ${priceText}\n` : '') +
    `🔗 Product Link: ${productUrl}\n` +
    `🖼️ Photo Preview: ${imgUrl}\n\n` +
    `Is this currently available in stock for Tihar?`
  );
  return `https://wa.me/${cleanPhone}?text=${text}`;
}
