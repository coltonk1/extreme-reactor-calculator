import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://er2.coltonkaraffa.com/',
      lastModified: new Date(),
    },
    {
      url: 'https://er2.coltonkaraffa.com/calculator',
      lastModified: new Date(),
    },
  ];
}
