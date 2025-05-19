import { AutotaskRegion } from '../types';

const REGION_URLS: Record<AutotaskRegion, string> = {
  NA: 'https://webservices.autotask.net/atservicesrest/v1.0',
  EU: 'https://webservices2.autotask.net/atservicesrest/v1.0',
  AU: 'https://webservices3.autotask.net/atservicesrest/v1.0',
  UK: 'https://webservices4.autotask.net/atservicesrest/v1.0',
  CN: 'https://webservices5.autotask.net/atservicesrest/v1.0',
};

export function getApiUrl(region: AutotaskRegion): string {
  return REGION_URLS[region] || REGION_URLS['NA'];
} 