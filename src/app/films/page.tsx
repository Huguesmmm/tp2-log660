import { Suspense } from "react";
import { getFilms } from "@/lib/films";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { FilmIcon } from "lucide-react";
import { FilmDTO } from "@/lib/films";

interface FilmsPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

async function FilmsTable({ searchParams }: FilmsPageProps) {
  try {
    const resolvedSearchParams = await searchParams;
    const params = {
      search: resolvedSearchParams.search,
      page: resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1,
      pageSize: resolvedSearchParams.pageSize ? parseInt(resolvedSearchParams.pageSize) : 10,
      sortBy: resolvedSearchParams.sortBy as keyof FilmDTO,
      sortOrder: (resolvedSearchParams.sortOrder as 'asc' | 'desc') || 'asc',
    };

    const filmsData = await getFilms(params);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Films</h2>
            <p className="text-muted-foreground">
              Gerez votre collection de films
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FilmIcon className="h-6 w-6" />
            <span className="text-sm text-muted-foreground">
              {filmsData.total} film(s) au total
            </span>
          </div>
        </div>
        <DataTable columns={columns} data={filmsData.data} />
      </div>
    );
  } catch (error) {
    console.error("Error loading films:", error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FilmIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Erreur de chargement</h3>
          <p className="text-muted-foreground">
            Impossible de charger les films. Veuillez reessayer.
          </p>
        </div>
      </div>
    );
  }
}

function FilmsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-10 w-64 bg-muted rounded animate-pulse" />
          <div className="h-10 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="border rounded-md">
          <div className="h-12 bg-muted rounded-t-md animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-t bg-muted/50 animate-pulse" />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          <div className="flex space-x-2">
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FilmsPage({ searchParams }: FilmsPageProps) {
  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<FilmsTableSkeleton />}>
        <FilmsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
