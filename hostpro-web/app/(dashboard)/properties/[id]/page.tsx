import { PropertyDetailContent } from "./property-detail-content";

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  return <PropertyDetailContent id={params.id} />;
}
