> **Note:** This file was converted from `predeployPHYSIS.txt` to Markdown (`predeployPHYSIS.md`) for richer task formatting (checkboxes, links). It remains the source of truth for release planning and README changelog sync.

++**Larger Tasks for prior to v1.0 Push/ full version updates**++

- [ ] add XR images from CHP database → see [README](data/atlas/xr/README.md)
- [x] make TW3 workflow pages more closely resemble mock-up images
- [ ] Make, finalize and add PHYSIS CALC logo
- [ ] Google analytics to optimize search functioning and reach
- [ ] Get full cohort of pre-test data from RedCAP (PES survery dispersal)
- [x] fix bone age calculator for improved speed for scoring (slide bar, image loading, layout, etc)
- [ ] Add RedCAP (post-test) QR code at APH/CDC page for user input

++**Smaller sub-version updates ("x" of v0.y.x), complete during BETA phasing**++

- [x] Add back original RWT and send to LG to review
- [x] Add version number and update date to physis below GitHub icons
- [ ] Add UD_radius BMD scoring tool for DXA as well as BMD DXA z-score tool
- [x] Add checklist of missing items for TW3 result cards when on APH page
- [x] Use 0.y.x version nomenclature. Y are medium updates/ new calculators, and X are small updates/ refinements/ fixes
- [x] Edit TW3 copy/paste outflow function to include "via TW3" with BA score, and to also provide raw SMS score, and to put citation on new line
- [x] imbed cm/in toggle into user input text box where it is a separate row (ie. AAP BP) 
- [x] Add link in PHYSIS to GitHub (github icon) for feature requests/ bug reporting (bug-icon)
- [x] Make names of BSA formulas chosen: Costeff (kg only) and Haycock (true BSA) more readily available, including equations for both
- [x] Confirm gonad auxology graphing logic works for all 3 tools (SPL and clitoral dimensions)
- [ ] Confirm copy-paste functionality for each calculator, with inclusion of references if necessary.
- [ ] manually remake cropped stage images from original scans
- [x] Add original RWT to the adj RWT for available APH estimation methods
  - [x] Make it so once bone age is input, Khamis-Roche is removed as an output method.
- [x] Go through at make sure footer text is embedded as i tooltips or citations
- [ ] steroid functionality to add inspired from [molony](https://molonych-source.github.io/steroid-wean-calculator-/): calculate current mg/m2/day equili then allow for X percent wean plan from current supraphysiologic (using current steroid or HCT) to stress dosing, followed by standard wean to off.

++**Calculators and Tools to Add/ Consider during BETA phasing as a "y" update (v0.y.x)**++

- [ ] consider adding features/ references from TSPED's website [ceddcozum](https://www.ceddcozum.com/):  
  - [ ] GH dosing calculator tool
  - [ ] IGF1/BP3 SDS tables
  - [ ] long-acting GH IGF1 intrepretation tool, 
  - [ ] anthropometric measurements (X0, achrondroplasia, etc)
  - [ ] Calcium salt <> elemental Ca conversion/ dosing tool
  - [ ] insulin resistance tools (HOMA-IR, QUICKI, and Glucose/Insulin)
  - [ ] T/DHT ratio and intrep, T/Δ4A ratio and intrep
  - [ ] Uterine/ov normative values [10.1007/s00247-019-04419-z](https://doi.org/10.1007/s00247-019-04419-z) 

- [ ] Elemental Calcium Calculator (salt <> elemental based, and dosage calculator)
- [ ] Add ESOTERIX lab values (create as .MD file) as a search tool, and include unit converter tool  
- [ ] IGF1 LMS/SMS (Z-score) calculator (Heliyon, Roche, Esoterix:  in /references). 
- [ ] Esoterix Labcorp IGF1 SMS scraper tool, obtain LMS data (2.5%, 97.5%, 50% quantiles required)
- [ ] time-based IGF1 intrepretation calculator for long-acting GH

++**Historic CHANGELOG (tasks no longer moved to this section upon completion since v0.16**++

- [x] Re-hash TRP calculator to be interchangeable with Ca-Clearance Ratio and UCa/Cr ratio (by requesting all data points then giving all results)
- [x] Add interpretation tooltips based on results for TRP, spot UCa/UCr, and CCR
- [x] Re-hash A1c<>fructosamine etc calculator by having all inputs present and user filling in one of the text boxes, then calculator fills in remaining results.
- [x] PedsEndo (PES) equation sheet
- [x] Add random spot UCa/Cr ratio calculator with interpretation tooltip
- [x] Make SPL calculator (Halil et al. 2017;59(3)269-273) --> also add OE reference
- [x] Make clitoral len/wid for neonates (Alaei, et al: 2020; 11:297)
- [x] SPL-premie, SPL-child, and clitoral-normogram
- [x] convert TW3 stage description text to .md files
- [x] added auto-push update function every midnight.
- [x] MDI to ISS conversion
- [x] Avg glucose <> fructosamine <> A1c
- [x] mIVF calculations
- [x] Ca correction with albumin
- [x] Add to sodium calculations that "sNA should only rise by 0.5-1mEq/L per hours and < 10-12 mEq/L over first 24 hours
- [x] Free water deficit
- [x] Na correction for hyponatremia
- [x] Na correction with glucose
- [x] Pediatric age-based HTN guideline calculator
- [x] CAH screening tool based on 17OHP and prematurity
- [x] Add steroid wean calculator/ converter
- [x] Make BSA calculator, add HY pediatric ones, and also add JW's kg-only BSA
- [x] Add GIR calculator (both enteral/IV)
- [x] change standing/supine heights and other FYI information to "i: tooltips that only show on hover to make UI cleaner
- [x] make ability for user to copy outputs for charting purposes and set parameters to of what is copied (include references to algorithms and TW3 atlas)
- [x] Add TW3 APH calculator from paper (with optional MPH adjustment, and optional menarche slider)
- [x] fix age input so it stops auto-adding decimal and zeros until user clicks away
- [x] give inspiratoin accrediation to /eatyourpeas/endocrinologist but mention that PHYSIS CALC is a separate app built from scratch
- [x] fix age inputs auto adding zeros for QOL
- [x] fix CDC plotting logic
- [x] add ability to calculate MPH within app (and differentiate between true MPS and parent average height)
- [x] add CDC growth charts for app to plot height/ CA and BA/APH to show difference in trajectories
- [x] remove original RWT and replace with Khamis-Roche method
- [x] QC step → Core logic lives in src/core/showWork/buildShowWorkReport.ts; UI in src/components/ShowWorkSection.tsx.