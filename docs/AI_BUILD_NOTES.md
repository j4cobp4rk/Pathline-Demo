# AI-assisted development: prompts, pushback, and verification

This file describes the AI-assisted prototype build. **The user-facing product does not run an LLM.** All work-evidence suggestions are deterministic example logic.

## Product-first prompting strategy

Rather than "build me a job board," the instructions pinned down the wedge, the product signal, the two-sided connection, and what not to build.

**Representative implementation prompt:**

> Build a polished and deployable candidate-side Pathline prototype for career switchers. Start with guided problem/action/outcome storytelling and suggest transferable skills. Preserve exactly which evidence the candidate selects. Show salary, evidence-backed requirements, and unknown gaps. Require candidate interest, then a reviewer-controlled simulated recruiter acceptance before messaging. Five clearly fictional roles, no fabricated traction, no real backend, responsive visual design.

**Representative test prompt:**

> Run the flow from a fresh candidate to a submitted introduction, switch to the simulated recruiter, accept, and send a message. Verify no runtime errors, no mobile overflow, and that a submitted work card is the same one the recruiter reviews.

## What worked

1. Defining a single candidate story (Maya: Customer Success → Product Management) made screens and data coherent.
2. Using a consistent *Proof-of-Work Card* entity across onboarding, matching and recruiter review clarified the product signal.
3. Building one complete interaction with state transitions produced a stronger artifact than designing unrelated beautiful screens.
4. Explicit sample-data and simulation badges kept the demo credible.

## Where I pushed back on AI-generated suggestions

- **Avoid unexplained match percentages.** Show each job requirement, the candidate's underlying source evidence, and unproven gaps instead.
- **Don't overstate extracted skills.** The initial heuristic surfaced a broad set of possible skills; the sample defaults were narrowed to four strongly evidenced capabilities and made user-editable.
- **Don't auto-accept for the fake recruiter.** Require the reviewer to change perspective and explicitly click **Invite to connect**.
- **Don't make the marketplace look "thriving" using fictitious traction.** The fictional roles and employer are plainly labeled, and there are no made-up applicant counts, ratings, testimonials or hiring successes.
- **Don't let edited profiles silently rewrite submissions.** Save an immutable local snapshot of the proof at the moment of candidate interest.
- **Don't add a complex backend because it seems impressive.** Local state and sample data are enough to test the intended flow.

## Technical checks performed

- Syntax-checked JavaScript modules using Node.
- Executed all primary application screens in Chromium using Playwright with injected HTML/CSS/JS and captured desktop/mobile screenshots.
- Tested the flow: career direction → work story → suggestions → dashboard → role detail → interest → pending → recruiter review → acceptance → unlocked conversation → send message.
- Checked browser runtime errors and mobile horizontal overflow.

**Note:** Because third-party package installation was unavailable in the build sandbox, the optional Vite production build wasn't executed here. The code is native browser JavaScript and works in the tested browser environment. Vercel should install Vite and produce `dist` when imported from GitHub; verify the deployed URL before submitting.

## Next iteration

Conduct five candidate interviews and five hiring-manager interviews on the proof-card format. If employers value it, introduce a human-reviewed pilot with secure identity and evidence controls before adding advanced AI suggestions or automated ranking.
