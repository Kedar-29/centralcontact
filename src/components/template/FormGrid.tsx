"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Form {
  id: number;
  formId: string;
  title: string;
}

export default function FormGrid({ uuid }: { uuid: string }) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/forms?uuid=${uuid}`)
      .then((res) => res.json())
      .then(setForms)
      .catch(() => toast.error("Failed to load forms"))
      .finally(() => setLoading(false));
  }, [uuid]);

  const deleteForm = async (id: number) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Form deleted");
        setForms((prev) => prev.filter((f) => f.id !== id));
      } else {
        toast.error("Failed to delete form");
      }
    } catch {
      toast.error("Network error deleting form");
    }
  };

  const updateTitle = async (id: number) => {
    if (!editedTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    try {
      const res = await fetch(`/api/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editedTitle.trim() }),
      });
      if (res.ok) {
        toast.success("Form updated");
        setForms((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, title: editedTitle.trim() } : f
          )
        );
        setEditingId(null);
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Network error updating form");
    }
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 sm:px-10 py-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-32 w-full rounded-xl bg-muted/30 animate-pulse"
              />
            ))
          : forms.map((form, index) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="cursor-pointer hover:shadow-xl hover:scale-[1.015] transition-all duration-200 ease-in-out group relative">
                  <CardHeader>
                    {editingId === form.id ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => updateTitle(form.id)}
                          variant="default"
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
                        <CardTitle className="text-lg font-medium">
                          {form.title || "Untitled Form"}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(form.id);
                              setEditedTitle(form.title);
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteForm(form.id)}
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
                      router.push(
                        `/dashboard/applications/${uuid}/forms/${form.formId}`
                      )
                    }
                  >
                    <ApiEndpointButton uuid={uuid} formId={form.formId} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>
    </>
  );
}

function ApiEndpointButton({ uuid, formId }: { uuid: string; formId: string }) {
  const [showEndpoint, setShowEndpoint] = useState(false);
  const apiEndpoint = `/api/${uuid}/${formId}`;

  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation(); // Prevent card navigation on button click
          setShowEndpoint((v) => !v);
        }}
      >
        {showEndpoint ? "Hide API Endpoint" : "Show API Endpoint"}
      </Button>
      {showEndpoint && (
        <p className="mt-2 text-xs font-mono text-muted-foreground break-all">
          {apiEndpoint}
        </p>
      )}
    </div>
  );
}
