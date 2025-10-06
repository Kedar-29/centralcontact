"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LucideLayoutGrid,
  LucideMessageCircle,
  LucideFileText,
} from "lucide-react";
import { motion } from "framer-motion";

const links = [
  {
    title: "Applications",
    description: "Manage all your applications",
    icon: LucideLayoutGrid,
    href: "/dashboard/applications",
  },
  {
    title: "Messages",
    description: "View all form messages",
    icon: LucideMessageCircle,
    href: "/dashboard/messages",
  },
  {
    title: "Forms",
    description: "View and manage dynamic forms",
    icon: LucideFileText,
    href: "/dashboard/forms",
  },
];

export default function DashboardQuickLinks() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl"
    >
      {links.map((link, i) => {
        const Icon = link.icon;
        return (
          <motion.div
            key={link.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card
              role="button"
              onClick={() => router.push(link.href)}
              className={cn(
                "group rounded-2xl border border-gray-200 bg-card/90 backdrop-blur p-4",
                "transition-all duration-300 ease-in-out cursor-pointer shadow-sm",
                "hover:shadow-lg hover:-translate-y-1 hover:bg-white"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between p-0 pb-3">
                <CardTitle className="text-lg font-semibold">
                  {link.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition">
                  <Icon className="w-5 h-5" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
