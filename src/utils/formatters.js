/**
 * Helper & Formatter utilities extracted from CUBROD bundle
 */

export const formatNumber = (num) => {
  return new Intl.NumberFormat('th-TH').format(num || 0);
};

export const maskPhone = (phone) => {
  if (!phone) return '';
  return `${phone.slice(0, 2)}X-XXX-${phone.slice(-4)}`;
};

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const getCarImages = (car) => {
  if (!car) return [];
  if (car.imageUrls?.length) return car.imageUrls;
  if (car.imageUrl) return [car.imageUrl];
  return [];
};

export const getCarPhotoStyle = (car) => {
  const images = getCarImages(car);
  if (images[0]) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(5,23,44,.05), rgba(5,23,44,.35)), url("${images[0]}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: car.tone || 'linear-gradient(135deg, #0c2d55, #2875bd)' };
};

export const getActivePublicCars = (cars = []) => {
  return cars.filter(
    (car) => car.status === 'active' && car.moderationStatus !== 'hidden' && car.publicVisible !== false
  );
};

export const getCarDedupeKey = (car) => {
  const norm = (s) => s?.trim().toLocaleLowerCase('th') || '';
  const brand = norm(car.brand || car.title?.split(' ')[0]);
  const model = norm(car.model);
  if (!brand || !model || !car.year) return '';
  return [brand, model, car.year, norm(car.transmission), norm(car.fuel)].join('|');
};

export const getBestPriceCars = (cars = []) => {
  const map = new Map();
  getActivePublicCars(cars).forEach((car) => {
    const key = getCarDedupeKey(car);
    if (key) {
      map.set(key, [...(map.get(key) || []), car]);
    }
  });

  return Array.from(map.values())
    .filter((group) => group.length > 1)
    .map((group) => [...group].sort((a, b) => a.price - b.price)[0]);
};
