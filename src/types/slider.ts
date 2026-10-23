export interface HeroSlide {
  id: string;
  slug: string;
  title: string;
  badge: string;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  description: string;
  bgImage: string;
  cardImage: string;
  cardTag: string;
  highlightTag: string;
  version: string;
  cardDescription: string;
  order?: number;
  isActive?: boolean;
  createdAt?: any;
  updatedAt?: any;
}
