"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
      cell: (ctx: CellContext<Message, unknown>) =>
        ctx.row.original.form.website.name,
    },
    {
      accessorKey: "form.title",
      header: "Form Title",
      cell: (ctx: CellContext<Message, unknown>) =>
        ctx.row.original.form.title ?? "Untitled",
    },
    {
      accessorKey: "createdAt",
      header: "Submitted At",
      cell: (ctx: CellContext<Message, unknown>) =>
        new Date(ctx.row.original.createdAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
    ...fieldNames.map((field) => ({
      accessorKey: `formData.${field}`,
      header: field,
      cell: (ctx: CellContext<Message, unknown>) => {
        const val = ctx.row.original.formData[field];
        if (val === null || val === undefined) return "-";
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
    state: { pagination: { pageSize, pageIndex } },
    manualPagination: false,
  });

  return (
    <div className="w-full py-8 px-[96px] bg-white dark:bg-[#1A1A1A] rounded-md">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-[#F0F0F0]">
          Your All Messages
        </h1>

        <Button
          variant="outline"
          className="text-sm px-4 py-1.5 dark:text-[#F0F0F0] hover:bg-neutral-800"
          onClick={() => router.push("/dashboard")}
        >
          ← Back
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <h2 className="text-base font-medium text-neutral-500 dark:text-neutral-400">
          Messages
        </h2>

        {!loading && messages.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Rows per page:
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-[72px] h-8 text-sm dark:bg-[#1A1A1A] dark:text-[#F0F0F0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top" className="dark:bg-[#1A1A1A]">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem
                    key={size}
                    value={String(size)}
                    className="dark:text-[#F0F0F0] dark:hover:bg-neutral-800"
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-full bg-gray-300 dark:bg-[#333]" />
          <Skeleton className="h-6 w-full bg-gray-300 dark:bg-[#333]" />
          <Skeleton className="h-6 w-full bg-gray-300 dark:bg-[#333]" />
        </div>
      ) : messages.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No messages submitted yet.
        </p>
      ) : (
        <>
          <ScrollArea className="max-h-[60vh] rounded-md">
            <Table className="border border-gray-300 dark:border-neutral-700 rounded-md overflow-hidden">
              <TableHeader className="dark:bg-[#1A1A1A]">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="px-6 text-neutral-600 dark:text-neutral-400 border-none"
                      >
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
                    className="bg-white dark:bg-[#1A1A1A] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-6 text-sm text-black dark:text-[#F0F0F0] border-none"
                      >
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-sm dark:text-[#F0F0F0] hover:bg-neutral-800"
                onClick={() => setPageIndex((i) => Math.max(i - 1, 0))}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-sm dark:text-[#F0F0F0] hover:bg-neutral-800"
                onClick={() => setPageIndex((i) => i + 1)}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
