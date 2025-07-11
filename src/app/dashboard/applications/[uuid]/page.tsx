import FormGrid from "@/components/template/FormGrid";

export default async function FormsPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Forms for Application</h1>
      <FormGrid uuid={uuid} />
    </div>
  );
}
