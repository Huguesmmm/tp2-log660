import { auth, signOut } from "@/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Navbar() {
  const session = await auth();

  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-x-6"> 
          <Link href="/">
            <span className="font-bold">
              LOG660 - TP2
            </span>
          </Link>
          <nav>
            {session?.user && (
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Dashboard
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center">
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );

  function UserMenu({ user }: { user: { name?: string | null; email?: string | null } }) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10">
            {user.name ?? "?"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <SignOutButton />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  function SignOutButton() {
    return (
      <form
        action={async () => {
          "use server";
          await signOut({redirect: false});
          redirect("/login");
        }}
      >
        <button type="submit" className="w-full">
          <DropdownMenuItem className="text-red-500 cursor-pointer">
            Sign Out
          </DropdownMenuItem>
        </button>
      </form>
    );
  }
}
