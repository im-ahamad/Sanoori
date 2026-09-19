/**
 * Cache tags used across the app.
 *
 * Revalidation tags give admin mutations a single handle to invalidate public
 * (and admin) pages whose data they touch. `revalidateTag(PRODUCTS_CACHE_TAG)`
 * is called from every product/image mutation so the public catalogue never
 * serves stale product data indefinitely.
 */
export const PRODUCTS_CACHE_TAG = "products";