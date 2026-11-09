import { useState, useEffect } from "react";
import PharmacyLayout from "../components/pharmacy/PharmacyLayout";
import PharmacyQueueView from "../components/pharmacy/PharmacyQueueView";

export default function PharmacyPortal() {
  const [user] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "null");
      return stored?.role === "admin_apoteker" ? stored : null;
    } catch {
      return null;
    }
  });
  const [tab, setTab] = useState("queue");

  useEffect(() => {
    if (!user) window.location.href = "/";
  }, [user]);

  if (!user) return null;

  return (
    <PharmacyLayout onLogout={() => (window.location.href = "/")}>
      <PharmacyQueueView tab={tab} onTabChange={setTab} />
    </PharmacyLayout>
  );
}
