"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RentalDTO, ReturnResponse, ReturnError } from "@/lib/films";
import { createColumns } from "./columns";
import { toast } from "sonner";

interface RentalsDataTableProps {
  rentals: RentalDTO[];
}

export function RentalsDataTable({ rentals }: RentalsDataTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [returningItems, setReturningItems] = React.useState<Set<number>>(new Set());

  const handleReturn = async (copieId: string, locationId: number) => {
    setReturningItems(prev => new Set(prev).add(locationId));

    try {
      const response = await fetch('/api/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ copieId }),
      });

      const data: ReturnResponse | ReturnError = await response.json();

      if (data.success) {
        const successData = data as ReturnResponse;
        toast.success(successData.message, {
          description: successData.penalite && successData.penalite > 0 
            ? `Penalty applied: $${successData.penalite}`
            : "Film returned successfully",
        });
        
        // Refresh the page to update the rentals list
        router.refresh();
      } else {
        const errorData = data as ReturnError;
        toast.error("Return failed", {
          description: errorData.error,
        });
      }
    } catch (error) {
      console.error("Return error:", error);
      toast.error("Return failed", {
        description: "Network error occurred",
      });
    } finally {
      setReturningItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(locationId);
        return newSet;
      });
    }
  };

  const isReturning = (locationId: number) => returningItems.has(locationId);

  const columns = createColumns({ onReturn: handleReturn, isReturning });

  const table = useReactTable({
    data: rentals,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const activeRentals = rentals.filter(r => !r.dateRetourReelle);
  const lateRentals = rentals.filter(r => !r.dateRetourReelle && r.statut === 'EN_RETARD');

  return (
    <div className="w-full space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="text-2xl font-bold">{activeRentals.length}</div>
          <p className="text-sm text-muted-foreground">Active Rentals</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">{lateRentals.length}</div>
          <p className="text-sm text-muted-foreground">Late Returns</p>
        </div>
        <div className="bg-card text-card-foreground rounded-lg border p-4">
          <div className="text-2xl font-bold">{rentals.length}</div>
          <p className="text-sm text-muted-foreground">Total Rentals</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center py-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search films..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No rentals found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}