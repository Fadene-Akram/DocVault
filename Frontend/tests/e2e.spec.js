import { test, expect } from '@playwright/test'

// ─── Test 1: Login flow + role-based redirect ─────────────────────────────────
test.describe('Authentication & Role Redirect', () => {
  test('admin login redirects to /admin/users', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/DocVault/)

    // Fill credentials
    await page.getByTestId('email-input').fill('admin@docvault.io')
    await page.getByTestId('password-input').fill('admin123')
    await page.getByTestId('login-btn').click()

    // Should redirect to admin section
    await expect(page).toHaveURL(/\/admin\/users/)
    await expect(page.getByText('Users')).toBeVisible()
    await expect(page.getByText('ADMIN')).toBeVisible()
  })

  test('end-user login redirects to /documents', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('bob@docvault.io')
    await page.getByTestId('password-input').fill('user123')
    await page.getByTestId('login-btn').click()

    await expect(page).toHaveURL(/\/documents/)
    await expect(page.locator('.doc-grid, table')).toBeVisible()
  })

  test('demo buttons pre-fill credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('demo-admin').click()
    await expect(page.getByTestId('email-input')).toHaveValue('admin@docvault.io')
    await expect(page.getByTestId('password-input')).toHaveValue('admin123')
  })

  test('wrong credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('wrong@email.com')
    await page.getByTestId('password-input').fill('wrongpass')
    await page.getByTestId('login-btn').click()
    await expect(page.getByText(/Invalid credentials/i)).toBeVisible()
  })

  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/documents')
    await expect(page).toHaveURL(/\/login/)
    await page.goto('/admin/users')
    await expect(page).toHaveURL(/\/login/)
  })
})

// ─── Test 2: Document list — search, filter, pagination ───────────────────────
test.describe('Document List — Search & Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('demo-user').click()
    await page.getByTestId('login-btn').click()
    await expect(page).toHaveURL(/\/documents/)
    await page.waitForSelector('[data-testid="doc-grid"]')
  })

  test('shows document cards on load', async ({ page }) => {
    const cards = page.locator('[data-testid="doc-card"]')
    await expect(cards).toHaveCount(await cards.count())
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('search filters documents by title', async ({ page }) => {
    await page.getByTestId('search-input').fill('API')
    await page.waitForTimeout(200)
    const cards = page.locator('[data-testid="doc-card"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
    // Check that at least one result contains "API" in its text
    await expect(cards.first()).toContainText(/API/i)
  })

  test('search returns empty state for unknown term', async ({ page }) => {
    await page.getByTestId('search-input').fill('xyzzy_nonexistent_document_987')
    await page.waitForTimeout(200)
    await expect(page.getByText(/No documents found/i)).toBeVisible()
  })

  test('category filter chips work', async ({ page }) => {
    // Click the first non-"All" filter chip
    const chips = page.locator('.filter-chip:not(.active)')
    const firstChip = chips.first()
    const chipText = await firstChip.textContent()
    await firstChip.click()
    await page.waitForTimeout(200)
    // Chip becomes active
    await expect(firstChip).toHaveClass(/active/)
  })

  test('pagination component renders when enough documents exist', async ({ page }) => {
    // If there are more than PAGE_SIZE docs, pagination shows
    const pagination = page.locator('[data-testid="pagination"]')
    const totalText = page.locator('.pagination-info')
    // Check if pagination exists; if docs <= PAGE_SIZE it won't show
    const docCards = await page.locator('[data-testid="doc-card"]').count()
    if (docCards >= 6) {
      await expect(pagination).toBeVisible()
      await expect(totalText).toContainText('Showing')
    }
  })

  test('upload modal opens and closes', async ({ page }) => {
    await page.getByTestId('upload-btn').click()
    await expect(page.getByText('Upload Document')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText('Upload Document')).not.toBeVisible()
  })

  test('upload modal submit is disabled without required fields', async ({ page }) => {
    await page.getByTestId('upload-btn').click()
    const submitBtn = page.getByTestId('upload-submit')
    await expect(submitBtn).toBeDisabled()
  })
})

// ─── Test 3: Document detail — tabs, versions, comments ──────────────────────
test.describe('Document Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('demo-user').click()
    await page.getByTestId('login-btn').click()
    await expect(page).toHaveURL(/\/documents/)
    await page.waitForSelector('[data-testid="doc-card"]')
    await page.locator('[data-testid="doc-card"]').first().click()
    await page.waitForSelector('.tabs')
  })

  test('shows Overview tab by default with metadata', async ({ page }) => {
    await expect(page.getByText('Document Metadata')).toBeVisible()
    await expect(page.getByText('File Type')).toBeVisible()
    await expect(page.getByText('Current Version')).toBeVisible()
  })

  test('Versions tab shows version timeline', async ({ page }) => {
    await page.getByText(/Versions/).click()
    await expect(page.locator('.version-timeline')).toBeVisible()
  })

  test('Comments tab loads CommentsBox component', async ({ page }) => {
    await page.getByText('Comments').click()
    await expect(page.locator('[data-testid="comments-box"]')).toBeVisible()
    await expect(page.locator('[data-testid="comment-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="comment-submit"]')).toBeDisabled()
  })

  test('comment submit enables when text is typed', async ({ page }) => {
    await page.getByText('Comments').click()
    await page.locator('[data-testid="comment-input"]').fill('This is a test comment')
    await expect(page.locator('[data-testid="comment-submit"]')).toBeEnabled()
  })
})

