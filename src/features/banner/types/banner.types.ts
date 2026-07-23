export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  description?: string;

  image: string;
  mobileImage?: string;

  primaryButtonText: string;
  primaryButtonLink: string;

  secondaryButtonText?: string;
  secondaryButtonLink?: string;

  isActive: boolean;
  displayOrder: number;
}