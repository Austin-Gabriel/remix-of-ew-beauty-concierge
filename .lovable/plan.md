## The problem

The whole `/src/profile/` domain runs a parallel design system that has nothing to do with the rest of the app:

| | Rest of app (Home / Bookings / Earnings / Calendar) | Profile + Settings today |
|---|---|---|
| Shell | `HomeShell` — cream `#F0EBD8` light / midnight `#061C27` dark, drifting squiggles, paper grain | Solid `var(--eb-bg)` with no shell |
| Theme | Honors dev theme toggle (light / dark / system) | Hard-forced `data-theme="dark"` everywhere |
| Cards | Pure WHITE `#FFFFFF` + navy `#061C27` text, `1px solid rgba(6,28,39,0.10)`, `12px` radius, soft shadow (per `mem://design/card-surfaces`) | `var(--eb-surface)` (off-white in light, dark navy in dark), `14–18px` radius |
| Page header | 22px navy "Bookings" / "Earnings" inside `HomeShell` | 28px Uncut Sans on a different bg, gear → `/profile/account-settings` (legacy) |
| Settings layout | n/a — no other page uses iOS list rows | iOS-style "01 / 02 / 03" indices with letter chapter markers `A / B / C / D`, big 22px row labels, full-bleed dividers — used **nowhere else in the app** |
| Font | `Uncut Sans` only; serif (`Fraunces`) is logo-only per `mem://index.md` | Fraunces leaks into rating numbers (Reviews stub, CustomerView, Language native names) |
| Accent chips | None — orange is reserved for the single primary action per screen (per `mem://design/orange-discipline`) | Every settings row gets a peach-soft icon chip, breaking the one-orange rule |
| Bottom tabs | `BottomTabs` rendered by every working surface | Profile renders `ProfileBottomTabs`; subpages have none (correct), but Settings page also has none which is inconsistent with reachability |

The visual gap is large enough that opening Profile feels like a different app.

## What we'll change

All work stays inside `/src/profile/` and `/src/routes/profile.*` — no other domains, no shared folders, no STRUCTURE.md.

### 1. Adopt `HomeShell` everywhere in profile

`ProfilePage`, `SettingsPage`, and `SubpageShell` all wrap their body in `<HomeShell>` so they sit on the same cream/midnight surface as Home / Bookings / Earnings, honor the dev `Light / Dark / System` toggle, and inherit `Uncut Sans`. Drop the `data-theme="dark"` overrides and the manual safe-area padding (HomeShell already does it).

### 2. Replace `var(--eb-*)` tokens with the HomeShell palette

Inside profile components, read colors from `useHomeTheme()`:
- Page text / chrome borders → `text`, `borderCol`, `borderSoft`
- Cards → wrap card content in `<CardTheme>` and use `cardSurface` (white), `cardText` (navy `#061C27`), `cardBorder` (`rgba(6,28,39,0.10)`)
- Single accent → `#FF823F` only on the one primary action per screen (Save in Edit Profile, Update password, Add a service, Connect)

We keep `var(--eb-*)` defined in `styles.css` for backward-compat but stop reading them in profile components.

### 3. Rewrite the card primitives

| Component | Change |
|---|---|
| `IdentityCard.tsx` | White card, navy text, soft shadow `0 1px 2px rgba(6,28,39,0.06), 0 8px 24px -12px rgba(6,28,39,0.18)`. Keep peach-soft monogram (it's the Pro's own avatar, not a UI accent). Pencil button → outlined navy. Match screenshot reference. |
| `SectionCard.tsx` | White card, hairline `rgba(6,28,39,0.10)`, navy children. Removes the cream-tinted look. |
| `SectionLabel.tsx` | Navy at 0.55 opacity, 11px uppercase, 0.06em tracking — same eyebrow style as `CardEyebrow` in earnings. |
| `SettingsRow.tsx` | Navy text on white. Drop the orange-soft icon chip (use a 28px navy-stroke icon at 0.55 opacity, no fill). Chevron stays muted navy. Active press = `rgba(6,28,39,0.04)`. |
| `SubpageShell.tsx` | Render inside `<HomeShell noTabBarSpacing>`. Sticky header becomes a thin navy/cream bar with the same back button style used in booking detail (`ChevronLeft 22px` + bare title). Body sits on the page bg, not on `var(--eb-bg)`. |

### 4. Rebuild `SettingsPage` to match the rest of the app

