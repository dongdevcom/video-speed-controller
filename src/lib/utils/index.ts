export const getSiteId = (): string => {
  const hostname = window.location.hostname;
  return hostname.replaceAll('.', '_');
};

/**
 * Returns a debounced version of `func` that delays invocation by `delay` ms.
 * Repeated calls within the delay window reset the timer.
 */
export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
): ((...args: T) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

/**
 * Convert overlayStyle object to inline CSS string
 */
export const styleObjectToString = (styleObj: Record<string, any>): string => {
  return Object.entries(styleObj)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`)
    .join(';');
};