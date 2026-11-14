import { test, expect } from "@playwright/test";

test("pharmacist can add a catalog entry from the pharmacy menu", async ({ page }) => {
  const rows = [];
  let posted;
  await page.addInitScript(() => localStorage.setItem("token", "isolated-ui-test"));
  await page.route("**/api/**", async route => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;
    let body = { success: true, data: [] };
    if (pathname.endsWith("/me")) body = { user: { id: 2, name: "Apoteker Uji", role: "admin_apoteker" } };
    if (pathname.endsWith("/drugs")) {
      if (request.method() === "POST") { posted = request.postDataJSON(); rows.push({ id: 1, ...posted }); body = { success: true, data: rows[0] }; }
      else body = { success: true, data: rows, pagination: { total: rows.length, current_page: 1, last_page: 1 } };
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Katalog Obat", exact: true }).click();
  await page.getByRole("button", { name: "+ Tambah obat", exact: true }).click();
  await page.getByLabel("Nama obat", { exact: true }).fill("Obat Katalog UI");
  await page.getByLabel("Stok tercatat", { exact: true }).fill("20");
  await page.getByRole("button", { name: "Simpan obat", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Obat Katalog UI", exact: true })).toBeVisible();
  expect(posted.stock).toBe(20);
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});
