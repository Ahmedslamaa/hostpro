import { ReservationDetailContent } from "./reservation-detail-content";

export default function ReservationDetailPage({ params }: { params: { id: string } }) {
  return <ReservationDetailContent id={params.id} />;
}
