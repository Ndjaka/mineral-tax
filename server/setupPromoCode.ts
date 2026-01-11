import { getStripeClient } from './stripeClient';

export async function setupPromoCode() {
  try {
    const stripe = await getStripeClient();
    
    // First, check if promotion code LANCEMENT20 already exists
    const existingPromoCodes = await stripe.promotionCodes.list({ limit: 100 });
    const existingPromo = existingPromoCodes.data.find(p => p.code === 'LANCEMENT20');
    
    if (existingPromo) {
      console.log('[Stripe] Promotion code LANCEMENT20 is active');
      console.log(`[Stripe] Times redeemed: ${existingPromo.times_redeemed}/${existingPromo.max_redemptions || 'unlimited'}`);
      return;
    }
    
    // Check if coupon exists
    let couponId: string | null = null;
    try {
      const existingCoupons = await stripe.coupons.list({ limit: 100 });
      const existingCoupon = existingCoupons.data.find(c => c.name === 'LANCEMENT20' || c.id === 'LANCEMENT20_COUPON');
      
      if (existingCoupon) {
        couponId = existingCoupon.id;
        console.log(`[Stripe] Found coupon: ${couponId}`);
      } else {
        // Create coupon
        const coupon = await stripe.coupons.create({
          percent_off: 20,
          duration: 'forever',
          name: 'LANCEMENT20',
          id: 'LANCEMENT20_COUPON',
        });
        couponId = coupon.id;
        console.log('[Stripe] Created coupon LANCEMENT20 with 20% off');
      }
    } catch (couponError: any) {
      console.log('[Stripe] Coupon error:', couponError.message);
    }

    if (!couponId) {
      console.log('[Stripe] No coupon ID available, cannot create promotion code');
      return;
    }

    // Try to create promotion code using stripe SDK
    try {
      const promoCode = await (stripe.promotionCodes as any).create({
        coupon: couponId,
        code: 'LANCEMENT20',
        max_redemptions: 5,
      });
      console.log('[Stripe] Created promotion code LANCEMENT20 (limited to 5 uses)');
      console.log(`[Stripe] Promotion code ID: ${promoCode.id}`);
      return;
    } catch (sdkError: any) {
      console.log('[Stripe] SDK error:', sdkError.message);
    }

    // If SDK fails, provide manual instructions
    console.log('');
    console.log('[Stripe] ⚠️  Please create the promotion code manually:');
    console.log('[Stripe] 1. Go to Stripe Dashboard > Products > Coupons');
    console.log('[Stripe] 2. Find coupon "LANCEMENT20" and click on it');
    console.log('[Stripe] 3. Create a promotion code with:');
    console.log('[Stripe]    - Code: LANCEMENT20');
    console.log('[Stripe]    - Limit to 5 redemptions total');
    console.log('');
    
  } catch (error: any) {
    console.error('[Stripe] Setup error:', error.message);
  }
}
