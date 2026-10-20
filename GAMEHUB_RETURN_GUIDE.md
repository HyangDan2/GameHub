# Return to GameHub Integration Guide

Status: reusable implementation instructions. This document does not claim that any game has already been modified or deployed.

## 1. Purpose

Add a reliable, accessible route from an existing browser game to:

**https://hyangdan2.github.io/GameHub/**

Apply this guide independently inside each game repository. Preserve the game's existing deployment, gameplay rules, controls, and save behavior.

Default visible Korean label: **게임 허브로**

English alternative when required by the game's language system: **Game Hub**

Use the game's existing localization mechanism where available.

## 2. Inspect before editing

1. Read the repository's `AGENTS.md`, README, architecture, and relevant test/deployment instructions.
2. Identify the current title/menu, pause, victory/defeat, and result screens.
3. Locate existing navigation components, input handling, focus behavior, persistence, and audio cleanup.
4. Check the production base path and current live URL.
5. Establish whether a hub link already exists; repair or reuse it rather than duplicating it.
6. Inspect the current worktree and preserve unrelated user changes.

Do not assume file locations or APIs from another game. The same user-facing behavior may require DOM, canvas, or engine-specific implementation.

## 3. Navigation contract

- Navigate to the exact absolute HTTPS URL above, including `/GameHub/`.
- Navigate in the same tab.
- Use an ordinary anchor wherever the interface supports it.
- Do not rely on `history.back()`, the referrer, or the presence of a previous hub visit.
- Do not create a popup or an iframe.
- Do not accept an arbitrary return URL from a query parameter.
- Define the destination once using the project's existing configuration conventions.
- Ensure the link also works when the user opens the game directly or from a bookmark.

For a DOM-based menu, the basic behavior is:

```html
<a class="menu-link" href="https://hyangdan2.github.io/GameHub/">
  게임 허브로
</a>
```

Adapt styling and localization to the application. Do not add a new dependency just for this link.

If engine UI cannot provide a semantic anchor, use an accessible DOM control or the established accessible UI mechanism. A button-driven implementation may use `window.location.assign(HUB_URL)` after any required save/exit handling.

## 4. Placement

Choose placements that fit the existing game:

| Screen | Recommended behavior |
| --- | --- |
| Title or main menu | Show a secondary Game Hub link |
| Pause menu | Offer Game Hub alongside existing resume/restart actions |
| Victory, defeat, or results | Offer Game Hub after existing result/save handling |
| Active gameplay | Avoid an overlapping persistent exit control |

Use all applicable existing menu surfaces when they remain clear. Do not create a new pause system or redesign the entire menu merely to add navigation.

The destination should be discoverable without competing with the primary start/resume action.

### Exiting an active run

Follow the game's existing exit conventions.

- If leaving loses an unfinished run, explain that before the final navigation action.
- Reuse an existing confirmation dialog when appropriate.
- Keep the game paused while a confirmation is open.
- Cancel must restore the previous pause menu and focus.
- Confirm must navigate only once.
- Do not claim that the current run is saved unless it actually is.
- Do not add a confirmation on title/results screens when there is no unsaved run.

Prefer an in-game dialog or clear pause-menu explanation over a generic browser unload prompt. Do not trap browser navigation.

## 5. State, audio, and persistence

- Preserve the existing timing of score/progress saves.
- On results screens, ensure normal result persistence completes before leaving.
- Reuse established lifecycle cleanup where needed; do not invent a separate save system.
- Avoid asynchronous work that is likely to be abandoned during navigation.
- Do not clear settings, records, or caches.
- Do not introduce cloud sync, score transfer, or shared storage with the hub.
- Follow the game's existing visibility/page lifecycle rules for audio and pause behavior.
- Check browser Back navigation for stuck overlays, duplicate handlers, or unexpected resumed audio.

All `hyangdan2.github.io` project sites share an origin. Never use `localStorage.clear()` as exit cleanup. Preserve each game's existing storage namespace.

## 6. Desktop and mobile behavior

- Use readable text and a visible keyboard focus indicator.
- Place the action in a logical tab/focus order.
- Activate links with Enter and buttons with their normal keyboard behavior.
- Prevent gameplay shortcuts from also firing when a menu control is activated.
- Ensure touch activation fires once.
- Aim for a comfortable touch target of at least 44 by 44 CSS pixels.
- Respect display safe areas and existing touch-control insets.
- Avoid joystick, attack, lane-input, and tile-board hit regions.
- Test text wrapping and menu overflow on small screens.
- Preserve orientation requirements and rotation/pause behavior.
- Use existing reduced-motion and visual styling conventions.

