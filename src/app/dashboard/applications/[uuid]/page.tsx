import FormGrid from "@/app/components/template/FormGrid";

export default async function FormsPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;

  return (
    <div className="p-6">
      <FormGrid uuid={uuid} />
    </div>
  );
}
