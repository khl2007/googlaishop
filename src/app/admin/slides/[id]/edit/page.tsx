
import { getSlideById } from "@/lib/data";
import { SlideForm } from "@/components/admin/slide-form";
import { notFound } from "next/navigation";

export default async function EditSlidePage({ params: { id } }: { params: { id: string } }) {
  const slide = await getSlideById(id);

  if (!slide) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Slide</h1>
      <SlideForm slide={slide} />
    </div>
  );
}
