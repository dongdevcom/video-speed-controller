export interface SiteRate {
  rate: number;
}

export interface ConfigData {
  delta: number;
  key: {
    decrease: string;
    increase: string;
    reset: string;
  };
  lang: string;
  rates: Record<string, SiteRate>;
}
