"use client";

import { DataTable } from "@/app/films/data-table";
import { columns } from "@/app/films/columns";
import { Film } from "@/entities/Film";

interface TableFilmsProps {
  data: Film[];
}

export default function TableFilms({ data }: TableFilmsProps) {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Films</h1>
        <div className="w-full">
          <DataTable columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
}
