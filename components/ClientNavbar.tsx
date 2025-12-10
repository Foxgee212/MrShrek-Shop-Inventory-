"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import jwt from "jsonwebtoken";
import Navbar from "./Navbar";

export default function ClientNavbar() {
  const pathname = usePathname();
  const [role, setRole] = useState<"admin" | "staff" | null>(null);

  useEffect(() => {
    const cookie = document.cookie.match(/(^|;) ?token=([^;]*)/);
    if (!cookie) return setRole(null);

    try {
      const decoded: any = jwt.decode(cookie[2]);
      setRole(decoded?.role ?? null);
    } catch {
      setRole(null);
    }
  }, [pathname]);

  // hide navbar on login page
  if (pathname === "/") return null;

  if (!role) return null;

  return <Navbar role={role} />;
}
