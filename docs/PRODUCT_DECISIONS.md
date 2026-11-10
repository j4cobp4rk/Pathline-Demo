# Product decisions and tradeoffs

## Wedge

**Career switchers**, initially focusing on professionals with real customer-facing or operations accomplishments moving into Product and Product Operations roles. This is narrower than "everyone switching careers" to improve marketplace concentration and credibility.

## Core problem

The transferable-skills visibility gap: candidates struggle to prove that experience from an unfamiliar career translates to an employer's needs; recruiters have little time and limited context to evaluate unconventional backgrounds.

## Unit of signal: Proof-of-Work Card

**Problem → Action → Outcome → Skills selected by the candidate.** Résumés may be used for quick import in a later version but do not lead the matching experience.

- **Compared with résumé enhancement:** Less familiar but stronger structured evidence and product differentiation.
- **Compared with tests:** Less standardized but far less candidate burden and avoids unvalidated assessments.
- **Compared with AI narratives alone:** More traceable and auditable; reviewers can read the underlying accomplishment rather than accepting generated persuasion.

## Connection mechanics

**Candidate-initiated interest → recruiter review → recruiter acceptance → messaging.** This prioritizes candidate agency and recruiter time. A mutual invitation requires a small amount of extra friction; cold start means activity will initially be thin. We do not manufacture acceptance with a timer.

Alternative: employer-initiated reach-out feels affirming but depends on employer attention and risks repeat search-title bias. Alternative: automatic introductions can reveal unexpected candidates but can create unsolicited contacts and implies unvalidated matching accuracy.

## Transparency policy

- Salary, location and work arrangement always visible before expressing interest.
- For every job requirement, show candidate evidence or "not yet evidenced". Never infer that a missing example proves lack of ability.
- Candidate selects the proof shared at interest submission. Before acceptance, the reviewer sees a private candidate ID, not a name.
- Submitted work evidence is snapshotted for consistency.
- Reverse references, skills verification, and actual identity checks postponed until a pilot.

## Explicitly not building

| Excluded | Rationale | Consequence |
| --- | --- | --- |
| Automated / one-click mass applying | Would reproduce low-signal application volume | Smaller top-of-funnel; more deliberate submissions |
| Full AI matching model | No trusted outcomes dataset; risks opaque, unfair claims | Small heuristic prototype, cannot prove ranking quality |
| Skills assessments / tests | Introduces candidate friction, takes validation to be meaningful | Recruiters must inspect self-reported proof |
| Production backend and auth | Not needed to demonstrate one end-to-end connection | No cross-user synchronization or real hiring workflow |
| Full ATS / analytics dashboard | Huge scope, little value for core hypothesis | Limited recruiter workflow |
| Anonymous talent market browsing at scale | Marketplace cold-start + privacy risks | Candidate's name withheld only until mutual interest |
| Reverse references | Consent, employment verification, bias concerns | Evidence remains candidate-reported |
| Expansive jobs database | Low liquidity with generic breadth | Five curated, fully labeled fictional roles |

## Cold start without lying

Use one sample career switcher, five fictional companies with realistic but clearly illustrative pay ranges, and one reviewer-controlled recruiter acceptance flow. No fake application counts, employer logos, testimonials, placement metrics or real-user claims.

For a real launch, recruit a small consenting candidate cohort and hiring partners, curate matches manually, then measure how often employers would interview candidates based on proof instead of title alone.

## Desired outcome and test

**North-star metric** for future pilots: evidence-based mutual introductions that result in interviews.

Test: hold candidate quality constant, let hiring managers evaluate a traditional résumé-only view versus a concise proof-first view, then measure interview consideration, evaluation time, and qualitative confidence. Consider sample bias and fairness. Validate neither model is unfairly disadvantaging groups.

## Update: Inclusive proof-of-work templates

We replaced a universal Problem → Action → Outcome prompt with four experience-specific guided templates. Requiring measurable project outcomes creates a structural disadvantage for teachers, care workers, administrators and other professionals whose capabilities are demonstrated through recurring responsibilities and relationships. The recruiter-facing evidence remains consistent, and recruiters still see the candidate's own words, gaps and selected skills. This is a product design prototype, not an independent credential verification service.
