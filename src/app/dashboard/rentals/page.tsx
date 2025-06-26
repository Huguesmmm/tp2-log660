import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RentalsDataTable } from "./data-table";
import { RentalDTO } from "@/lib/films";

async function getRentals(): Promise<RentalDTO[]> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return [];
  }

  try {
    const { RentalService } = await import("@/lib/services/RentalService");
    const rentals = await RentalService.getClientRentals(Number(session.user.id));
    
    return rentals.map(rental => {
      const dateLocation = rental.dateLocation instanceof Date 
        ? rental.dateLocation 
        : new Date(rental.dateLocation);
      
      const dateRetourPrevue = rental.dateRetourPrevue 
        ? (rental.dateRetourPrevue instanceof Date 
            ? rental.dateRetourPrevue 
            : new Date(rental.dateRetourPrevue))
        : undefined;
      
      const dateRetourReelle = rental.dateRetourReelle 
        ? (rental.dateRetourReelle instanceof Date 
            ? rental.dateRetourReelle 
            : new Date(rental.dateRetourReelle))
        : undefined;

      return {
        locationId: rental.locationId,
        copieId: rental.copieId,
        titre: rental.titre,
        dateLocation: dateLocation.toISOString(),
        dateRetourPrevue: dateRetourPrevue?.toISOString(),
        dateRetourReelle: dateRetourReelle?.toISOString(),
        penaliteCourante: rental.penaliteCourante,
        statut: rental.statut as 'EN_COURS' | 'RETOURNEE' | 'EN_RETARD',
        afficheUrl: rental.afficheUrl,
        anneeSortie: rental.anneeSortie,
      };
    });
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return [];
  }
}

export default async function RentalsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const rentals = await getRentals();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Rentals</h1>
          <p className="text-muted-foreground">
            Manage your movie rentals and returns
          </p>
        </div>
        
        {rentals.length > 0 ? (
          <RentalsDataTable rentals={rentals} />
        ) : (
          <div className="bg-card text-card-foreground rounded-lg border p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">No rentals found</h3>
            <p className="text-muted-foreground mb-6">
              You don't have any active or past rentals.
            </p>
            <a href="/dashboard/films" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              Browse Films
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
