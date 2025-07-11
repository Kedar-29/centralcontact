"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LucideLayoutGrid,
  LucideMessageCircle,
  LucideFileText,
} from "lucide-react";

const links = [
  {
    title: "Applications",
    description: "Manage all your applications",
    icon: <LucideLayoutGrid className="w-6 h-6 text-primary" />,
    href: "/dashboard/applications",
  },
  {
    title: "Messages",
    description: "View all form messages",
    icon: <LucideMessageCircle className="w-6 h-6 text-primary" />,
    href: "/dashboard/messages",
  },
  {
    title: "Forms",
    description: "view dynamic forms",
    icon: <LucideFileText className="w-6 h-6 text-primary" />,
    href: "/dashboard/forms",
  },
];

export default function DashboardQuickLinks() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6">
      {links.map((link) => (
        <Card
          key={link.title}
          role="button"
          onClick={() => router.push(link.href)}
          className={cn(
            "transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] cursor-pointer border border-border"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{link.title}</CardTitle>
            {link.icon}
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{link.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