Drop the `A / B / C / D` chapter markers and the `01 / 02 / …` numeric indices — they appear nowhere else and read like a different product. Replace with the same pattern the rest of the app uses:

- `SectionLabel` ("Account", "Preferences", "Money", "About") — same eyebrow style as Earnings sections
- `SectionCard` containing standard `SettingsRow` items
- "Sign out" and "Delete Ewà Biz account" become the standard secondary / destructive button pair (transparent fill, navy / red border, full-width)
- Email footer stays
- Page is wrapped in `HomeShell`, no forced dark theme

### 5. Drop Fraunces from profile

Replace the three Fraunces usages with `Uncut Sans` semibold + tabular-nums:
- `StubPages.tsx` Reviews rating headline
- `CustomerViewModal.tsx` rating display
- `AppearancePage.tsx` / Language picker native-name preview

Per `mem://index.md`: serif is wordmark-only.

### 6. Pull orange back to one anchor per screen

Remove the orange icon chips from every `SettingsRow`. The one orange element on each screen becomes:
- Profile main: `Connect` link on the Social row when no socials are linked (otherwise no orange — chevron is enough)
- Settings: `Setup` action on the Payouts row when no bank is connected
- Edit Profile: the `Save` button when dirty
- Change Password: the `Update password` filled button
- Services stub: the `Add a service` filled button
- Socials stub: a single `Connect` filled chip on the active platform

### 7. Settings header → keep it consistent

The Profile gear icon already routes to `/profile/account-settings` (which renders `SettingsPage`). We won't migrate the URL — that's out of scope for this pass. The visual pass will make the destination feel like the same app.

## Files that change

```text
src/profile/
  ProfilePage.tsx                # wrap in HomeShell, drop data-theme="dark"
  SettingsPage.tsx               # drop A/B/C/D chapter UI, restyle rows, wrap in HomeShell
  EditProfilePage.tsx            # navy/white tokens
  ChangePasswordPage.tsx         # navy/white tokens
  AppearancePage.tsx             # navy/white tokens, drop Fraunces
  StubPages.tsx                  # navy/white tokens, drop Fraunces, single orange CTA
  components/
    ProfileHeader.tsx            # navy outlined buttons, match Bookings header
    IdentityCard.tsx             # white card + navy text + soft shadow
    SectionCard.tsx              # white surface
    SectionLabel.tsx             # navy 0.55 opacity eyebrow
    SettingsRow.tsx              # drop peach icon chip, navy stroke icon
    SubpageShell.tsx             # wrap in HomeShell, theme-aware header
    CustomerViewModal.tsx        # navy/white tokens, drop Fraunces
```

`useProfile.ts`, the i18n provider, route files, and the demo data in `/src/data/` are unchanged.

## What we don't touch (scope lock)

- `/src/home/`, `/src/bookings/`, `/src/calendar/`, `/src/earnings/`, `/src/auth/`, `/src/onboarding*/`, `/src/components/`, `/src/hooks/`, `/src/lib/`, `/src/styles/`, `/src/data/` (no profile-only mocks need editing)
- `STRUCTURE.md`
- `src/styles.css` (the `--eb-*` tokens stay defined for back-compat with anything we miss)
- Route files (no URL changes; gear still goes to `/profile/account-settings`)

## Verification

1. `bun run build` — zero TypeScript errors expected
2. Open `/profile` in light and dark — page bg matches Home/Bookings/Earnings, IdentityCard is a white card on cream/midnight, ratings render in Uncut Sans tabular-nums, only one orange element when applicable
3. Open `/profile/account-settings` — same page bg as Profile, white grouped cards with simple labeled sections, no `01 / 02` indices, no `A B C D` chapters
4. Open each subpage (`/profile/settings/edit-profile`, `…/notifications`, `…/language`, `…/appearance`, `…/privacy`, `…/change-password`, `/profile/services`, `/profile/availability`, `/profile/socials`, `/profile/payouts-and-banking`, `/profile/help-and-support`, `/profile/settings/how-it-works`, `/profile/settings/terms-of-service`) — all sit on HomeShell, all use white cards + navy text, no Fraunces, single orange action per page

## Deliverables

A Profile + Settings surface that's visually indistinguishable from Home / Bookings / Earnings in chrome, palette, typography, and card system, while keeping every existing route, button handler, toast, and persistence behavior working.