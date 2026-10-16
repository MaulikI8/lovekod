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
export function getWhatsAppLink(product, phone = '9779800000000') {
  const cleanPhone = String(phone).replace(/[^\d]/g, '');
  const text = encodeURIComponent(
    `Namaste LoveKod! I would like to inquire about "${product.name}" (Rs. ${product.price.toLocaleString()}) for Tihar. Is it available in stock?`
  );
  return `https://wa.me/${cleanPhone}?text=${text}`;
}
