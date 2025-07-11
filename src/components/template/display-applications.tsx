"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, X } from "lucide-react";
import { motion } from "framer-motion";

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

export default function DisplayApplication() {
  const router = useRouter();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [formsMap, setFormsMap] = useState<Record<number, Form[]>>({});
  const [formName, setFormName] = useState("");
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [editingForms, setEditingForms] = useState<Record<number, boolean>>({});
  const [formTitles, setFormTitles] = useState<Record<number, string>>({});

  const [expandedSections, setExpandedSections] = useState<
    Record<
      number,
      {
        details: boolean;
        addForm: boolean;
        apiDocs: boolean;
      }
    >
  >({});

  const toggleSection = (
    siteId: number,
    section: "details" | "addForm" | "apiDocs"
  ) => {
    setExpandedSections((prev) => ({
      ...prev,
      [siteId]: {
        ...prev[siteId],
        [section]: !prev[siteId]?.[section],
      },
    }));
  };

  const fetchWebsites = async () => {
    const sites = await fetch("/api/websites").then((r) => r.json());
    setWebsites(sites);
    const map: Record<number, Form[]> = {};

    setFormsMap(map);
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("📋 Copied to clipboard");
  };

  const buildJsonFromFields = () => {
    const json: Record<string, string> = {};
    fieldNames.forEach((field) => (json[field] = "string"));
    return json;
  };

  const addForm = async (siteId: number) => {
    if (!formName.trim()) return toast.error("❗ Please enter a form name");
    if (fieldNames.length === 0)
      return toast.error("❗ Please add at least one field");

    const payload = {
      websiteId: siteId,
      title: formName.trim(),
      fields: buildJsonFromFields(),
    };

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
    } else {
      const error = await res.json();
      toast.error(error.message || "❌ Error adding form");
    }
  };

  const startEditing = (formId: number, currentTitle: string) => {
    setEditingForms((prev) => ({ ...prev, [formId]: true }));
    setFormTitles((prev) => ({ ...prev, [formId]: currentTitle }));
  };

  const stopEditing = (formId: number) => {
    setEditingForms((prev) => ({ ...prev, [formId]: false }));
  };

  const handleTitleChange = (formId: number, value: string) => {
    setFormTitles((prev) => ({ ...prev, [formId]: value }));
  };

  const editForm = async (formId: number) => {
    const res = await fetch(`/api/forms/${formId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: formTitles[formId] }),
    });
    if (res.ok) {
      toast.success("✅ Form title updated");
      stopEditing(formId);
      fetchWebsites();
    } else {
      toast.error("❌ Failed to update form");
    }
  };

  const deleteForm = async (formId: number) => {
    if (!confirm("Delete this form?")) return;
    const res = await fetch(`/api/forms/${formId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("🗑️ Form deleted!");
      fetchWebsites();
    } else {
      toast.error("❌ Failed to delete form");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {websites.map((site, i) => (
        <motion.div
          key={site.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="shadow-lg rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all">
            <CardHeader>
              <CardTitle>{site.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{site.domain}</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button onClick={() => toggleSection(site.id, "details")}>
                  Details
                </Button>
                <Button onClick={() => toggleSection(site.id, "addForm")}>
                  Add Form
                </Button>
                <Button onClick={() => toggleSection(site.id, "apiDocs")}>
                  API Docs
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push(`/dashboard/applications/${site.uuid}`);
                    toast.success("🚀 Redirected to application dashboard");
                  }}
                >
                  View Forms
                </Button>
              </div>

              {expandedSections[site.id]?.details && (
                <div className="mt-4 text-sm space-y-2">
                  <p>
                    <strong>UUID:</strong> {site.uuid}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copy(site.uuid)}
                      className="ml-2"
                    >
                      <Copy size={16} />
                    </Button>
                  </p>
                  <p>
                    <strong>App Key:</strong> {site.appKey}
                  </p>
                  <p>
                    <strong>Secret Key:</strong> {site.secretKey}
                  </p>
                </div>
              )}

              {expandedSections[site.id]?.addForm && (
                <div className="mt-4 space-y-2">
                  <Input
                    placeholder="Form Name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="New field name"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const trimmed = newFieldName.trim();
                          if (!trimmed)
                            return toast.error("❗ Field name cannot be empty");
                          if (fieldNames.includes(trimmed))
                            return toast.error("❗ Field already added");
                          setFieldNames((prev) => [...prev, trimmed]);
                          setNewFieldName("");
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const trimmed = newFieldName.trim();
                        if (!trimmed)
                          return toast.error("❗ Field name cannot be empty");
                        if (fieldNames.includes(trimmed))
                          return toast.error("❗ Field already added");
                        setFieldNames((prev) => [...prev, trimmed]);
                        setNewFieldName("");
                      }}
                    >
                      Add Field
                    </Button>
                  </div>
                  {fieldNames.length > 0 && (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {fieldNames.map((f) => (
                          <span
                            key={f}
                            className="bg-muted px-2 py-1 rounded text-sm flex items-center"
                          >
                            {f}
                            <X
                              className="ml-1 cursor-pointer"
                              onClick={() =>
                                setFieldNames(fieldNames.filter((x) => x !== f))
                              }
                            />
                          </span>
                        ))}
                      </div>
                      <pre className="bg-muted p-2 rounded font-mono text-sm">
                        {JSON.stringify(buildJsonFromFields(), null, 2)}
                      </pre>
                    </>
                  )}
                  <Button onClick={() => addForm(site.id)}>Save Form</Button>
                </div>
              )}

              {expandedSections[site.id]?.apiDocs && (
                <div className="mt-6 text-sm space-y-4 border rounded-lg p-4 bg-muted shadow-inner">
                  <h3 className="text-lg font-semibold text-primary">
                    📌 API Endpoint
                  </h3>
                  <div className="flex items-center justify-between bg-background p-2 rounded border">
                    <code className="text-sm break-all">
                      /api/{site.uuid}/
                      <span className="italic text-muted-foreground">
                        :formId
                      </span>
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copy(`/api/${site.uuid}/:formId`)}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>

                  <h3 className="text-lg font-semibold text-primary">
                    💡 Example
                  </h3>
                  <div className="relative bg-background border rounded-lg p-4 shadow-sm">
                    <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                      {`async function submitForm(formId: string, data: any) {
  const res = await fetch(\`${process.env.NEXT_PUBLIC_BASE_URL}/api/${site.uuid}/\${formId}\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer ${site.secretKey}",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}`}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copy(`async function submitForm(formId: string, data: any) {
                            const res = await fetch(\`${process.env.NEXT_PUBLIC_BASE_URL}/api/${site.uuid}/\${formId}\`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer ${site.secretKey}",
                              },
                              body: JSON.stringify(data),
                            });
                            return res.json();
                          }`)
                      }
                      className="absolute top-2 right-2"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4">
                {formsMap[site.id]?.map((form) => {
                  const isEditing = editingForms[form.id] || false;
                  const titleValue = formTitles[form.id] ?? form.title;
                  return (
                    <div
                      key={form.formId}
                      className="flex flex-col bg-muted rounded p-2 mb-2"
                    >
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Input
                            value={titleValue}
                            onChange={(e) =>
                              handleTitleChange(form.id, e.target.value)
                            }
                          />
                          <Button size="sm" onClick={() => editForm(form.id)}>
                            ✅
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => stopEditing(form.id)}
                          >
                            ❌
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{form.title}</span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  copy(`/api/${site.uuid}/${form.formId}`)
                                }
                              >
                                <Copy size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  startEditing(form.id, form.title)
                                }
                              >
                                ✏️
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteForm(form.id)}
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                          <div className="ml-2 mt-1 text-sm text-muted-foreground space-y-1">
                            {Object.entries(form.fields || {}).map(
                              ([field, type]) => (
                                <div key={field}>
                                  <span className="font-medium">{field}</span>:{" "}
                                  <code>{type}</code>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
