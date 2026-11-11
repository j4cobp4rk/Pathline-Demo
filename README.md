# Pathline — Proof-first career transitions

A polished, **Vercel-ready clickable prototype** for a career-switcher-first hiring marketplace.

> **The problem:** A professional's past job title can obscure capabilities relevant to a new career. Candidates struggle to demonstrate transferable skills, and recruiters lack the time and evidence to evaluate unconventional backgrounds.
>
> **The product bet:** Make a concrete work accomplishment—not a résumé keyword—the first-class hiring signal.

![Pathline desktop welcome screen](docs/screenshot-welcome.png)

## How to run

**Recommended local development (Vite):**

```bash
npm install
npm run dev
```

Open the local URL Vite prints (normally `http://localhost:5173`).

**Production build:**

```bash
npm run build
npm run preview
```

The app has **no backend, no API keys, and no real user accounts**. For an entirely dependency-free local run, use `python3 -m http.server 8000` in the repository root, then open `http://localhost:8000` (the app uses native browser JavaScript modules).

## Deploy to Vercel (GitHub method)

1. Put the files in a new GitHub repository. The project root is this directory, containing `index.html`, `package.json`, `vercel.json`, `src/`, and `public/`.
2. Go to [vercel.com/new](https://vercel.com/new) and choose **Import Git Repository**.
3. Vercel should detect **Vite**. Verify:
   - Framework: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `/`
4. Deploy. Your actual `*.vercel.app` URL will be supplied by Vercel.
5. In a private/incognito browser window, start from the welcome page and complete the flow below.

No environment variables are required. `vercel.json` includes an SPA fallback.

You can also use `vercel` from Vercel CLI after linking and logging in, but Git-based deployment is easier to hand off.

## The 4-minute reviewer walkthrough

1. **Choose your direction.** Start as Maya Chen, a Customer Success Manager moving into Product Management. Click **Build my proof**.
2. **Tell one real work story.** Review the sample onboarding accomplishment (problem → action → outcome). Edit it if desired. Click **Find transferable skills**.
3. **Confirm your evidence.** Pathline proposes transferable skills. Deselect one to see that you stay in control. Click **Save my proof**.
4. **Explore the marketplace.** Open **Associate Product Manager at Northstar Labs**. Read which requirements your evidence supports and which remain unproven. Salary is visible upfront.
5. **Send intentional interest.** Select the Proof-of-Work Card to share and review the introduction. Click **Send interest**.
6. **Switch to the employer perspective.** Click **Open recruiter demo**. The recruiter sees anonymous, evidence-backed candidate information and qualification gaps. Click **Invite to connect**.
7. **Experience the connection.** The app unlocks messaging only after the reviewer explicitly accepts as the simulated recruiter. Send a message.

**Reset for another reviewer:** Select **Reset experience** in the footer or sidebar. The application also preserves progress locally if you refresh the same browser tab.

For talking points, see [Demo script](docs/DEMO_SCRIPT.md).

## Product decisions in this prototype

| Decision | Choice | Why |
| --- | --- | --- |
| Initial wedge | Career switchers, demonstrated through Customer Success → Product Management | One concrete, high-context transition is more credible than a universal marketplace |
| Primary unit of signal | Proof-of-Work Card: problem → personal action → outcome → transferable skills | Makes abilities interpretable across previous job titles |
| Résumé | Not required to match; may be added later as onboarding convenience | Avoids re-creating a résumé-first experience |
| Initiation | Candidate expresses interest; recruiter accepts/declines | More intentional than mass applying or unsolicited outreach |
| Transparency | Salary shown; source evidence and unproven requirements shown; identity concealed in recruiter preview | Enables informed decisions and candidate control |
| Cold start | Five **fictional, explicitly labeled** jobs; one example candidate; reviewer-controlled recruiter simulation | Demonstrates the value without inventing real traction |
| Scope | No full AI matching model, ATS, skills assessments, mass applications, real messaging backend | Invest in validating the crucial evidence → recruiter consideration → introduction interaction |

See [Product decisions and tradeoffs](docs/PRODUCT_DECISIONS.md) for the complete rationale.

## How the matching works

This is **not a live AI matching engine**. The JavaScript function `inferSkills` in `src/engine.js` looks for transparent keywords in the candidate's self-reported story and proposes corresponding skills. The candidate explicitly confirms each skill. Job requirements show as **supported** only when one of the **selected** skills is associated with a saved work story; everything else is presented as **not yet evidenced**, not as proof of disqualification.

The employer receives a **snapshot of the exact Proof-of-Work Cards selected at submission**, ensuring subsequent edits cannot silently change previously submitted evidence.

## Implementation

- Browser-native JavaScript modules (`src/app.js`, `src/data.js`, `src/engine.js`) with semantic HTML and responsive CSS.
- Vite for production bundling / local development; compatible with Vercel static hosting.
- Client-side state persisted in `localStorage` in the same browser.
- Fictional data from `src/data.js` (all sample companies and people are illustrative).
- Basic HTML escaping for user-generated text.
- No real authentication, external APIs, uploads, automatic candidate ranking, messages sent to others, or server storage.

**Why this lightweight implementation instead of a production React/TypeScript backend:** the review measures the quality of a clickable experience and PM decisions; avoiding framework churn or fake backend dependencies gives the team a reliable, reviewable prototype. The same UI concepts and data model can be migrated to React and a database after validating real employer demand.

## Known limitations / honest disclosure

- A simulated recruiter decision is made by the reviewer clicking **Invite to connect** in the recruiter demo, not by a real employer.
- Companies, salaries, user stories, recruiter messages, and roles are sample data.
- Matching is a rule-based demo heuristic, not a validated or fair hiring prediction. A recruiter should always review qualifications independently.
- Candidate achievements are self-reported; the prototype does not independently verify employment, identity, or outcomes.
- Local storage does not sync between users or devices and is unsuitable for personal hiring data in production.
- The demo is not evidence of marketplace liquidity, hiring outcomes, or product-market fit.

## Suggested next validation step

Run a concierge pilot for Customer Success/Operations → Product/Product Operations transitions, with opt-in candidates and a small set of hiring managers willing to consider adjacent backgrounds. Compare employer **willingness to review and interview** candidates using standard résumés vs. evidence-backed proof cards. Secondary measures: time-to-evaluate, recruiter confidence, candidate effort, and qualified introduction → interview conversion.

See [AI build notes and prompting approach](docs/AI_BUILD_NOTES.md).

## Flexible experience cards (updated November 2026)

Candidates choose an experience format before entering their evidence:
- **Problem I solved** — projects and improvements
- **People I supported** — teaching, care, customer-facing work
- **Responsibilities I managed** — operations and administrative work
- **Achievement I'm proud of** — creative output, milestones and sales

The questions change to suit each kind of work. Each saved profile and recruiter view still shows a consistent context, personal contribution and supporting evidence (when available). Outcomes and metrics are not required, but context and contribution are. Skills are only suggestions until the candidate selects them. The default Customer Success → PM flow remains available.

Existing demo progress in localStorage is preserved and cards saved under the older format continue to display correctly.

## Optional Education & Credentials (latest iteration)

After saving the first Proof-of-Work Card, the candidate sees an **optional** Education & Credentials step. They can skip it and enter the marketplace immediately, or add an education record, professional certification or license. Items can be edited later under **My proof**.

- A credential records its **type, name, issuer/institution, and optional year**.
- Credential entries are **self-reported**; Pathline does **not verify** them.
- Proof-of-Work remains the primary evidence for skills. Credentials supplement it.
- On **Cedar Health → Product Insights Analyst** (a fictional example), the employer defines one illustrative required credential, *Google Analytics Certification*. The job detail explains whether the candidate has provided it. No credential entry is required to continue applying; not provided means unknown, not unqualified.
- On the interest screen, a candidate must explicitly opt in before credential details are shared. The recruiter view receives an application-time snapshot, not the private profile by default.
- All data remains in browser local storage. No live employer, verification provider, or backend is contacted.

Run `node test-credentials.mjs` to verify onboarding skip/add paths, job credential disclosures, consent-based sharing and recruiter visibility.
