"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ColumnDef,
  CellContext,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface Message {
  id: number;
  formData: Record<string, unknown>;
  createdAt: string;
}

export default function FormMessagesPage() {
  const { formId } = useParams() as { formId: string };
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (!formId) return;

    setLoading(true);
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

  const allFields = Array.from(
    new Set(messages.flatMap((msg) => Object.keys(msg.formData)))
  );

  const columns: ColumnDef<Message>[] = [
    {
      accessorKey: "createdAt",
      header: "Submitted At",
      cell: (info: CellContext<Message, unknown>) =>
        new Date(info.getValue() as string).toLocaleString(),
    },
    ...allFields.map((field) => ({
      id: field,
      header: field,
      cell: (info: CellContext<Message, unknown>) => {
        const val = info.row.original.formData[field];
        if (val === null || val === undefined) return "—";
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
      },
    })),
  ];

  const table = useReactTable({
    data: messages,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    manualPagination: false,
  });

  if (loading)
    return (
      <div className="py-6 px-4 sm:px-10 max-w-7xl mx-auto">
        <p className="text-center">Loading messages for Form ID: {formId}</p>
      </div>
    );

  if (error)
    return (
      <div className="py-6 px-4 sm:px-10 max-w-7xl mx-auto">
        <p className="text-center text-red-600">
          Failed to load messages: {error}
        </p>
      </div>
    );

  if (messages.length === 0)
    return (
      <div className="py-6 px-4 sm:px-10 max-w-7xl mx-auto">
        <p className="text-center">
          No messages found for Form ID:{" "}
          <Badge variant="outline">{formId}</Badge>
        </p>
      </div>
    );

  return (
    <div className="py-6 px-4 sm:px-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Messages for Form: <Badge variant="outline">{formId}</Badge>
        </h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-1"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-[72px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-gray-300 dark:border-neutral-700 overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPageIndex((i) => Math.max(i - 1, 0))}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPageIndex((i) => i + 1)}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
