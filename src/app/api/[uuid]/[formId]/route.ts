import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// CORS preflight handler
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ uuid: string; formId: string }> }
) {
  // Await params before use (Next.js 13+ requirement)
  const params = await context.params;
  const { uuid, formId } = params;

  const authHeader = req.headers.get("authorization");
  const originHeader = req.headers.get("origin");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!originHeader) {
    return NextResponse.json({ message: "Missing Origin header" }, { status: 400 });
  }

  // Extract token and origin domain
  const secretKey = authHeader.split(" ")[1];
  const originDomain = new URL(originHeader).hostname;

  try {
    // Find website by UUID and secretKey
    const website = await prisma.website.findFirst({
      where: {
        uuid,
        secretKey,
      },
    });

    if (!website) {
      return NextResponse.json({ message: "Invalid secret key or UUID" }, { status: 403 });
    }

    // Check if origin domain matches website.domain
    // Since your website.domain in DB might be stored as "localhost" or "localhost:3001"
    // we allow match on hostname or hostname + port by comparing originHeader with domain

    // You said not to change schema, so let's normalize domain from DB:
    // If website.domain has protocol or port, normalize it for comparison
    let normalizedDomain: string;
    try {
      normalizedDomain = new URL(
        website.domain.startsWith("http") ? website.domain : `http://${website.domain}`
      ).hostname;
    } catch {
      normalizedDomain = website.domain;
    }

    if (normalizedDomain !== originDomain) {
      return NextResponse.json(
        { message: `Forbidden: Origin domain mismatch (${originDomain} != ${normalizedDomain})` },
        { status: 403 }
      );
    }

    // Find form by formId and websiteId
    // Note: formId is unique string UUID in your schema
    const form = await prisma.form.findFirst({
      where: {
        websiteId: website.id,
        formId,
      },
    });

    if (!form) {
      return NextResponse.json({ message: "Form not found" }, { status: 404 });
    }

    // Parse body JSON
    const body = await req.json();

    // Save the message
    const message = await prisma.message.create({
      data: {
        formData: body,
        form: {
          connect: { id: form.id },
        },
      },
    });

    return NextResponse.json(message, {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": originHeader,
      },
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
