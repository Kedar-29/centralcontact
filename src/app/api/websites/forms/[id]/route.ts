// src/app/api/websites/[id]/forms/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Parse the URL to extract the 'id' param from the pathname
  const url = new URL(req.url);
  // The pathname looks like: /api/websites/123/forms
  // Split the pathname by '/' and get the website ID from the right segment
  const segments = url.pathname.split("/"); // ['', 'api', 'websites', '123', 'forms']
  const websiteId = parseInt(segments[3]);

  if (isNaN(websiteId)) {
    return NextResponse.json({ message: "Invalid website ID" }, { status: 400 });
  }

  try {
    const forms = await prisma.form.findMany({
      where: { websiteId },
      select: {
        id: true,
        formId: true,
        title: true,
      },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { message: "Failed to fetch forms" },
      { status: 500 }
    );
  }
}
