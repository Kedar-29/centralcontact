"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  ColumnDef,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Message {
  id: number;
  formData: Record<string, unknown>;
  createdAt: string;
  form: {
    title: string | null;
    website: { name: string };
  };
}

export default function MessageTable() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(() => toast.error("Failed to fetch messages"))
      .finally(() => setLoading(false));
  }, []);

  const fieldNames = Array.from(
    new Set(messages.flatMap((msg) => Object.keys(msg.formData)))
  );

  const columns: ColumnDef<Message>[] = [
    {
      accessorKey: "form.website.name",
      header: "Application",
      cell: (ctx) => ctx.row.original.form.website.name,
    },
    {
      accessorKey: "form.title",
      header: "Form Title",
      cell: (ctx) => ctx.row.original.form.title ?? "Untitled",
    },
    {
      accessorKey: "createdAt",
      header: "Submitted At",
      cell: (ctx) =>
        new Date(ctx.row.original.createdAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
    ...fieldNames.map((field) => ({
      accessorKey: `formData.${field}`,
      header: field,
      cell: (ctx: {
        row: { original: { formData: { [x: string]: unknown } } };
      }) => ctx.row.original.formData[field] ?? "-",
    })),
  ];

  const table = useReactTable({
    data: messages,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination: { pageSize, pageIndex } },
    manualPagination: false,
  });

  return (
    <Card className="w-full border border-gray-200 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg font-medium">
          📨 Submitted Messages
        </CardTitle>

        {!loading && messages.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-20 h-8">
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
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-500">No messages submitted yet.</p>
        ) : (
          <>
            <ScrollArea className="max-h-[60vh]">
              <Table className="min-w-full divide-y divide-gray-200">
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow
                      key={hg.id}
                      className="bg-gray-50 [&_th]:font-semibold [&_th]:text-left"
                    >
                      {hg.headers.map((header) => (
                        <TableHead key={header.id} className="px-4 py-2">
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
                    <TableRow
                      key={row.id}
                      className="transition hover:bg-gray-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-4 py-2">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </p>
              <div className="flex space-x-2">
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
