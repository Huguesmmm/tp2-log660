import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FilmIcon } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
	return (
		<div className="container mx-auto py-10">
			<div className="flex flex-col items-center">
				<h1 className="text-2xl font-bold mb-6">Dashboard</h1>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Link href="/dashboard/films">
						<Card className="hover:bg-muted/50 transition-colors sm:min-w-[250px] lg:min-h-44 lg:min-w-[300px]">
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle className="text-xl font-bold">Films</CardTitle>
								<FilmIcon className="h-7 w-7 text-muted-foreground" />
							</CardHeader>
							<div className="flex flex-row justify-between px-6 pt-0">
								{/* <div className="text-l font-medium">Gestion des films</div> */}
								<p className="col-span-1 text-s font-medium text-muted-foreground">
									Listez, filtrez et <br />
									recherchez vos films
								</p>
								<span className="text-s text-muted-foreground"></span>
							</div>
						</Card>
					</Link>
				</div>
			</div>
		</div>
	);
}
