# 🎨 HireFlow — Frontend CSS/HTML Viva Guide

## 1. Styling Approach

HireFlow uses **global CSS variables** in `index.css` for the design system + **inline `<style>` tags inside JSX** for component-specific styles (Navbar, JobCard, etc.). This keeps styles co-located with their logic, no extra libraries needed.

---

## 2. Design Token System (CSS Variables)

```css
:root {
  --primary-color: #2563eb;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --shadow-premium: 0 10px 40px -10px rgba(0,0,0,0.08);
}
```
- `:root` = the `<html>` element. Variables defined here are available **everywhere**.
- Change `--primary-color` once → entire app theme updates. No preprocessor needed.
- CSS vars are **runtime** (changeable via JS), unlike SASS vars which are compile-time.

---

## 3. Universal Reset

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
```
- `box-sizing: border-box` → `width` **includes** padding + border. Without it, `width: 100%` + padding = overflow.

---

## 4. Gradient Text (Logo)

```css
.nav-logo span {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```
**How?** → Apply gradient as background → clip it to text shape → make text transparent so gradient shows through.

---

## 5. Active Link Underline (Pseudo-element)

```css
.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 100%; height: 2.5px;
  background: linear-gradient(90deg, #2563eb, #3b82f6);
  border-radius: 2px;
}
```
**Why not `border-bottom`?** → `::after` gives full control: gradient, thickness, border-radius, animations. `border-bottom` can't do gradients.

---

## 6. Skeleton Shimmer Loader

```css
.sk-line::after {
  content: "";
  position: absolute; inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  animation: sk-shimmer 1.8s infinite;
}
@keyframes sk-shimmer { 100% { transform: translateX(100%); } }
```
**How?** → Gray boxes mimic layout. A translucent gradient slides across via `@keyframes`. `overflow: hidden` clips it. Same technique as Facebook/LinkedIn.

- `inset: 0` = shorthand for `top:0; right:0; bottom:0; left:0`
- `@keyframes` defines animation steps; `animation` applies it with duration + repeat.

---

## 7. Sticky Navbar

```css
.navbar { position: sticky; top: 0; z-index: 1000; }
```

| Position | Behavior |
|----------|----------|
| `relative` | Stays in flow, offsets relative to itself |
| `fixed` | Always stuck to viewport, removed from flow |
| **`sticky`** ✅ | In flow → sticks at `top: 0` on scroll. Best of both. |

---

## 8. Card Hover Lift

```css
.jc-wrap:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px -8px rgba(37,99,235,0.15);
}
```
**How?** → `translateY(-5px)` lifts card up. Blue-tinted shadow creates depth. `cubic-bezier(0.4,0,0.2,1)` = Material Design's standard easing (fast start, smooth deceleration).

---

## 9. Vertical Timeline

```css
.timeline { border-left: 2px solid #e5e7eb; padding-left: 20px; }
.timeline-circle { position: absolute; left: -27px; border-radius: 50%; }
.timeline-circle.current { box-shadow: 0 0 0 4px rgba(37,99,235,0.2); }
```
**How?** → `border-left` = vertical line. Circles positioned **on** the line with negative `left`. Ring effect via `box-shadow` spread (doesn't affect layout unlike `border`).

---

## 10. Multi-line Text Truncation

```css
.jc-desc {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```
**How?** → Limits text to exactly 3 lines with `...`. For **1 line**: use `white-space: nowrap; text-overflow: ellipsis;` instead.

---

## 11. Input Focus Ring

```css
input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}
```
**How?** → Remove default outline → replace with custom border + glow ring via `box-shadow`. Maintains accessibility while looking premium.

---

## 12. Card Accent Bar

```css
.jc-accent { height: 3px; background: linear-gradient(90deg, #2563eb, #7c3aed); flex-shrink: 0; }
```
Thin gradient strip at top of cards. `flex-shrink: 0` prevents compression. Parent's `overflow: hidden` clips it to the card's `border-radius`.

---

## 13. Flexbox Patterns Used

```css
/* Navbar: logo left, links right */
.nav-container { display: flex; justify-content: space-between; align-items: center; }

/* Card: push footer to bottom */
.jc-inner { display: flex; flex-direction: column; flex: 1; }
.jc-spacer { flex: 1; }  /* Fills remaining space, pushing footer down */
```

| Property | Purpose |
|----------|---------|
| `justify-content` | Main axis alignment (horizontal) |
| `align-items` | Cross axis alignment (vertical) |
| `flex: 1` | Grow to fill remaining space |
| `gap` | Space between items (cleaner than margins) |

---

## 14. Button States

| State | Effect |
|-------|--------|
| **Hover** | `translateY(-1px)` lift + deeper shadow |
| **Active** | `translateY(0)` snap back (pressed feel) |
| **Disabled** | `opacity: 0.5` + `cursor: not-allowed` |

`display: inline-flex` on buttons allows icon + text alignment.

---

## 15. Quick-fire Viva Q&A

| Question | Answer |
|----------|--------|
| *Gradient text how?* | `background-clip: text` + transparent fill |
| *Truncate to N lines?* | `-webkit-line-clamp: N` |
| *Skeleton loader how?* | `@keyframes` shimmer in `::after` pseudo-element |
| *Sticky vs Fixed?* | Sticky stays in flow; Fixed removed from flow |
| *Why CSS variables?* | Single source of truth, runtime-changeable |
| *What is cubic-bezier?* | Custom animation easing curve |
| *Timeline how?* | `border-left` + absolutely positioned circles |
| *Why box-sizing border-box?* | Width includes padding+border, prevents overflow |
| *`::after` what is it?* | Virtual child element for decorative effects |
| *`em` vs `rem`?* | `em` = relative to parent, `rem` = relative to root html |
| *How to center a div?* | `margin: 0 auto` (horizontal) or flexbox (both axes) |
| *`inset: 0` means?* | Shorthand for `top:0; right:0; bottom:0; left:0` |
| *Why `overflow: hidden` on cards?* | Clips children to follow parent's border-radius |
| *`-webkit-font-smoothing`?* | Makes text render thinner/crisper on macOS |
| *Radial vs Linear gradient?* | Radial = circular from a point; Linear = straight line |
