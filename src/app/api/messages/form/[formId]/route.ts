import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


// `context.params` must be awaited!
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ formId: string }> }
) {
  const { formId } = await context.params; // ✅ Await params

  try {
    if (!formId) {
      return NextResponse.json(
        { message: "Form ID is required." },
        { status: 400 }
      );
    }

    const form = await prisma.form.findUnique({
      where: { formId },
      select: { id: true },
    });

    if (!form) {
      return NextResponse.json(
        { message: "Form not found." },
        { status: 404 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        formId: form.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { message: "Failed to fetch messages." },
      { status: 500 }
    );
  }
}
