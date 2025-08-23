"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, X, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Website {
  id: number;
  uuid: string;
  name: string;
  domain: string;
  appKey: string;
  secretKey: string;
}

interface Form {
  id: number;
  formId: string;
  title: string;
  fields: Record<string, string>;
}

type ActiveSection = "details" | "addForm" | "apiDocs" | null;

export default function DisplayApplication() {
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [formsMap, setFormsMap] = useState<Record<number, Form[]>>({});
  const [activeSiteId, setActiveSiteId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [hasMounted, setHasMounted] = useState(false); // hydration guard

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [formName, setFormName] = useState("");
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  const [newFieldName, setNewFieldName] = useState("");

  const modalRef = useRef<HTMLDivElement | null>(null);

  const fetchWebsites = async () => {
    const sites: Website[] = await fetch("/api/websites").then((r) => r.json());
    setWebsites(sites);
    const map: Record<number, Form[]> = {};
    for (const site of sites) {
      const res = await fetch(`/api/forms?websiteId=${site.id}`);
      map[site.id] = res.ok ? await res.json() : [];
    }
    setFormsMap(map);
  };

  useEffect(() => {
    setHasMounted(true);
    fetchWebsites();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openMenuId !== null &&
        menuRefs.current[openMenuId] &&
        !menuRefs.current[openMenuId]?.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    }
    function onEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }
    if (activeSection !== null) {
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("keydown", onEsc);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [activeSection]);

  const openModal = (siteId: number, section: ActiveSection) => {
    setActiveSiteId(siteId);
    setActiveSection(section);
    setOpenMenuId(null);
    toast(`🟢 Opened ${section} modal`);
  };

  const closeModal = () => {
    setActiveSection(null);
    setActiveSiteId(null);
    setFormName("");
    setFieldNames([]);
    setNewFieldName("");
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("📋 Copied to clipboard");
  };

  const buildJsonFromFields = (): Record<string, string> => {
    const json: Record<string, string> = {};
    fieldNames.forEach((field) => (json[field] = "string"));
    return json;
  };

  const addForm = async () => {
    if (activeSiteId === null) return;
    if (!formName.trim()) {
      toast.error("❗ Please enter a form name");
      return;
    }
    if (fieldNames.length === 0) {
      toast.error("❗ Please add at least one field");
      return;
    }

    toast("⏳ Adding form...");

    const payload = {
      websiteId: activeSiteId,
      title: formName.trim(),
      fields: buildJsonFromFields(),
    };

    try {
      const res = await fetch("/api/forms/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("✅ Form added successfully!");
        setFormName("");
        setFieldNames([]);
        setNewFieldName("");
        fetchWebsites();
        closeModal();
      } else {
        const error = await res.json();
        toast.error(error.message || "❌ Error adding form");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("❌ Network error while adding form");
    }
  };

  const activeSite =
    activeSiteId !== null ? websites.find((w) => w.id === activeSiteId) : null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const exampleCode =
    activeSite &&
    `async function submitForm(formId: string, data: Record<string, unknown>) {
  const res = await fetch("${baseUrl}/api/${activeSite.uuid}/" + formId, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${activeSite.secretKey}",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}`;

  if (!hasMounted) return null; // ⛔️ Prevent hydration mismatch

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold dark:text-white">
          Your Applications
        </h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          ← Back
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {websites.map((site, i) => (
          <motion.div
            key={site.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="relative shadow-md rounded-xl hover:shadow-xl hover:scale-[1.02] transition-transform duration-300 cursor-default dark:bg-gray-800 dark:border dark:border-gray-700 p-4">
              <CardHeader className="flex justify-between items-center p-0">
                <div className="pr-4">
                  <CardTitle className="text-lg font-semibold dark:text-white mb-1">
                    {site.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    {site.domain}
                  </p>
                </div>
                <div
                  className="relative"
                  ref={(el) => {
                    menuRefs.current[site.id] = el;
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setOpenMenuId((prev) =>
                        prev === site.id ? null : site.id
                      )
                    }
                    aria-label="Open options menu"
                    className="dark:text-gray-300"
                  >
                    <MoreHorizontal size={20} />
                  </Button>

                  <AnimatePresence>
                    {openMenuId === site.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border z-50 dark:bg-gray-900 dark:border-gray-700"
                      >
                        {["details", "addForm", "apiDocs"].map((section) => (
                          <button
                            key={section}
                            onClick={() =>
                              openModal(site.id, section as ActiveSection)
                            }
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-accent dark:hover:bg-gray-700 dark:text-gray-300"
                          >
                            {section === "details"
                              ? "Details"
                              : section === "addForm"
                              ? "Add Form"
                              : "API Docs"}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            router.push(`/dashboard/applications/${site.uuid}`);
                            toast.success(
                              "🚀 Redirected to application dashboard"
                            );
                            setOpenMenuId(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-accent dark:hover:bg-gray-700 dark:text-gray-300"
                        >
                          View Forms
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal Overlay & Content */}
      <AnimatePresence>
        {activeSection && activeSite && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black backdrop-blur-sm z-40"
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 max-w-lg w-full -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 dark:border dark:border-gray-700"
              ref={modalRef}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold capitalize dark:text-white">
                  {activeSection}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="dark:text-gray-300"
                >
                  <X size={20} />
                </Button>
              </div>

              {activeSection === "details" && (
                <div className="text-sm space-y-4 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <strong>UUID:</strong> {activeSite.uuid}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copy(activeSite.uuid)}
                      className="dark:text-gray-300"
                    >
                      <Copy size={16} />
                    </Button>
                  </p>
                  <p>
                    <strong>App Key:</strong> {activeSite.appKey}
                  </p>
                  <p>
                    <strong>Secret Key:</strong> {activeSite.secretKey}
                  </p>

                  <div>
                    <ul className="ml-5 list-disc max-h-48 overflow-auto">
                      {(formsMap[activeSite.id] ?? []).map((form) => (
                        <li key={form.id}>{form.title}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeSection === "addForm" && (
                <div className="space-y-6">
                  <Input
                    placeholder="Form Name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="dark:bg-gray-700 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="New field name"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const trimmed = newFieldName.trim();
                          if (!trimmed || fieldNames.includes(trimmed)) return;
                          setFieldNames((prev) => [...prev, trimmed]);
                          setNewFieldName("");
                        }
                      }}
                      className="dark:bg-gray-700 dark:text-white"
                    />
                    <Button
                      onClick={() => {
                        const trimmed = newFieldName.trim();
                        if (!trimmed || fieldNames.includes(trimmed)) return;
                        setFieldNames((prev) => [...prev, trimmed]);
                        setNewFieldName("");
                      }}
                    >
                      Add Field
                    </Button>
                  </div>
                  {fieldNames.length > 0 && (
                    <>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-auto">
                        {fieldNames.map((f) => (
                          <span
                            key={f}
                            className="bg-muted px-2 py-1 rounded text-sm flex items-center dark:bg-gray-700 dark:text-white"
                          >
                            {f}
                            <X
                              className="ml-1 cursor-pointer"
                              onClick={() =>
                                setFieldNames((prev) =>
                                  prev.filter((x) => x !== f)
                                )
                              }
                            />
                          </span>
                        ))}
                      </div>
                      <pre className="bg-muted p-3 rounded font-mono text-sm max-h-32 overflow-auto dark:bg-gray-700 dark:text-white">
                        {JSON.stringify(buildJsonFromFields(), null, 2)}
                      </pre>
                    </>
                  )}
                  <Button onClick={addForm}>Save Form</Button>
                </div>
              )}

              {activeSection === "apiDocs" && activeSite && (
                <div className="text-sm space-y-6 border rounded-lg p-4 bg-muted shadow-inner max-h-60 overflow-auto dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-primary dark:text-white">
                    📌 API Endpoint
                  </h3>
                  <div className="flex items-center justify-between bg-background p-3 rounded border dark:bg-gray-800 dark:border-gray-600">
                    <code className="text-sm break-all">
                      /api/{activeSite.uuid}/
                      <span className="italic text-muted-foreground dark:text-gray-400">
                        :formId
                      </span>
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copy(`/api/${activeSite.uuid}/:formId`)}
                      className="dark:text-gray-300"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                  <h3 className="text-lg font-semibold text-primary dark:text-white">
                    💡 Example
                  </h3>
                  <div className="relative bg-background border rounded-lg p-4 shadow-sm max-h-60 overflow-auto dark:bg-gray-800 dark:border-gray-600">
                    <pre className="text-xs whitespace-pre-wrap text-muted-foreground dark:text-gray-400">
                      {exampleCode}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copy(exampleCode || "")}
                      className="absolute top-2 right-2 dark:text-gray-300"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
