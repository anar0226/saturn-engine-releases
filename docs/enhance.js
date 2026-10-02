/* Saturn Engine — public site, enhancement layer.
 *
 * ENHANCEMENT, not rendering. Every word of the page is already in index.html;
 * this file only adds the film. If it never loads, never parses, or throws on
 * line one, the visitor still gets a complete, readable, scrollable site. That
 * property is the whole reason the site stopped being a React SPA (E1).
 *
 * A chapter is declared ONCE, on its own <section> (E5a). This file reads:
 *
 *   id                  the anchor, and the rail's target
 *   data-label          the rail's primary label
 *   data-sub            the rail's functional subtitle, shown when current (D8)
 *   data-ring           the ring's transform while this chapter is on screen
 *   data-ring-opacity   the ring's opacity while this chapter is on screen
 *   data-video          optional: id of a <video> to play while on screen
 *
 * Adding a chapter is adding a section. There is no table here to forget.
 */

const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const reel = document.getElementById("reel");
const rings = document.getElementById("rings");
const rail = document.getElementById("rail");
const chapters = [...document.querySelectorAll(".ch")];

/* ── the rail ──────────────────────────────────────────────────────────────
 * Built from the chapters, plus one permanent entry to the coda so a returning
 * evaluator has a path to the capability list (D8). Krug's trunk test: cover
 * the page, look only at this, and you can still tell what is here.
 */
function buildRail() {
  if (!rail) return;
  const entry = (href, label, sub) => {
    const a = document.createElement("a");
    a.href = "#" + href;
    a.dataset.t = href;
    a.innerHTML =
      '<span class="lbl">' +
      label +
      (sub ? ' <span class="sub">' + sub + "</span>" : "") +
      '</span><span class="tick"></span>';
    rail.appendChild(a);
    return a;
  };
  chapters.forEach((ch) => entry(ch.id, ch.dataset.label || ch.id, ch.dataset.sub));
  entry("fine", "Everything it does", "");
}

let currentId = null;

function setCurrent(id) {
  currentId = id;
  rail.querySelectorAll("a").forEach((a) => {
    const cur = a.dataset.t === id;
    a.classList.toggle("cur", cur);
    // T12: gold and a longer tick are the only things marking the current
    // chapter, and DESIGN.md §13 does not allow state by colour alone. This is
    // the non-visual half of that signal.
    if (cur) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });
}

/* ── the ring ─────────────────────────────────────────────────────────────
 * One mark, re-aimed per chapter. This is what carries continuity across a hard
 * cut: the scene changes, the ring does not disappear.
 */
function aimRing(ch) {
  // T18: under reduced motion the ring holds one position for the whole scroll.
  // The blanket rule strips its transition, so re-aiming would make a
  // viewport-sized mark JUMP between six positions — louder than the motion it
  // was meant to remove. Not moving is the reduced state; moving instantly is
  // not.
  if (RM || !rings || !ch.dataset.ring) return;
  rings.style.transform = ch.dataset.ring;
  rings.style.opacity = ch.dataset.ringOpacity || "1";
}

/* ── chapter II: the gate ─────────────────────────────────────────────────
 * Performs the loop ONCE, on first entry. Replaying it every time you scroll
 * past would turn the product's central claim into a fidget toy.
 *
 * T16 adds the 400ms at-rest gate so a fast flick past chapter II does not burn
 * the animation unseen. E4a marks it already-played when someone lands past it.
 */
const PROMPT = "make it night, with traffic on Main Street";
let gatePlayed = false;

/* The finished state of the gate: every row lit, the engine's rows flipped from
 * amber to green, the status resolved. Three callers want it — reduced motion,
 * the end of the animation, and E4a's landing past chapter II — so it lives in
 * one place rather than being spelled out three times.
 */
function resolveGate() {
  const dot = document.getElementById("gdot");
  const state = document.getElementById("gstate");
  const rows = [...document.querySelectorAll("#grows li")];
  if (!dot || !state || !rows.length) return;
  rows.forEach((li) => li.classList.add("lit"));
  dot.classList.remove("breathe");
  dot.classList.add("done");
  state.textContent = "gate · passed";
  rows.forEach((li) => {
    if (li.dataset.by === "eng") {
      li.querySelector(".dot").classList.add("done");
      li.querySelector(".k").classList.add("done");
    }
  });
}

