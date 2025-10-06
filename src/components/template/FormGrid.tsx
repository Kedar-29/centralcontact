"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import {
  Pencil,
  Trash2,
  Check,
  X,
  ArrowLeft,
  MoreHorizontal,
  Clipboard,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

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
  const [popupOpenId, setPopupOpenId] = useState<number | null>(null);
  const [modalContent, setModalContent] = useState<"api" | "table" | null>(
    null
  );
  const [copied, setCopied] = useState(false);

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

  // Close popup and modal on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!(e.target instanceof HTMLElement)) return;
      if (
        !e.target.closest(".popup-menu") &&
        !e.target.closest(".modal-content")
      ) {
        setPopupOpenId(null);
        setModalContent(null);
        setCopied(false);
      }
    }
    if (popupOpenId !== null || modalContent !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupOpenId, modalContent]);

  const handleShowMessages = (formId: string) => {
    const path = `/dashboard/applications/${uuid}/forms/${formId}`;
    router.push(new URL(path, window.location.origin).pathname);
  };

  return (
    <>
      <Toaster position="bottom-right" />
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-10 py-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold dark:text-white">Forms</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-1 dark:text-gray-300"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 sm:px-10 pb-10 max-w-7xl mx-auto">
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
                <Card className="cursor-pointer hover:shadow-xl hover:scale-[1.015] transition-all duration-200 ease-in-out group relative dark:bg-gray-800 dark:border dark:border-gray-700">
                  <CardHeader>
                    {editingId === form.id ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="text-sm dark:bg-gray-700 dark:text-white"
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
                          className="dark:text-gray-300"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-medium dark:text-white">
                          {form.title || "Untitled Form"}
                        </CardTitle>
                        <div className="flex gap-2 relative">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(form.id);
                              setEditedTitle(form.title);
                            }}
                            className="dark:text-gray-300"
                            aria-label="Edit form title"
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteForm(form.id)}
                            className="dark:text-gray-300"
                            aria-label="Delete form"
                          >
                            <Trash2 size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (popupOpenId === form.id) {
                                setPopupOpenId(null);
                                setModalContent(null);
                                setCopied(false);
                              } else {
                                setPopupOpenId(form.id);
                                setModalContent(null);
                                setCopied(false);
                              }
                            }}
                            aria-label="More options"
                            className="dark:text-gray-300"
                          >
                            <MoreHorizontal size={20} />
                          </Button>

                          {/* Popup menu */}
                          <AnimatePresence>
                            {popupOpenId === form.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full right-0 mt-2 w-56 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-lg z-50 popup-menu"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setModalContent("api");
                                    setPopupOpenId(null);
                                  }}
                                  className="w-full flex justify-between items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  Show API Endpoint
                                </button>
                                <button
                                  onClick={() => {
                                    setModalContent("table");
                                    setPopupOpenId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  Show Table Details
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
                    className="dark:text-gray-300 flex flex-col gap-2"
                  >
                    {/* Show messages button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowMessages(form.formId);
                      }}
                      className="dark:text-gray-300"
                    >
                      Show Messages
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* Modal for API Endpoint or Table Details */}
      <AnimatePresence>
        {modalContent && (
          <Modal onClose={() => setModalContent(null)}>
            <PopupDetailsModal
              modalContent={modalContent}
              uuid={uuid}
              forms={forms}
              copied={copied}
              onCopy={() => {
                if (!modalContent || forms.length === 0) return;
                // Show API endpoint of the first form matching modalContent is "api"
                // You can modify as needed to show specific form if you track it.
                // For now, let's just demo with the first form.
                const form = forms[0];
                if (!form) return;
                const apiUrl = `/api/${uuid}/${form.formId}`;
                navigator.clipboard.writeText(apiUrl).then(() => {
                  toast.success("Copied to clipboard");
                });
              }}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

// Modal overlay wrapper
function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <Button
          size="sm"
          variant="ghost"
          className="mt-4 w-full"
          onClick={onClose}
        >
          Close
        </Button>
      </motion.div>
    </motion.div>
  );
}

// PopupDetailsModal shows modal content based on type
function PopupDetailsModal({
  modalContent,
  uuid,
  forms,
  copied,
  onCopy,
}: {
  modalContent: "api" | "table";
  uuid: string;
  forms: Form[];
  copied: boolean;
  onCopy: () => void;
}) {
  // Just demo using first form
  const form = forms[0];

  if (!form) return null;

  if (modalContent === "api") {
    const apiEndpoint = `/api/${uuid}/${form.formId}`;
    return (
      <div className="flex flex-col gap-4 font-mono text-sm text-gray-900 dark:text-gray-100">
        <h3 className="text-lg font-semibold">API Endpoint</h3>
        <div className="flex justify-between items-center">
          <code className="break-all">{apiEndpoint}</code>
          <Button
            size="sm"
            variant="outline"
            onClick={onCopy}
            className="flex items-center gap-1"
          >
            {copied ? (
              <>
                <CheckCircle size={16} />
                Copied
              </>
            ) : (
              <>
                <Clipboard size={16} />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (modalContent === "table") {
    const tableDetails = {
      id: form.id,
      formId: form.formId,
      createdAt: new Date().toISOString(),
      fields: [
        { name: "firstName", type: "string" },
        { name: "email", type: "string" },
      ],
    };
    return (
      <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
        <h3 className="text-lg font-semibold mb-2">Table Details</h3>
        <pre className="overflow-auto max-h-64 whitespace-pre-wrap bg-gray-100 dark:bg-gray-700 p-4 rounded">
          {JSON.stringify(tableDetails, null, 2)}
        </pre>
      </div>
    );
  }

  return null;
}
