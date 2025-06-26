"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RentalDTO } from "@/lib/films";
import { ArrowUpDown, RotateCcw } from "lucide-react";

interface ColumnsProps {
  onReturn: (copieId: string, locationId: number) => void;
  isReturning: (locationId: number) => boolean;
}

export const createColumns = ({ onReturn, isReturning }: ColumnsProps): ColumnDef<RentalDTO>[] => [
  {
    accessorKey: "titre",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Film
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rental = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
            {rental.afficheUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={rental.afficheUrl.replace("http://", "https://")}
                alt={rental.titre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                No Image
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{rental.titre}</div>
            <div className="text-sm text-muted-foreground">{rental.anneeSortie}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "dateLocation",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Rented On
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dateString = row.getValue("dateLocation") as string;
      const date = new Date(dateString);
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "dateRetourPrevue",
    header: "Due Date",
    cell: ({ row }) => {
      const dueDate = row.original.dateRetourPrevue;
      if (!dueDate) {
        return <Badge variant="secondary">No Due Date</Badge>;
      }
      const date = new Date(dueDate);
      const isOverdue = new Date() > date && !row.original.dateRetourReelle;
      return (
        <div className={isOverdue ? "text-red-600 font-medium" : ""}>
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "statut",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("statut") as string;
      const variant = 
        status === "RETOURNEE" ? "default" :
        status === "EN_RETARD" ? "destructive" :
        "secondary";
      
      const label = 
        status === "RETOURNEE" ? "Returned" :
        status === "EN_RETARD" ? "Late" :
        "Active";

      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    accessorKey: "penaliteCourante",
    header: "Penalty",
    cell: ({ row }) => {
      const penalty = row.getValue("penaliteCourante") as number;
      if (penalty > 0) {
        return <span className="text-red-600 font-medium">${penalty}</span>;
      }
      return <span className="text-green-600">$0</span>;
    },
  },
  {
    accessorKey: "dateRetourReelle",
    header: "Returned On",
    cell: ({ row }) => {
      const returnDate = row.original.dateRetourReelle;
      if (!returnDate) {
        return <span className="text-muted-foreground">—</span>;
      }
      const date = new Date(returnDate);
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const rental = row.original;
      const canReturn = !rental.dateRetourReelle;
      
      if (!canReturn) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }

      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReturn(rental.copieId, rental.locationId)}
          disabled={isReturning(rental.locationId)}
          className="h-8"
        >
          {isReturning(rental.locationId) ? (
            <>
              <RotateCcw className="mr-2 h-3 w-3 animate-spin" />
              Returning...
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 h-3 w-3" />
              Return
            </>
          )}
        </Button>
      );
    },
  },
];