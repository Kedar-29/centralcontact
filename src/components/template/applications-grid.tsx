"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

interface Website {
  uuid: string;
  name: string;
  domain: string;
}

export default function ApplicationGrid() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/websites")
      .then((res) => res.json())
      .then(setWebsites)
      .catch(() => toast.error("Failed to load applications"))
      .finally(() => setLoading(false));
  }, []);

  const deleteWebsite = async (uuid: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`/api/websites/${uuid}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Application deleted");
        setWebsites((prev) => prev.filter((w) => w.uuid !== uuid));
      } else {
        toast.error("Failed to delete application");
      }
    } catch {
      toast.error("Network error deleting application");
    }
  };

  const updateWebsite = async (uuid: string) => {
    if (!editedName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      const res = await fetch(`/api/websites/${uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedName.trim() }),
      });
      if (res.ok) {
        toast.success("Application name updated");
        setWebsites((prev) =>
          prev.map((w) =>
            w.uuid === uuid ? { ...w, name: editedName.trim() } : w
          )
        );
        setEditingId(null);
      } else {
        toast.error("Failed to update application");
      }
    } catch {
      toast.error("Network error updating application");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Select Your Application</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-36 w-full rounded-2xl bg-muted/30 animate-pulse"
              />
            ))
          : websites.map((site, i) => (
              <motion.div
                key={site.uuid}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Card className="rounded-2xl bg-card/90 backdrop-blur p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-transform duration-300 relative">
                  <CardHeader className="flex justify-between items-start p-0 pb-3">
                    {editingId === site.uuid ? (
                      <div className="flex gap-2 items-center w-full">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="text-sm dark:bg-[#303134] dark:text-white"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateWebsite(site.uuid)}
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between w-full items-center">
                        <div
                          className="cursor-pointer flex flex-col gap-1 max-w-xs truncate"
                          onClick={() =>
                            router.push(`/dashboard/applications/${site.uuid}`)
                          }
                        >
                          <CardTitle className="text-lg font-semibold truncate">
                            {site.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground truncate">
                            {site.domain}
                          </p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(site.uuid);
                              setEditedName(site.name);
                            }}
                            aria-label="Edit application name"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteWebsite(site.uuid)}
                            aria-label="Delete application"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-0 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        router.push(`/dashboard/applications/${site.uuid}`)
                      }
                    >
                      View Forms
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>
    </div>
  );
}
