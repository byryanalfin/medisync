import { test, expect } from "@playwright/test";

test("BPJS and service status open directly and retain the selected prescription", async ({ page }) => {
  const records = [1, 2].map(id => ({ id, status: id === 1 ? "approved" : "ready", tracking_code: `MS-00000${id}`, doctor: { name: "Dokter Uji" }, examination: { patient: { name: `Pasien ${id}`, rm_number: `RM-${id}` } }, items: [], created_at: "2026-11-12T01:00:00Z", updated_at: "2026-11-12T01:00:00Z", bpjs_card_checked: id === 2, bpjs_identity_checked: id === 2, bpjs_documents_checked: id === 2 }));
  await page.addInitScript(() => localStorage.setItem("token", "isolated-selection-test"));
  await page.route("**/api/**", route => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({ contentType: "application/json", body: JSON.stringify(path.endsWith("/me") ? { user: { id: 2, name: "Apoteker Uji", role: "admin_apoteker" } } : { success: true, data: records }) });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Verifikasi BPJS", exact: true }).click();
  await page.getByRole("combobox").selectOption("2");
  for (const checkbox of await page.getByRole("checkbox").all()) await expect(checkbox).toBeChecked();
  await page.getByRole("button", { name: "Status Pelayanan", exact: true }).click();
  await expect(page.getByRole("combobox")).toHaveValue("2");
  await expect(page.getByRole("button", { name: "Tandai Diserahkan", exact: true }).first()).toBeEnabled();
  await expect(page.getByRole("button", { name: "Terima Resep", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Katalog Obat", exact: true }).click();
  await page.getByRole("button", { name: "Verifikasi BPJS", exact: true }).click();
  await expect(page.getByRole("combobox")).toHaveValue("2");
  await page.reload();
  await page.getByRole("button", { name: "Status Pelayanan", exact: true }).click();
  await expect(page.getByRole("combobox")).toHaveValue("2");
  await page.getByRole("combobox").selectOption("1");
  await expect(page.getByRole("button", { name: "Terima Resep", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Verifikasi BPJS", exact: true }).click();
  for (const checkbox of await page.getByRole("checkbox").all()) await expect(checkbox).not.toBeChecked();
});
