"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, EyeOff } from "lucide-react";
import { FilmDTO } from "@/lib/films";

export const columns: ColumnDef<FilmDTO>[] = [
	{
		accessorKey: "titre",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Titre
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const titre = row.getValue("titre") as string;
			return (
				<div className="font-medium min-w-[150px] max-w-[200px]">
					<span className="truncate block" title={titre}>
						{titre}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "anneeSortie",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Annee
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const annee = row.getValue("anneeSortie") as number;
			return <span className="font-mono">{annee}</span>;
		},
		size: 80,
	},
	{
		accessorKey: "dureeMinutes",
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				>
					Duree
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const duree = row.getValue("dureeMinutes") as number;
			const heures = Math.floor(duree / 60);
			const minutes = duree % 60;
			
			return (
				<span className="font-mono text-sm whitespace-nowrap">
					{heures > 0 ? `${heures}h ${minutes}min` : `${minutes}min`}
				</span>
			);
		},
		size: 100,
	},
	{
		accessorKey: "langueOriginale",
		header: "Langue",
		cell: ({ row }) => {
			const langue = row.getValue("langueOriginale") as string;
			return langue ? (
				<span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 whitespace-nowrap">
					{langue}
				</span>
			) : (
				<span className="text-muted-foreground text-xs">N/A</span>
			);
		},
		size: 90,
	},
	{
		accessorKey: "resumeScenario",
		header: "Resume",
		cell: ({ row }) => {
			const resume = row.getValue("resumeScenario") as string;
			if (!resume) {
				return <span className="text-muted-foreground text-xs">Aucun resume</span>;
			}
			
			const truncated = resume.length > 60 ? resume.substring(0, 60) + "..." : resume;
			return (
				<div className="min-w-[150px] max-w-[180px]">
					<span className="text-sm text-muted-foreground block truncate" title={resume}>
						{truncated}
					</span>
				</div>
			);
		},
		size: 180,
	},
	{
		accessorKey: "afficheUrl",
		header: "Affiche",
		cell: ({ row }) => {
			const afficheUrl = row.getValue("afficheUrl") as string;
			return afficheUrl ? (
				<div className="flex items-center whitespace-nowrap">
					<Eye className="h-4 w-4 text-green-600" />
					<span className="ml-1 text-xs text-green-600">Oui</span>
				</div>
			) : (
				<div className="flex items-center whitespace-nowrap">
					<EyeOff className="h-4 w-4 text-gray-400" />
					<span className="ml-1 text-xs text-gray-400">Non</span>
				</div>
			);
		},
		size: 80,
	},
];