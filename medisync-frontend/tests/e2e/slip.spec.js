import { test, expect } from "@playwright/test";

test("tracking slip has a printable code, escaped patient name, and no medical details", async ({ page }) => {
  await page.goto("/");
  const popupPromise = page.waitForEvent("popup");
  await page.evaluate(async () => {
    const { printTrackingSlip } = await import("/src/utils/printTrackingSlip.js");
    printTrackingSlip({ tracking_code: "MS-ABC123", created_at: "2026-11-12T02:00:00Z", examination: { patient: { name: "Pasien <script>window.injected=true</script>" } }, items: [{ drug_name: "SECRET_MEDICINE" }] });
  });
  const popup = await popupPromise;
  await expect(popup.locator(".code")).toHaveText("MS-ABC123");
  await expect(popup.locator("article")).toContainText("Pasien <script>window.injected=true</script>");
  await expect(popup.locator("body")).not.toContainText("SECRET_MEDICINE");
  expect(await popup.evaluate(() => window.injected)).toBeUndefined();
  expect(await popup.evaluate(() => window.opener)).toBeNull();
  await popup.emulateMedia({ media: "print" });
  await expect(popup.locator(".controls")).toBeHidden();
  await popup.screenshot({ path: "test-results/slip-print.png", fullPage: true });
});

test("blocked print popup provides a clear error", async ({ page }) => {
  await page.goto("/");
  const message = await page.evaluate(async () => {
    const { printTrackingSlip } = await import("/src/utils/printTrackingSlip.js");
    window.open = () => null;
    try { printTrackingSlip({ tracking_code: "MS-ABC123" }); }
    catch (error) { return error.message; }
  });
  expect(message).toContain("Izinkan popup");
});
