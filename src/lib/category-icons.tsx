import type { ReactElement, SVGProps } from "react";
import { Droplets, LayoutGrid, Warehouse } from "lucide-react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "ref">;

export function getCategoryIconElement(
  slug: string,
  props?: IconProps
): ReactElement {
  switch (slug) {
    case "sanitary-ware":
      return <Droplets {...props} />;
    case "tiles":
      return <LayoutGrid {...props} />;
    case "building-materials":
      return <Warehouse {...props} />;
    default:
      return <LayoutGrid {...props} />;
  }
}