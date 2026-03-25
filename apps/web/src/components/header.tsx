"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { api } from "@PeerFolio/backend/convex/_generated/api";
import { Button } from "@PeerFolio/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@PeerFolio/ui/components/dropdown-menu";
import { useMutation, useQuery } from "convex/react";
import { Bell, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  const unreadNotifications = useQuery(
    api.users.queries.getUnreadNotifications,
    {},
  );
  const markNotificationsAsRead = useMutation(
    api.users.mutations.markNotificationsAsRead,
  );
  const lastNotifiedCountRef = useRef(0);

  const unreadCount = unreadNotifications?.length ?? 0;

  useEffect(() => {
    if (!isSignedIn) {
      lastNotifiedCountRef.current = 0;
      return;
    }

    if (unreadCount > 0 && unreadCount !== lastNotifiedCountRef.current) {
      toast.info(
        unreadCount === 1
          ? "Voce tem 1 notificacao pendente"
          : `Voce tem ${unreadCount} notificacoes pendentes`,
      );
      lastNotifiedCountRef.current = unreadCount;
    }
  }, [isSignedIn, unreadCount]);

  const handleMarkAllAsRead = async () => {
    if (!unreadNotifications || unreadNotifications.length === 0) {
      return;
    }

    const result = await markNotificationsAsRead({
      notificationIds: unreadNotifications.map(
        (notification) => notification._id,
      ),
    });

    if (result.updatedCount > 0) {
      toast.success(
        result.updatedCount === 1
          ? "1 notificacao marcada como lida"
          : `${result.updatedCount} notificacoes marcadas como lidas`,
      );
    }
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/feed", label: "Feed" },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {isSignedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Abrir notificacoes"
                  />
                }
              >
                <span className="relative inline-flex">
                  <Bell className="size-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Notificacoes</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  {unreadCount === 0 ? (
                    <DropdownMenuItem disabled>
                      Nenhuma notificacao pendente
                    </DropdownMenuItem>
                  ) : (
                    unreadNotifications?.map((notification) => (
                      <DropdownMenuItem
                        key={notification._id}
                        className="flex-col items-start gap-1"
                      >
                        <span className="text-xs font-semibold">
                          {notification.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {notification.message}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuGroup>

                {unreadCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={handleMarkAllAsRead}>
                        Marcar todas como lidas
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <ModeToggle />
          {isSignedIn ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => signOut({ redirectUrl: "/" })}
              aria-label="Sair"
            >
              <LogOut className="size-4" />
            </Button>
          ) : (
            <Link href={"/sign-in" as any}>
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
      <hr />
    </div>
  );
}