function playGate() {
  if (gatePlayed) return;
  gatePlayed = true;

  const typed = document.getElementById("typed");
  const dot = document.getElementById("gdot");
  const state = document.getElementById("gstate");
  const rows = [...document.querySelectorAll("#grows li")];
  if (!typed || !dot || !state || !rows.length) return;

  if (RM) return resolveGate();

  typed.textContent = "";
  dot.classList.add("breathe");
  state.textContent = "gate · waiting";

  let i = 0;
  const type = setInterval(() => {
    typed.textContent = PROMPT.slice(0, ++i);
    if (i >= PROMPT.length) {
      clearInterval(type);
      state.textContent = "gate · running";
      setTimeout(step, 420);
    }
  }, 44);

  let n = 0;
  function step() {
    if (n >= rows.length) return resolveGate();
    rows[n++].classList.add("lit");
    setTimeout(step, 560);
  }
}

/* ── video ────────────────────────────────────────────────────────────────
 * Plays while its chapter is on screen, pauses otherwise. T8 makes the source
 * itself lazy (E1b has to land first — you cannot lazy-load a data URI, which
 * is what the old single-file build produced). T6 adds the refusal fallback:
 * on rejection the copy must change, because "It is already running" over a
 * frozen still is the site arguing against itself.
 */
/* T6 — the refusal path.
 *
 * "It is already running" standing over a frozen still is the site arguing
 * against itself, and it is not a rare case: Safari and low-power mode refuse
 * autoplay routinely, and it is the one path a developer testing on their own
 * machine is least likely to ever hit. So the copy changes with the state.
 *
 * The single-file preview build (E3a) ships posters and no clips, so play()
 * rejects there too and this is exercised every time that build is opened.
 */
/* Every element carrying data-paused swaps, not just the eyebrow. The headline
 * is the one that matters: an eyebrow reading "paused" under a headline reading
 * "It is already running", in the largest type on the page, over a still frame,
 * is the contradiction this whole path exists to prevent. Changing the small
 * text and leaving the big claim standing would have satisfied the letter of
 * the spec and none of its point.
 */
function swapPaused(ch, on) {
  ch.classList.toggle("paused", on);
  ch.querySelectorAll("[data-paused]").forEach((el) => {
    if (on && !el.dataset.live) {
      el.dataset.live = el.textContent.trim();
      el.textContent = el.dataset.paused;
    } else if (!on && el.dataset.live) {
      el.textContent = el.dataset.live;
      delete el.dataset.live;
    }
  });
  const btn = ch.querySelector(".playctl");
  if (btn) btn.hidden = !on;
}

function showPaused(ch) {
  if (!ch.classList.contains("paused")) swapPaused(ch, true);
}

function clearPaused(ch) {
  if (ch.classList.contains("paused")) swapPaused(ch, false);
}

function playVideo(ch, on) {
  const id = ch.dataset.video;
  if (!id) return;
  const v = document.getElementById(id);
  if (!v) return;
  if (!on) return v.pause();

  // E3a's preview build strips the <source>, and a <video> with nothing to load
  // never settles its play() promise — it just waits. Say so straight away
  // rather than leaving the headline claiming the thing is running while a
  // promise that will never resolve hangs behind it.
  if (!v.currentSrc && !v.querySelector("source[src]")) return showPaused(ch);

  // T18: reduced motion does not get a silent still under a headline claiming
  // the thing is running. That is the same contradiction T6 exists to prevent,
  // reached by a different route — and it is worse here, because a refusal is
  // the browser's decision while this one would be ours. So the chapter takes
  // the paused state: the copy tells the truth, and the control is there for a
  // reader who wants to opt in to six seconds of motion.
  if (RM) {
    v.pause();
    return showPaused(ch);
  }

  // A source that 404s rejects here too, which is why the missing-clip and the
  // refused-autoplay cases need only one branch between them.
  const started = v.play();
  if (started && started.catch) started.catch(refusal(ch));
}

