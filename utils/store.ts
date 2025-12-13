
import { StoreProduct, StoreConfig } from '../types';

export const storeUtils = {
  // Calculate final price based on model and rate
  calculatePrice: (product: StoreProduct, config: StoreConfig): number => {
    if (product.priceModel === 'dollar_based') {
      return Math.ceil(product.basePrice * config.dollarRate);
    }
    return product.basePrice;
  },

  // Format price (e.g. 50,000 Toman)
  formatPrice: (amount: number, currency: string = 'IRT'): string => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' ' + (currency === 'IRT' ? 'تومان' : currency);
  },

  // Generate Product Schema for SEO
  generateProductSchema: (product: StoreProduct, config: StoreConfig, siteName: string) => {
    const finalPrice = storeUtils.calculatePrice(product, config);
    const currency = config.currency === 'IRT' ? 'IRR' : config.currency; // Schema prefers IRR usually if mostly Toman
    const priceValue = config.currency === 'IRT' ? finalPrice * 10 : finalPrice; // Convert to IRR for schema standard if needed

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title,
      "image": product.featuredImage || [],
      "description": product.metaDescription || product.excerpt,
      "sku": product.sku,
      "brand": {
        "@type": "Brand",
        "name": siteName
      },
      "offers": {
        "@type": "Offer",
        "url": typeof window !== 'undefined' ? window.location.href : '',
        "priceCurrency": "IRR", 
        "price": priceValue,
        "availability": product.stock > 0 && product.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    };
  }
};