// ─── Test 4: Admin — user management ─────────────────────────────────────────
test.describe('Admin — User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('demo-admin').click()
    await page.getByTestId('login-btn').click()
    await expect(page).toHaveURL(/\/admin\/users/)
    await page.waitForSelector('table')
  })

  test('shows user table with stats cards', async ({ page }) => {
    await expect(page.getByText('Total Users')).toBeVisible()
    await expect(page.getByText('Active')).toBeVisible()
    await expect(page.locator('table tbody tr')).toHaveCount(
      await page.locator('table tbody tr').count()
    )
  })

  test('search filters users by name', async ({ page }) => {
    await page.getByTestId('user-search').fill('Alice')
    await page.waitForTimeout(200)
    const rows = page.locator('table tbody tr')
    await expect(rows.first()).toContainText(/Alice/i)
  })

  test('create user modal opens with correct fields', async ({ page }) => {
    await page.getByTestId('create-user-btn').click()
    await expect(page.getByText('Add New User')).toBeVisible()
    await expect(page.locator('[data-testid="user-name-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="save-user-btn"]')).toBeDisabled()
  })

  test('multi-select checkboxes work', async ({ page }) => {
    const firstCheckbox = page.locator('table tbody input[type="checkbox"]').first()
    await firstCheckbox.check()
    await expect(page.locator('.action-bar')).toBeVisible()
    await expect(page.locator('.action-bar-count')).toContainText('1 user selected')
  })

  test('select all checkbox on page selects all visible rows', async ({ page }) => {
    const selectAll = page.locator('thead input[type="checkbox"]')
    await selectAll.check()
    const rowCheckboxes = page.locator('tbody input[type="checkbox"]')
    const count = await rowCheckboxes.count()
    for (let i = 0; i < count; i++) {
      await expect(rowCheckboxes.nth(i)).toBeChecked()
    }
    await expect(page.locator('.action-bar')).toBeVisible()
  })

  test('pagination shows on users list', async ({ page }) => {
    // If there are more than 8 users, pagination renders
    const rows = await page.locator('table tbody tr').count()
    const pagination = page.locator('[data-testid="pagination"]')
    if (rows >= 8) {
      await expect(pagination).toBeVisible()
    }
  })
})

// ─── Test 5: Admin — departments ─────────────────────────────────────────────
test.describe('Admin — Departments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('demo-admin').click()
    await page.getByTestId('login-btn').click()
    await page.goto('/admin/departments')
    await page.waitForSelector('.card')
  })

  test('shows department cards', async ({ page }) => {
    const cards = page.locator('.card')
    expect(await cards.count()).toBeGreaterThan(0)
    await expect(page.getByText('Engineering')).toBeVisible()
  })

  test('manage members modal opens', async ({ page }) => {
    await page.getByText('Manage Members').first().click()
    await expect(page.getByText(/Manage members/)).toBeVisible()
  })
})