Do not disable additional browser gestures or alter gameplay input mapping just to support navigation.

## 7. Initial repository-specific guidance

These are inspection starting points, not guaranteed current implementation details.

### CDXPilot0004: Particle Beat

Repository: `https://github.com/HyangDan2/CDXPilot0004`

Expected play URL: `https://hyangdan2.github.io/CDXPilot0004/`

- Inspect the static HTML/JavaScript screen system and existing pause/results handling.
- Add navigation to appropriate selection/menu, pause, and result surfaces.
- Keep the control outside the rhythm highway and touch lane hit areas.
- Preserve HOLD handling, pause/resume countdowns, record submission, and audio transport.
- Check both portrait and landscape touch layouts.

### CDXPilot0005: VALKYRIE — The Ashen Gate

Repository: `https://github.com/HyangDan2/CDXPilot0005`

Expected play URL: `https://hyangdan2.github.io/CDXPilot0005/`

- Inspect Phaser scenes and existing DOM/menu integration before choosing the implementation.
- Add navigation to existing start, pause, and end-of-run surfaces as appropriate.
- Keep controls outside the movement stick and combat buttons.
- Preserve the landscape requirement and portrait rotation prompt.
- Confirm that opening, cancelling, or confirming exit does not trigger attacks or movement.
- Do not imply that an unfinished stage can be resumed after leaving if no save system exists.

### CDXPilot0006: ChibiLink — Momo's Little Café

Repository: `https://github.com/HyangDan2/CDXPilot0006`

Expected play URL: `https://hyangdan2.github.io/CDXPilot0006/`

- Inspect the DOM-based dialogs and existing menu actions.
- Add navigation to existing start, pause, and result surfaces as appropriate.
- Keep the link outside tile selection hit regions.
- Preserve dialog focus and keyboard-shortcut suppression.
- Verify that Challenge timers stay paused during exit confirmation.
- Preserve stage unlocks and best scores without promising restoration of an unfinished board.
- Check portrait and landscape layouts.

## 8. Verification

Run the repository's required checks, plus focused coverage for the integration. Reuse existing test infrastructure.

### Required behavioral checks

1. Every implemented hub action points to the exact destination.
2. Activating it navigates in the same tab.
3. Direct game entry does not affect the destination.
4. An active-run exit warning, if implemented, accurately describes what is lost.
5. Cancelling exit keeps the game paused and restores usable focus.
6. Confirming exit triggers only one navigation.
7. Existing result saves and settings remain intact.
8. Keyboard and touch activation do not leak into gameplay.
9. Small-screen and orientation-specific menus remain usable.
10. Browser Back does not leave the game in a broken UI or audio state.

For local automated tests, intercept external navigation or assert the emitted destination so that tests do not depend on hub availability. Verify real cross-site navigation separately after deployment.

Capture representative menu screenshots where layout changed. Report browser emulation and physical-device testing separately.

Do not expand this task into a full game regression rewrite. Run relevant existing regression checks and add focused tests where navigation or state handling introduces meaningful risk.

## 9. Deployment and hosted acceptance

1. Review the diff and ensure it contains only intended integration changes.
2. Run the repository's established verification/build workflow.
3. Follow its authorized commit, PR, and deployment process.
4. Wait for the deployment result before claiming completion.
5. Open the deployed game at its real production path.
6. Exercise the hub action and confirm the resulting URL and hub content.
7. From the hub, reopen the same game and check that the expected version loads.

If the hub is not yet deployed, the game-side implementation can be locally verified, but end-to-end acceptance remains pending. Report this accurately and repeat hosted acceptance after the hub is available.

If a game release fails, use the repository's normal rollback process. Do not alter game URLs or hub deployment settings as a workaround.

## 10. Completion report

Provide a concise report containing:

- Repository and implementation revision.
- Screens where the action was added.
- Active-run exit behavior.
- Tests run and their outcomes.
- Game deployment status and public URL.
- Actual hosted navigation result.
- Any remaining access, deployment, or device-verification gaps.

The integration is complete when the deployed game exposes a usable return action, preserves its existing state behavior, and reaches the live GameHub page successfully.

## 11. Reusable execution request

Use the following request when applying this guide to a game repository:

> Implement GAMEHUB_RETURN_GUIDE.md in this repository. Inspect the current project instructions and menu architecture, add the appropriate return actions, preserve gameplay and storage behavior, run the relevant checks, and use the repository's authorized deployment workflow. Verify the deployed round trip to https://hyangdan2.github.io/GameHub/ and report any remaining gaps. Update an existing integration instead of duplicating it.
