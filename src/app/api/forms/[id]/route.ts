import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await context.params;
  const id = parseInt(idStr);
  if (isNaN(id)) return NextResponse.json({ message: "Invalid id" }, { status: 400 });

  try {
    // Step 1: Delete related messages
    await prisma.message.deleteMany({
      where: { formId: id },
    });

    // Step 2: Delete the form
    await prisma.form.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error) {
    console.error("Form delete failed:", error);
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await context.params;
  const { title } = await req.json();
  const id = parseInt(idStr);
  if (isNaN(id) || !title) return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  await prisma.form.update({ where: { id }, data: { title } });
  return NextResponse.json({ message: "Updated" }, { status: 200 });
}
