import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { websiteId, title, fields } = await req.json();

  if (
    !websiteId ||
    !title ||
    typeof fields !== "object" ||
    Array.isArray(fields)
  ) {
    return NextResponse.json(
      { message: "Missing or invalid fields" },
      { status: 400 }
    );
  }

  const form = await prisma.form.create({
    data: {
      formId: randomUUID(),
      title,
      formSchema: fields, // ✅ use formSchema instead of undefined 'fields'
      websiteId,
    },
  });

  return NextResponse.json(form, { status: 201 });
}

export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get("uuid");

  if (!uuid)
    return NextResponse.json({ message: "Missing UUID" }, { status: 400 });

  const forms = await prisma.form.findMany({
    where: { website: { uuid } },
    select: {
      id: true,
      title: true,
      formId: true,
      formSchema: true,
    },
  });

  return NextResponse.json(forms);
}
