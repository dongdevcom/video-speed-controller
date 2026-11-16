const defaultPrecision = 3;

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
): ((...args: T) => void) & { flush: () => void; cancel: () => void } => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: T | undefined;
  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };
  const flush = () => {
    const args = pending;
    cancel();
    if (args) func(...args);
  };
  const debounced = (...args: T) => {
    clearTimeout(timer);
    pending = args;
    timer = setTimeout(flush, delay);
  };
  return Object.assign(debounced, { flush, cancel });
};

/**
 * Convert overlayStyle object to inline CSS string
 */
export const styleObjectToString = (styleObj: Record<string, any>): string => {
  return Object.entries(styleObj)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`)
    .join(';');
};

export const round = (value: number, precision: number = defaultPrecision): number => {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
};

export const formatRate = (rate: number, precision: number = defaultPrecision): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: precision
  }).format(rate);
};
