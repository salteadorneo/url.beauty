export type Request = {
  ip: string;
  city: string;
  country: string;
  country_name: string;
  latitude: number;
  longitude: number;
  time: Date;
  userAgent: string;
  referer: string;
};

export type ValueProps = {
  path: string;
  count: number;
  requests: Request[];
};
