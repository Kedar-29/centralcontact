// app/api/website/route.ts

import { NextRequest, NextResponse } from "next/server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";


function generateKey(length: number) {
  return randomUUID().replace(/-/g, "").slice(0, length);
}

export async function POST(req: NextRequest) {
  try {
    const { name, domain } = await req.json();

    if (!name || !domain) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.website.findUnique({ where: { domain } });
    if (existing) {
      return NextResponse.json({ message: "Domain already exists" }, { status: 409 });
    }

    const website = await prisma.website.create({
      data: {
        uuid: randomUUID(),
        name,
        domain,
        appKey: generateKey(16),
        secretKey: generateKey(32),
      },
    });

    return NextResponse.json(website, { status: 201 });
  } catch (error) {
    console.error("Failed to add application:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


// GET - Fetch all websites
export async function GET() {
  const websites = await prisma.website.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(websites);
}
