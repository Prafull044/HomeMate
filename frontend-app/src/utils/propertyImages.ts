export const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85', // Modern cozy bedroom
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=85', // Bright apartment living room
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=85', // Stylish furnished flat
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85', // Sunlit luxury room
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85', // Warm wooden floor apartment
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85', // Minimalist studio apartment
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85', // Aesthetic living workspace
];

export function getPropertyImage(roomId?: string, customImage?: string | null): string {
  if (customImage && customImage.trim().length > 0) {
    if (customImage.startsWith('http')) return customImage;
    return `${customImage.startsWith('/') ? customImage : `/${customImage}`}`;
  }
  if (!roomId) return PROPERTY_IMAGES[0];
  let hash = 0;
  for (let i = 0; i < roomId.length; i++) {
    hash = roomId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PROPERTY_IMAGES.length;
  return PROPERTY_IMAGES[index];
}