/* Not every rejection is a refusal. Calling pause() while play() is still
 * pending aborts it, and an AbortError means the visitor scrolled away
 * mid-load, not that the browser said no. Treating the two the same puts
 * "It is already built" and a play button on a chapter that was about to
 * play perfectly well.
 */
function refusal(ch) {
  return (err) => {
    if (err && err.name === "AbortError") return;
    showPaused(ch);
  };
}

document.querySelectorAll("video[id]").forEach((v) => {
  const ch = v.closest(".ch");
  if (!ch) return;
  // A source that fails AFTER play() resolved never rejects that promise, so
  // the element's own error event is the second way into the paused state.
  v.addEventListener("error", () => showPaused(ch), true);
  // And `playing` is the way out of it. Clearing on the event rather than on
  // the play() promise means the copy corrects itself however playback
  // started, and does not depend on a promise that a backgrounded tab can
  // abort out from under it.
  v.addEventListener("playing", () => clearPaused(ch));
});

document.querySelectorAll(".playctl").forEach((btn) => {
  btn.addEventListener("click", () => {
    const ch = btn.closest(".ch");
    const v = ch && document.getElementById(ch.dataset.video);
    if (!v) return;
    v.play().then(() => clearPaused(ch)).catch(refusal(ch));
  });
});

/* ── the download button ──────────────────────────────────────────────────
 * D5: absent on chapter I so the opening shot stays clean, present from its
 * `data-from` chapter onward so nobody who is sold at chapter III has to hunt.
 */
const dl = document.querySelector(".dl");
const dlAt = dl ? chapters.findIndex((c) => c.id === dl.dataset.from) : -1;
let dlShown = false;

function updateDownload(ch) {
  if (!dl || dlShown || dlAt < 0) return;
  if (chapters.indexOf(ch) < dlAt) return;
  // Once shown it stays for the rest of the scroll. A button that flickers back
  // out when you scroll up reads as a bug, not as choreography.
  dl.classList.add("show");
  dlShown = true;
}

/* ── the observer ─────────────────────────────────────────────────────────
 * Armed on load, not at parse time. Before layout settles the sections have no
 * height, every one of them "intersects", and the last delivered entry wins the
 * rail — which is how the prototype marked chapter V current on a page sitting
 * at chapter I.
 */
/* ── landing (E4a) ────────────────────────────────────────────────────────
 * The rail links are anchors, the coda link is #fine, and the site has a
 * canonical URL, so people arrive partway in: from a shared link, from a
 * reopened tab, from the back button. Four ways that can go, and all four have
 * to look deliberate on the first frame.
 *
 * What this does NOT do: rewrite the URL as you scroll, and touch
 * history.scrollRestoration. Both were considered and declined. Stepping the
 * back button through chapters means fighting scroll restoration and the
 * proximity snap phones get, in exchange for a gesture nobody asked for.
 */
const coda = document.getElementById("fine");
let landingTarget = null;

function markSeen(ch) {
  ch.classList.add("on");
  if (ch.id === "c2") {
    // Someone who lands past chapter II never watched the gate run. Show it
    // already resolved rather than letting it play later, on its own, behind
    // them. gatePlayed also stops the observer restarting it on the way back up.
    gatePlayed = true;
    resolveGate();
  }
}

/* T3 — chapter I holds one sentence for a beat before the rest arrives.
 *
 * Only when the reader actually starts there. Someone who deep-links to chapter
 * IV is not looking at this, and a beat they never see should not still be
 * running behind them.
 */
const FIRST_BEAT_MS = 1200;

function firstBeat(ch) {
  if (RM) return; // reduced motion gets both beats at once, per T18's direction
  ch.classList.add("beat1");
  setTimeout(() => ch.classList.remove("beat1"), FIRST_BEAT_MS);
}

