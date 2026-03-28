"use client";
import { useClerk, useUser } from "@clerk/nextjs";
import { api } from "@PeerFolio/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
} from "@heroui/react";
import { Bell, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const me = useQuery(api.users.queries.getMe);
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
    if (!unreadNotifications || unreadNotifications.length === 0) return;
    const result = await markNotificationsAsRead({
      notificationIds: unreadNotifications.map((n) => n._id),
    });
    if (result.updatedCount > 0) {
      toast.success(
        result.updatedCount === 1
          ? "1 notificacao marcada como lida"
          : `${result.updatedCount} notificacoes marcadas como lidas`,
      );
    }
  };

  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  const landingLinks = [
    { to: "/feed", label: "Explorar" },
    { to: "#portfolios", label: "Comunidade" },
  ] as const;

  const appLinks = [
    { to: "/feed", label: "Feed" },
    { to: "/submit", label: "Submeter" },
  ] as const;

  const links = isLandingPage ? landingLinks : appLinks;

  const authSection = (
    <div className="flex items-center gap-3">
      {/* ── Notificações ── */}
      {isSignedIn && (
        <Dropdown
          placement="bottom-end"
          classNames={{
            content:
              "rounded-xl border border-white/10 bg-inverse-primary/95 text-white shadow-xl backdrop-blur-xl p-1",
          }}
        >
          <DropdownTrigger
            aria-label="Abrir notificacoes"
            className="relative h-9 min-w-9 rounded-md border border-white/10 bg-transparent text-white/80 transition-colors hover:bg-white/5"
          >
            <Badge
              content={unreadCount > 9 ? "9+" : unreadCount}
              isInvisible={unreadCount === 0}
              classNames={{
                badge:
                  "min-w-4 h-4 text-[10px] font-bold bg-primary text-white border-0 px-1",
              }}
            >
              <Bell className="size-4" />
            </Badge>
          </DropdownTrigger>
          <DropdownPopover placement="bottom end" className="w-80">
            <DropdownMenu
              aria-label="Notificações"
              className="w-80"
            >
              <DropdownItem
                key="header-notif"
                isDisabled
                className="font-serif text-lg text-white/90 px-3 py-1.5 cursor-default"
              >
                  Notificacoes
                </DropdownItem>
                {unreadCount === 0 && (
                  <DropdownItem
                    key="empty"
                    isDisabled
                    className="text-white/50 text-sm px-3 py-2 rounded-lg"
                  >
                    Nenhuma notificacao pendente
                  </DropdownItem>
                )}
                {unreadCount > 0 && unreadNotifications?.map((notification) => (
                  <DropdownItem
                     key={notification._id}
                     className="flex-col items-start gap-1 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors outline-none cursor-default"
                  >
                     <span className="text-xs font-semibold text-white/90 block">
                       {notification.title}
                     </span>
                     <span className="text-xs text-white/60 block">
                       {notification.message}
                     </span>
                  </DropdownItem>
                ))}
                {unreadCount > 0 && (
                  <DropdownItem
                     key="mark-all"
                     onAction={handleMarkAllAsRead}
                     className="text-primary text-sm px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors outline-none cursor-pointer mt-1 border-t border-white/5"
                  >
                     Marcar todas como lidas
                  </DropdownItem>
                )}
            </DropdownMenu>
          </DropdownPopover>
        </Dropdown>
      )}

      <ModeToggle />

      {/* ── Perfil ── */}
      {isSignedIn ? (
        <Dropdown
          placement="bottom-end"
          classNames={{
            content:
              "rounded-xl border border-white/10 bg-inverse-primary/95 text-white shadow-xl backdrop-blur-xl p-1",
          }}
        >
          <DropdownTrigger className="ml-1 h-8 min-w-8 rounded-full p-0">
            <Avatar
              className="size-8 bg-primary text-primary-foreground text-sm font-medium"
              src={me?.avatarUrl ?? ""}
              name={
                me?.nickname?.charAt(0).toUpperCase() ??
                user?.firstName?.charAt(0).toUpperCase() ??
                "?"
              }
            />
          </DropdownTrigger>
          <DropdownPopover placement="bottom end" className="w-56">
            <DropdownMenu
              aria-label="Menu do usuário"
              className="w-56"
              onAction={(key) => {
                  if (key === "profile" && me?._id) {
                    router.push(`/dashboard/${me._id}`);
                  } else if (key === "logout") {
                    signOut({ redirectUrl: "/" });
                  }
                }}
              >
                <DropdownItem
                  key="user-info"
                  isDisabled
                  className="px-3 py-2 border-b border-white/10 mb-1 cursor-default"
                >
                  <p className="text-sm font-medium leading-none text-white">
                    {me?.nickname ?? user?.fullName ?? "Usuário"}
                  </p>
                  <p className="text-xs leading-none text-white/60 mt-1">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </DropdownItem>
                <DropdownItem
                  key="profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors outline-none cursor-pointer text-sm"
                >
                  <User className="h-4 w-4" />
                  Meu Perfil
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-danger/10 text-danger transition-colors outline-none cursor-pointer text-sm mt-1 border-t border-white/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </DropdownItem>
              </DropdownMenu>
          </DropdownPopover>
        </Dropdown>
      ) : (
        <Link href={"/sign-in" as any} className="ml-2">
          <Button
            size="sm"
            radius="sm"
            className="bg-primary hover:bg-secondary text-white border-0 shadow-[0_0_15px_rgba(132,94,247,0.2)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(132,94,247,0.4)] px-6 rounded-md font-medium"
          >
            Entrar
          </Button>
        </Link>
      )}
    </div>
  );

  if (isLandingPage) {
    return (
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-white italic transition-transform hover:scale-[1.02]">
            PeerFolio
          </Link>
          <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-8 text-sm font-medium">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                href={to as any}
                className="relative text-white/70 transition-colors hover:text-white group py-2"
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
              </Link>
            ))}
          </nav>
          {authSection}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-inverse-primary/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-white italic transition-transform hover:scale-[1.02]">
            PeerFolio
          </Link>
          <nav className="hidden md:flex gap-2 text-sm font-medium">
            {links.map(({ to, label }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  href={to as any}
                  className={`relative px-4 py-2 rounded-md transition-all ${
                    isActive
                      ? "text-white bg-white/10 font-semibold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-t-sm" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        {authSection}
      </div>
    </header>
  );
}
