import { redirect } from "next/navigation";

export default function PasarParcelPage({ params }: { params: { parcelId: string } }) {
  const parcelId = decodeURIComponent(params.parcelId || "").trim();
  if (parcelId) {
    redirect(`/screener?lahan=${encodeURIComponent(parcelId)}`);
  }
  redirect("/screener");
}
