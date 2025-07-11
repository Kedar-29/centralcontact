"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Message {
  id: number;
  formData: Record<string, unknown>;
  createdAt: string;
}

export default function FormMessagesPage() {
  const { formId } = useParams() as { formId: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId) return;

    fetch(`/api/messages/form/${formId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Failed to load messages");
        }
        return res.json();
      })
      .then(setMessages)
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [formId]);

  // Collect all unique form field keys from all messages
  const allFields = Array.from(
    new Set(messages.flatMap((msg) => Object.keys(msg.formData)))
  );

  if (loading)
    return (
      <p className="p-6 text-center">Loading messages for Form ID: {formId}</p>
    );

  if (error)
    return (
      <p className="p-6 text-center text-red-600">
        Failed to load messages: {error}
      </p>
    );

  if (messages.length === 0)
    return (
      <p className="p-6 text-center">
        No messages found for Form ID: <Badge variant="outline">{formId}</Badge>
      </p>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Messages for Form ID: <Badge variant="outline">{formId}</Badge>
      </h1>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[80px]">ID</TableHead>
              <TableHead className="min-w-[180px]">Submitted At</TableHead>
              {allFields.map((field) => (
                <TableHead key={field} className="min-w-[150px] capitalize">
                  {field}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg) => (
              <TableRow key={msg.id}>
                <TableCell>{msg.id}</TableCell>
                <TableCell>
                  {new Date(msg.createdAt).toLocaleString()}
                </TableCell>
                {allFields.map((field) => (
                  <TableCell key={field}>
                    {msg.formData[field] === null ||
                    msg.formData[field] === undefined
                      ? "—"
                      : typeof msg.formData[field] === "object"
                      ? JSON.stringify(msg.formData[field])
                      : String(msg.formData[field])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