function land() {
  const raw = decodeURIComponent(location.hash.slice(1));
  const onCoda = !!coda && raw === coda.id;
  // A hash naming nothing on this page falls through to chapter I, same as no
  // hash at all. The browser has already given up on scrolling to it; the rail
  // and the ring must not be left unset as well.
  const target = onCoda ? chapters[chapters.length - 1] : chapters.find((c) => c.id === raw);
  const start = target || chapters[0];
  if (!start) return;

  // Everything up to and including the landing chapter counts as seen, so their
  // reveals do not queue up and replay as an animation when you scroll back up.
  chapters.slice(0, chapters.indexOf(start) + 1).forEach(markSeen);
  if (onCoda) coda.classList.add("on");

  aimRing(start);
  updateDownload(start);
  setCurrent(onCoda ? coda.id : start.id);
  if (start === chapters[0] && !onCoda) firstBeat(start);

  if (raw && (target || onCoda)) {
    // Arrive on the frame, not on the way to it. The reel animates every other
    // move it makes; arriving is not a move.
    landingTarget = onCoda ? coda : start;
    landingTarget.scrollIntoView({ block: "start", behavior: "auto" });
  }
}

function arm() {
  // Re-assert the landing position now that images have their dimensions.
  // land() runs before load, which is what puts the rail, the ring and the
  // seen-state right on the FIRST frame — but the scroll it computes there is
  // against a layout that has not settled, and lands short. Deep-linking to the
  // coda used to leave the rail on chapter V for exactly that reason.
  if (landingTarget) landingTarget.scrollIntoView({ block: "start", behavior: "auto" });

  // THE DEEP LINK WINS UNTIL THE READER MOVES. Re-asserting the scroll is not
  // enough on its own: the layout keeps settling as images get their dimensions,
  // and #get crosses 0.75 a beat AFTER #fine has already been marked current, in
  // a later callback that the per-batch ranking below cannot see. The rail then
  // says "The ship" on a page the reader opened at "Everything it does".
  //
  // Someone who asked for #fine is on #fine. Hold that until they actually move.
  // Release on a CHANGED scroll position rather than on a scroll event: the
  // scrollIntoView above dispatches an event of its own at the next frame
  // boundary, so a plain listener - even one armed a frame late - cancels the
  // hold with our own scroll before the reader has touched anything.
  let landingHold = Boolean(landingTarget);
  if (landingTarget) {
    setCurrent(landingTarget.id);
    const landedAt = reel.scrollTop;
    reel.addEventListener(
      "scroll",
      () => { if (reel.scrollTop !== landedAt) landingHold = false; },
      { passive: true },
    );
  }

  // The coda is a document, not a full-viewport scene, so it can be taller than
  // the viewport and never reach the chapters' threshold. It gets its own floor,
  // or the rail's "Everything it does" entry never lights up.
  const reached = (e) => e.intersectionRatio >= (e.target === coda ? 0.2 : 0.75);

  // ONE winner per batch, not one call per entry. #get and #fine are adjacent,
  // so a deep link to #fine crosses both thresholds and both arrive in the SAME
  // callback; the old code called setCurrent for each, and whichever sat last in
  // the array won. IntersectionObserver does not promise document order, so the
  // rail landed on "The ship" instead of "Everything it does" about half the time.
  //
  // Ranked by e.time first, NOT by ratio. A batch can carry a stale entry for a
  // section that crossed 0.75 earlier during the jump, and that entry's ratio can
  // be higher than the ratio of the section actually being landed on. The most
  // recent crossing is the one that describes where the reader now is. Document
  // order breaks a tie, so between two states read at the same instant the lower
  // section wins - that is the one being scrolled into.
  const order = new Map(chapters.map((ch, i) => [ch, i]));
  if (coda) order.set(coda, chapters.length);
  const later = (a, b) => a.time !== b.time
    ? a.time > b.time
    : (order.get(a.target) ?? -1) > (order.get(b.target) ?? -1);

  const io = new IntersectionObserver(
    (entries) => {
      let current = null;
      entries.forEach((e) => {
        const ch = e.target;
        if (e.isIntersecting && reached(e)) {
          ch.classList.add("on");
          if (!current || later(e, current)) current = e;
          if (ch !== coda) {
            aimRing(ch);
            updateDownload(ch);
            if (ch.id === "c2") restThenPlayGate();
          }
          playVideo(ch, true);
        } else if (!e.isIntersecting) {
          if (ch.id === "c2") cancelRest();
          // Only stop when the chapter has actually left, not merely when it
          // dips under the reveal threshold. A chapter at 0.6 is still on
          // screen and its clip should keep running; pausing on every dip also
          // aborts a play() that is still resolving, which is how pressing the
          // recovery control used to load the video and then stop it again.
          playVideo(ch, false);
        }
      });
      if (current && !landingHold) setCurrent(current.target.id);
    },
    { threshold: [0, 0.2, 0.5, 0.75, 0.9], root: reel }
  );

  chapters.forEach((ch) => io.observe(ch));
  if (coda) io.observe(coda);
}

