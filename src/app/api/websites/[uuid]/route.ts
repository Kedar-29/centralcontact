import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ uuid: string }> }
): Promise<NextResponse> {
  const params = await context.params;
  const uuid = params.uuid;

  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const updated = await prisma.website.update({
      where: { uuid },
      data: { name },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: "Failed to update website" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ uuid: string }> }
): Promise<NextResponse> {
  const params = await context.params;
  const uuid = params.uuid;

  try {
    const website = await prisma.website.findUnique({
      where: { uuid },
      select: { id: true },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    await prisma.message.deleteMany({
      where: { form: { websiteId: website.id } },
    });

    await prisma.form.deleteMany({
      where: { websiteId: website.id },
    });

    await prisma.website.delete({ where: { uuid } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Failed to delete website" }, { status: 500 });
  }
}
