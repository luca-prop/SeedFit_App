import { expect, test } from "@playwright/test";

test("B2C core flow: budget search to zone detail and comparison", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("내 가용 현금 범위")).toBeVisible();
  const singleBudgetButton = page.getByRole("button", { name: "3억 단일" });
  await expect(singleBudgetButton).toBeVisible();
  await expect(async () => {
    await singleBudgetButton.click();
    await expect(page.getByText("3억 ~ 3억")).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });

  await page.getByRole("button", { name: "이 예산 범위로 구역 찾기" }).click();
  await page.waitForURL(/\/app\/results\?/);
  await expect(page.getByRole("heading", { name: "Reverse Filter 검색 결과" })).toBeVisible();
  await expect(page.getByText("예산 맞춤 구역 분포")).toBeVisible();

  const firstZoneDetailLink = page.getByRole("link", { name: "구역 상세 보기" }).first();
  await expect(firstZoneDetailLink).toBeVisible({ timeout: 15_000 });
  await firstZoneDetailLink.click();

  await expect(page).toHaveURL(/\/app\/zones\/[^?]+/);
  await expect(page.getByText("구역 기본 정보와 최신 실투자금 범위를 빠르게 확인하는 Lite 화면입니다.")).toBeVisible();
  await expect(page.getByText("기축 레퍼런스")).toBeVisible();

  await page.getByRole("link", { name: "같은 예산 기축단지 비교" }).click();

  await expect(page).toHaveURL(/\/app\/comparison\/[^?]+/);
  await expect(page.getByText("같은 실투자금 기축단지 비교")).toBeVisible();
  await expect(page.getByText("비교 요약")).toBeVisible();
  await expect(page.getByText("진입 가능한 기축 대조군", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "일반 40%" }).click();

  await expect(page).toHaveURL(/ltvModel=general40/);
  await expect(page.getByText("일반 40%")).toBeVisible();
});

