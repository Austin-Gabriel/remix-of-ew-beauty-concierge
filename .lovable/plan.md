## Goal

Make the Settings page header match the rest of the app (Bookings / Earnings style — one main title, no subtitle), match the reference screenshot, and ensure every piece of text is visible in both light and dark mode.

## Reference behavior

- **Bookings header** (`src/bookings/bookings-page.tsx` lines 79–97): single 22px bold title, left-aligned, color from `useHomeTheme().text` (cream on dark, navy on light). No subtitle, no descriptive paragraph.
- **Reference screenshot**: subpage-style header with back chevron on the left, centered "Settings" title, then white cards on the dark midnight background. **No second big "Settings" h2 and no descriptive paragraph below.**

## Problems found

1. `src/profile/SettingsPage.tsx` renders **two** title areas:
   - the sticky subpage header with centered "Settings" (correct, matches screenshot)
   - a second `<h2>Settings</h2>` with a descriptive paragraph "Manage your account, preferences, and how Ewà Biz works for you." (does NOT match — needs to go).
2. The same descriptive paragraph hard-codes `color: var(--eb-fg)` with `opacity: 0.6` — fine in theory, but `--eb-fg` on the **app shell chrome** is cream (`#F0EBD8`) in dark mode and navy (`#061C27`) in light mode, which works only because `HomeShell` is the parent. Confirm contrast still works after removal of paragraph.
3. The "App version" footer row uses the same pattern — keep, it's fine.
4. `SettingsRow` (`src/profile/components/SettingsRow.tsx`) hard-codes `NAVY = #061C27` for label text and `NAVY_MUTED = rgba(6,28,39,0.55)` for sublabel/icon. This is correct **inside the white cards** (cards are pure white in both themes per `mem://design/card-surfaces`), so it stays.
5. The `Right` / `RightAccent` helpers in `SettingsPage.tsx` are rendered **inside** white-card rows, so navy-muted is correct there too. No change needed.
6. `SubpageShell` already uses `var(--eb-bg)` / `var(--eb-fg)` so it themes correctly.
7. Profile page (`ProfilePage.tsx`) header is already a clean single 22px title via `ProfileHeader.tsx` — matches Bookings. No subtitle. **No change needed.** (User reference is Profile page, which is already correct — Settings is the one that needs to match it.)
8. Bookings page header is already the canonical pattern — no change.

## Changes

### `src/profile/SettingsPage.tsx`
- Delete the entire second-title block (lines ~174–192): the `<div className="px-4 pt-4 pb-2">…</div>` containing the duplicate `<h2>Settings</h2>` and the descriptive `<p>` paragraph.
- The sticky subpage header with back chevron + centered "Settings" stays — it matches the screenshot.
- The first `<SectionLabel>Account</SectionLabel>` will then be the first content under the header, matching the screenshot's "Signed in as / Change password / 2FA" first card.
- Switch the `SettingsLoadingBlock` skeleton bars from hard-coded `rgba(6,28,39,0.08)` (invisible on white cards is fine, but the *card itself* is white-on-midnight which works) — keep as is; only the wrapping `pt` spacing needs a small bump now that the title block is gone.

### `src/profile/SettingsPage.tsx` — header polish
- The sticky header currently uses `var(--eb-bg)` for background. In dark mode this is midnight (`#061C27`), in light mode cream (`#F0EBD8`) — both have visible chevron + title via `var(--eb-fg)`. Verified correct.
- Add a top spacer (`pt-4`) directly above the first `<SectionLabel>` so the cards don't sit flush against the header divider.

### No changes to
- `src/profile/ProfilePage.tsx` (header already matches Bookings pattern)
- `src/profile/components/ProfileHeader.tsx` (already a single 22px title)
- `src/profile/components/IdentityCard.tsx` (white card, navy text — already correct in both themes)
- `src/profile/components/SectionCard.tsx`, `SectionLabel.tsx`, `SettingsRow.tsx` (already theme-correct: white cards always, navy text inside cards always)
- `src/bookings/bookings-page.tsx` (already the canonical header)
- `src/styles.css` (tokens already set for both themes)

## Verification

After the edit, on `/profile/account-settings`:
- Light mode: cream page background, navy back chevron + centered "Settings" title, white cards with navy rows and muted-navy sublabels. Matches screenshot if user toggles light.
- Dark mode (default per screenshot): midnight page, cream chevron + centered cream "Settings" title, white cards with navy rows. Matches screenshot exactly.
- No duplicate "Settings" title, no descriptive paragraph.
- Bottom "Sign out" / "Delete" buttons inherit `var(--eb-fg)` — visible in both themes (already correct).

## Files touched

- `src/profile/SettingsPage.tsx` (single edit: remove the duplicate-title block, adjust top spacing)
