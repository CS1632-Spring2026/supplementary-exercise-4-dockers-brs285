import { test, expect } from '@playwright/test';

// TODO: Fill in with test cases.

const BASE_URL = "http://localhost:8080";

/**
 * Test Fixture:
 * 1) Browser installed/launched (handled by Playwright)
 * 2) Open https://cs1632.appspot.com/
 * 3) Cookies "1","2","3" set to "false" (no cats rented)
 */
test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
        { name: "1", value: "false", domain: "cs1632.appspot.com", path: "/" },
        { name: "2", value: "false", domain: "cs1632.appspot.com", path: "/" },
        { name: "3", value: "false", domain: "cs1632.appspot.com", path: "/" },
    ]);
    await page.goto(BASE_URL);
});

test("TEST-1-RESET", async ({ context, page }) => {
    // PRECONDITIONS: cookies "1","2","3" = "true"
    await context.clearCookies();
    await context.addCookies([
        { name: "1", value: "true", domain: "cs1632.appspot.com", path: "/" },
        { name: "2", value: "true", domain: "cs1632.appspot.com", path: "/" },
        { name: "3", value: "true", domain: "cs1632.appspot.com", path: "/" },
    ]);

    // EXECUTION: Press "Reset" link
    await page.getByRole("link", { name: "Reset" }).click();
    // POSTCONDITIONS: all cats available in listing

    const items = page.locator("#listing li.list-group-item");
    await expect(page.locator("#cat-id1")).toHaveText("ID 1. Jennyanydots");
    await expect(page.locator("#cat-id2")).toHaveText("ID 2. Old Deuteronomy");
    await expect(page.locator("#cat-id3")).toHaveText("ID 3. Mistoffelees");
});

test("TEST-2-CATALOG", async ({ page }) => {
    // EXECUTION: Press "Catalog"
    await page.getByRole("link", { name: "Catalog" }).click();

    // POST: second image src is "/images/cat2.jpg"
    // Catalog images are in the numbered list; get the 2nd <img>.
    const secondImg = page.locator("ol li img").nth(1);
    await expect(secondImg).toHaveAttribute("src", "/images/cat2.jpg");
});

test("TEST-3-LISTING", async ({ page }) => {
    // EXECUTION: Press "Catalog"
    await page.getByRole("link", { name: "Catalog" }).click();
    const items = page.locator("#listing li.list-group-item");
    // POST:
    // 1) exactly three items in listing
    // 2) third item text is "ID 3. Mistoffelees"
    await expect(items).toHaveCount(3);
    await expect(items.nth(2)).toHaveText("ID 3. Mistoffelees");
});

