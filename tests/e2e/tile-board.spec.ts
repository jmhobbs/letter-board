import { expect, type Page, test } from "@playwright/test";

async function drag(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
): Promise<void> {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
}

test("dragging a tile from the tray onto the board places it there", async ({
  page,
}) => {
  await page.goto("/");

  const trayTile = page.locator('[data-tile-id="consonant-b"]');
  const box = await trayTile.boundingBox();
  if (!box) {
    throw new Error("tray tile bounding box not found");
  }

  await drag(
    page,
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    { x: 300, y: 200 },
  );

  const boardTile = page.locator(".board-tile");
  await expect(boardTile).toHaveCount(1);
  await expect(boardTile).toHaveText("b");
});

test("dropping a tile near another snaps them flush together", async ({
  page,
}) => {
  await page.goto("/");

  const consonantTray = page.locator('[data-tile-id="consonant-b"]');
  const vowelTray = page.locator('[data-tile-id="vowel-a"]');

  const consonantBox = await consonantTray.boundingBox();
  if (!consonantBox) {
    throw new Error("tray tile bounding box not found");
  }
  await drag(
    page,
    {
      x: consonantBox.x + consonantBox.width / 2,
      y: consonantBox.y + consonantBox.height / 2,
    },
    { x: 300, y: 200 },
  );

  const vowelBox = await vowelTray.boundingBox();
  if (!vowelBox) {
    throw new Error("tray tile bounding box not found");
  }
  await drag(
    page,
    { x: vowelBox.x + vowelBox.width / 2, y: vowelBox.y + vowelBox.height / 2 },
    { x: 370, y: 205 },
  );

  await expect(page.locator(".board-tile")).toHaveCount(2);

  const boxes = await page.locator(".board-tile").evaluateAll((elements) =>
    elements.map((element) => {
      const rect = (element as HTMLElement).getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }),
  );
  const [first, second] = boxes as [
    { x: number; y: number; width: number; height: number },
    { x: number; y: number; width: number; height: number },
  ];

  expect(second.x).toBeCloseTo(first.x + first.width, 0);
  expect(second.y).toBeCloseTo(first.y, 0);
});

test("dragging a placed tile back onto the expanded tray removes it", async ({
  page,
}) => {
  await page.goto("/");

  const trayTile = page.locator('[data-tile-id="consonant-b"]');
  const box = await trayTile.boundingBox();
  if (!box) {
    throw new Error("tray tile bounding box not found");
  }
  await drag(
    page,
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    { x: 300, y: 200 },
  );
  await expect(page.locator(".board-tile")).toHaveCount(1);

  const boardTile = page.locator(".board-tile");
  const boardTileBox = await boardTile.boundingBox();
  if (!boardTileBox) {
    throw new Error("board tile bounding box not found");
  }
  const trayPanelBox = await page.locator(".tray-panel").boundingBox();
  if (!trayPanelBox) {
    throw new Error("tray panel bounding box not found");
  }

  await drag(
    page,
    {
      x: boardTileBox.x + boardTileBox.width / 2,
      y: boardTileBox.y + boardTileBox.height / 2,
    },
    {
      x: trayPanelBox.x + trayPanelBox.width / 2,
      y: trayPanelBox.y + trayPanelBox.height / 2,
    },
  );

  await expect(page.locator(".board-tile")).toHaveCount(0);
});

test("dragging a placed tile onto the minimized tray's handle removes it", async ({
  page,
}) => {
  await page.goto("/");

  const trayTile = page.locator('[data-tile-id="consonant-b"]');
  const box = await trayTile.boundingBox();
  if (!box) {
    throw new Error("tray tile bounding box not found");
  }
  await drag(
    page,
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    { x: 300, y: 200 },
  );
  await expect(page.locator(".board-tile")).toHaveCount(1);

  await page.locator(".tray-toggle").click();
  await expect(page.locator(".tray-handle")).toBeVisible();
  await page.waitForTimeout(300);

  const boardTile = page.locator(".board-tile");
  const boardTileBox = await boardTile.boundingBox();
  if (!boardTileBox) {
    throw new Error("board tile bounding box not found");
  }
  const handleBox = await page.locator(".tray-handle").boundingBox();
  if (!handleBox) {
    throw new Error("tray handle bounding box not found");
  }

  await drag(
    page,
    {
      x: boardTileBox.x + boardTileBox.width / 2,
      y: boardTileBox.y + boardTileBox.height / 2,
    },
    {
      x: handleBox.x + handleBox.width / 2,
      y: handleBox.y + handleBox.height / 2,
    },
  );

  await expect(page.locator(".board-tile")).toHaveCount(0);
});

test("renders without error at both iPad portrait and landscape viewport sizes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1080, height: 810 });
  await page.goto("/");
  await expect(page.locator(".tray-panel")).toBeVisible();
  await expect(page.locator(".board")).toBeVisible();

  await page.setViewportSize({ width: 810, height: 1080 });
  await page.reload();
  await expect(page.locator(".tray-panel")).toBeVisible();
  await expect(page.locator(".board")).toBeVisible();
});
