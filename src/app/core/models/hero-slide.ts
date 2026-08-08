export interface IHeroSlide {
  id: string;
  image: string;
  imageAlt: string;
  focalPosition: string; // قيمة CSS object-position، مخصصة لكل صورة حسب مكان المنتج فيها
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}