test("TEST-4-RENT-A-CAT", async ({ page }) => {
    // EXECUTION: Press "Rent-A-Cat"
    await page.getByRole("link", { name: "Rent-A-Cat" }).click();

    // POST: "Rent" and "Return" buttons exist
    await expect(page.getByRole("button", { name: "Rent" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Return" })).toBeVisible();
});

test("TEST-5-RENT", async ({ page }) => {
    // EXECUTION:
    // 1) Rent-A-Cat link
    // 2) Enter "1" into rent input
    // 3) Press "Rent"
    await page.getByRole("link", { name: "Rent-A-Cat" }).click();
    await page.getByLabel("Enter the ID of the cat to rent:").fill("1");
    await page.getByRole("button", { name: "Rent" }).click();  

    // POST:
    // 1) first listing item is "Rented out"
    // 2) second is "ID 2. Old Deuteronomy"
    // 3) third is "ID 3. Mistoffelees"
    // 4) rentResult shows "Success!"
    const items = page.locator("#listing li.list-group-item");

    await expect(items.nth(0)).toHaveText("Rented out");
    await expect(items.nth(1)).toHaveText("ID 2. Old Deuteronomy");
    await expect(items.nth(2)).toHaveText("ID 3. Mistoffelees");
    await expect(page.locator("#rentResult")).toHaveText("Success!");
});

// test("TEST-6-RETURN", async ({ context, page }) => {
//     // PRECONDITIONS: cookies "2" and "3" = "true" (cats 2 and 3 rented)
//     await context.clearCookies();
//     await context.addCookies([
//         { name: "1", value: "false", domain: "cs1632.appspot.com", path: "/" },
//         { name: "2", value: "true", domain: "cs1632.appspot.com", path: "/" },
//         { name: "3", value: "true", domain: "cs1632.appspot.com", path: "/" },
//     ]);
//     await page.goto(BASE_URL);
//     // EXECUTION:
//     // 1) Rent-A-Cat link
//     // 2) Enter "2" into return input
//     // 3) Press "Return"
//     await page.getByRole("link", { name: "Rent-A-Cat" }).click();
//     await page.locator("#returnID").fill("2");
//     await page.getByRole("button", { name: "Return" }).click();

//     // POST:
//     // 1) first listing item "ID 1. Jennyanydots"
//     // 2) second listing item "ID 2. Old Deuteronomy"
//     // 3) third listing item "Rented out" (since cat 3 still rented)
//     // 4) returnResult shows "Success!"
//     await expect(page.locator("#cat-id1")).toHaveText("ID 1. Jennyanydots");
//     await expect(page.locator("#cat-id2")).toHaveText("ID 2. Old Deuteronomy");
//     await expect(page.locator("#cat-id3")).toHaveText("Rented out");
//     await expect(page.locator("#returnResult")).toHaveText("Success!");
// });

test("TEST-7-FEED-A-CAT", async ({ page }) => {
    // EXECUTION: Press "Feed-A-Cat" link
    await page.getByRole("link", { name: "Feed-A-Cat" }).click();

    // POST: Feed button exists
    await expect(page.getByRole("button", { name: "Feed" })).toBeVisible();
});

test("TEST-8-FEED", async ({ page }) => {
    // EXECUTION:
    // 1) Feed-A-Cat link
    // 2) Enter "6" catnips
    // 3) Press "Feed"
    await page.getByRole("link", { name: "Feed-A-Cat" }).click();

    const catnipInput = page.locator("input").first();
    await catnipInput.fill("6");
    await page.getByRole("button", { name: "Feed" }).click();

    // POST: feedResult has "Nom, nom, nom."
    // 7s delay: extend expect timeout to 10s.
    await expect(page.locator("#feedResult")).toHaveText("Nom, nom, nom.", {
        timeout: 10_000,
    });
});

test("TEST-9-GREET-A-CAT", async ({ page }) => {
    // EXECUTION: Press "Greet-A-Cat"
    await page.getByRole("link", { name: "Greet-A-Cat" }).click();

    // POST: "Meow!Meow!Meow!" appears on page
    await expect(page.locator("body")).toContainText("Meow!Meow!Meow!");
});

test("TEST-10-GREET-A-CAT-WITH-NAME", async ({ page }) => {
    // EXECUTION: Navigate directly to /greet-a-cat/Jennyanydots
    await page.goto(`${BASE_URL}/greet-a-cat/Jennyanydots`);

    // POST: "Meow! from Jennyanydots." appears
    await expect(page.locator("body")).toContainText("Meow! from Jennyanydots.");
});

test("TEST-11-FEED-A-CAT-SCREENSHOT", async ({ context, page }) => {
    // PRECONDITIONS: cookies "1","2","3" = "true"
    await context.clearCookies();
    await context.addCookies([
        { name: "1", value: "true", domain: "cs1632.appspot.com", path: "/" },
        { name: "2", value: "true", domain: "cs1632.appspot.com", path: "/" },
        { name: "3", value: "true", domain: "cs1632.appspot.com", path: "/" },
    ]);
    await page.goto(BASE_URL);

    // EXECUTION: Press "Feed-A-Cat"
    await page.getByRole("link", { name: "Feed-A-Cat" }).click();

    // POST: body screenshot matches snapshot in tests/rentacat.spec.ts.snapshots
    await expect(page.locator("body")).toHaveScreenshot();
});

// test("DEFECT1-FUN-FEED", async ({ page }) => {
//     await page.getByRole("link", { name: "Feed-A-Cat" }).click();
  
//     await page.getByRole("textbox").fill("-3");
//     await page.getByRole("button", { name: "Feed" }).click();

//     await expect(page.locator("#feedResult")).toHaveText("Cat fight!", { timeout: 10000 });
// });

// test("DEFECT2-FUN-GREET-A-CAT", async ({ page }) => {
//     // Rent cat 1
//     await page.getByRole("link", { name: "Rent-A-Cat" }).click();
//     await page.getByLabel("Enter the ID of the cat to rent:").fill("1");
//     await page.getByRole("button", { name: "Rent" }).click();
//     await expect(page.locator("#rentResult")).toHaveText("Success!");
//     await expect(page.locator("#cat-id1")).toHaveText("Rented out");
  
//     // Now greet
//     await page.getByRole("link", { name: "Greet-A-Cat" }).click();
  
//     // Should only greet available cats (2)
//     await expect(page.locator("body")).toContainText("Meow!Meow!");
//     await expect(page.locator("body")).not.toContainText("Meow!Meow!Meow!");
// });

// test("DEFECT3-FUN-GREET-A-CAT-WITH-NAME", async ({ page }) => {
//     // Rent Jennyanydots (ID 1)
//     await page.getByRole("link", { name: "Rent-A-Cat" }).click();
//     await page.getByLabel("Enter the ID of the cat to rent:").fill("1");
//     await page.getByRole("button", { name: "Rent" }).click();
//     await expect(page.locator("#rentResult")).toHaveText("Success!");
//     await expect(page.locator("#cat-id1")).toHaveText("Rented out");
  
//     // Try greeting rented-out cat by name
//     await page.goto(`${BASE_URL}/greet-a-cat/Jennyanydots`);
  
//     // Should say not here (because not available)
//     await expect(page.locator("body")).toContainText("Jennyanydots is not here.");
//     await expect(page.locator("body")).not.toContainText("Meow! from Jennyanydots.");
// });