/* T16 — the gate waits until the chapter has settled.
 *
 * playGate() latches on first call, so without this a reader flicking past
 * chapter II spends the latch on an animation nobody watched: they arrive back
 * later to a gate that is already finished, having seen none of it happen. Four
 * hundred milliseconds is long enough to distinguish passing through from
 * stopping to look, and short enough that stopping to look never feels like
 * waiting.
 */
const REST_MS = 400;
let restTimer = null;

function restThenPlayGate() {
  if (gatePlayed || restTimer) return;
  restTimer = setTimeout(() => {
    restTimer = null;
    playGate();
  }, REST_MS);
}

function cancelRest() {
  if (restTimer) clearTimeout(restTimer);
  restTimer = null;
}

/* T10 — the keyboard.
 *
 * Arrow keys move a chapter at a time rather than a line at a time. This is not
 * decoration: `scroll-snap-type: mandatory` means a native arrow press nudges
 * the container a few pixels and the snap drags it straight back, so without
 * this the arrows appear broken. Home and End reach the ends, which is a long
 * way to hold a key otherwise.
 */
function keyboardNav() {
  const sections = coda ? [...chapters, coda] : chapters;

  addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

    const at = sections.findIndex((s) => s.id === currentId);
    let want = null;
    if (e.key === "ArrowDown" || e.key === "PageDown") want = at + 1;
    else if (e.key === "ArrowUp" || e.key === "PageUp") want = at - 1;
    else if (e.key === "Home") want = 0;
    else if (e.key === "End") want = sections.length - 1;
    if (want === null) return;

    const target = sections[Math.max(0, Math.min(sections.length - 1, want))];
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ block: "start", behavior: RM ? "auto" : "smooth" });
  });

  // Tabbing to a control in an off-screen chapter makes the browser scroll it
  // into view its own way, which lands the snap container between two snap
  // points and leaves the reader looking at two half chapters. Finish the move
  // deliberately instead.
  if (reel) {
    reel.addEventListener("focusin", (e) => {
      const sec = e.target && e.target.closest && e.target.closest(".ch, .coda");
      if (!sec || sec.id === currentId) return;

      // AFTER the browser's own scroll, not during it. Focusing an off-screen
      // control makes the browser scroll it into view smoothly and stop wherever
      // that control happens to sit — measured 675px past the chapter's top,
      // because the control is near its bottom. Correcting on the next frame
      // loses: the animation is still in flight and carries on over the top.
      const settle = () => {
        reel.style.scrollBehavior = "auto";
        sec.scrollIntoView({ block: "start" });
        reel.style.scrollBehavior = "";
      };
      if ("onscrollend" in reel) reel.addEventListener("scrollend", settle, { once: true });
      else setTimeout(settle, 350);
    });
  }
}

/* T9 — how much film is left, for the phone that has no rail.
 *
 * This is a scroll listener, which E4 did not forbid: what E4 declined was
 * rewriting the URL as you scroll. Reading the position to draw two pixels is a
 * different thing. Passive and rAF-guarded so it never blocks the gesture it is
 * measuring.
 */
function trackProgress() {
  const bar = document.querySelector("#progress span");
  if (!bar || !reel) return;
  let queued = false;
  const draw = () => {
    queued = false;
    const travel = reel.scrollHeight - reel.clientHeight;
    bar.style.width = (travel > 0 ? (reel.scrollTop / travel) * 100 : 0) + "%";
  };
  reel.addEventListener(
    "scroll",
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(draw);
    },
    { passive: true }
  );
  draw();
}

buildRail();
trackProgress();
keyboardNav();
land();
if (document.readyState === "complete") arm();
else addEventListener("load", arm);
