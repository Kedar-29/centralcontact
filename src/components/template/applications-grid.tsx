"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="px-4 sm:px-10 py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {loading
        ? Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-32 w-full rounded-xl bg-muted/30 animate-pulse"
            />
          ))
        : websites.map((site, i) => (
            <motion.div
              key={site.uuid}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ease-in-out relative">
                <CardHeader>
                  {editingId === site.uuid ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-sm"
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
                    <div className="flex justify-between items-start">
                      <CardTitle
                        className="cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/applications/${site.uuid}`)
                        }
                      >
                        {site.name}
                      </CardTitle>
                      <div className="flex gap-2">
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
                <CardContent
                  onClick={() =>
                    editingId === null &&
                    router.push(`/dashboard/applications/${site.uuid}`)
                  }
                >
                  <p className="text-sm text-muted-foreground truncate">
                    {site.domain}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
    </div>
  );
}
