> **Note:** This file was converted from `predeployPHYSIS.txt` to Markdown (`predeployPHYSIS.md`) for richer task formatting (checkboxes, links). It remains the source of truth for release planning and README changelog sync.

++**Large "full-version" updates**++

- [ ] add XR images from CHP database → see [README](data/atlas/xr/README.md)
- [x] make TW3 workflow pages more closely resemble mock-up images
- [ ] Make, finalize and add PHYSIS CALC logo
- [ ] Google analytics to optimize search functioning and reach
- [ ] Get full cohort of pre-test data from RedCAP (PES survery dispersal)
- [x] fix bone age calculator for improved speed for scoring (slide bar, image loading, layout, etc)
- [ ] Add RedCAP (post-test) QR code at TW3/APH pages for data gathering

++**Moderate Updates, ie. new Calculators and Tools, ("y" of v0.y.x)**++

- [ ] consider tools/ references from TSPED's [ceddcozum](https://www.ceddcozum.com/):  
  - [ ] GH dosing calculator tool
  - [ ] IGF1/BP3 Z-score SDS tables  (Heliyon, Roche, Esoterix:  in /references). 
  - [ ] long-acting GH IGF1 intrepretation tool based on time of injection and IGF1 lab draw (include brand name and generic name)
  - [ ] anthropometric measurements (X0, achrondroplasia, etc)
  - [ ] Calcium salt <> elemental Ca conversion/ dosing tool
  - [ ] insulin resistance tools (HOMA-IR, QUICKI, and Glucose/Insulin)
  - [ ] T/DHT ratio and intrep, T/Δ4A ratio and intrep
  - [ ] Uterine/ov normative values [10.1007/s00247-019-04419-z](https://doi.org/10.1007/s00247-019-04419-z) 
- [ ] Elemental Calcium Calculator (salt <> elemental based, and dosage calculator)
- [ ] Consider tools from [EndoBora](https://www.endobora.com/?lang=en) 
  - [ ] Diagnostic criteria for PWS, BBS, Cohen Syndrome, Alstrom, Silver-Russel)
  - [ ] Consider guides for SMR/Tanner, Prader scoring, Quigley scoring, Sinnecker Scale, FGS hirsuitism scoring
- [ ] Add ESOTERIX lab values (create as .MD file) as a search tool, and include unit converter tool  
- [ ] Try to make Esoterix Labcorp IGF1 SMS scraper tool, with goal of obtaining LMS data (2.5%, 97.5%, 50% quantiles required)
- [ ] Add UD_radius BMD scoring tool for DXA as well as BMD DXA z-score tool (in /references)
- [ ] Consider better organization of tools/calculators by organ system as roster grows (Dosing/ Labs, Vital Signs, DSD/ Gonad Auxology, Bone, Sodium, Glucose/ Diabetes, Adrenal)

++**Planned Patch Updates, ("x" of v0.y.x)**++

- [x] TW3 navigation patch: make "enter" button for saving score and going to the next landmark
- [ ] Add QC/  "show calculations" as the footer for each tool
- [ ] Add link planned updates (updated each commit/push) and lives on calc.dom site
- [ ] Improve PHYSIS favicon (CALCS okay)
- [x] Improve mobile app TW3 UI by moving TW3 stage slide bar to vertical orientation and below hand XR map.
- [x] Have TW3 scoring tool ordering go: ulna, radius, 1MC, 1PP, 1DP, 35MC, 35PP, 35MP, 35DP
- [ ] Clean up footer text for each calculator to reside as i tooltips, replace footer with relavent references, and also add references to copy-paste output.
- [ ] Confirm copy-paste functionality for each calculator
- [x] Add back original RWT and send to LG to review
- [x] Add version number and update date to physis below GitHub icons
- [x] Add checklist of missing items for TW3 result cards when on APH page
- [x] Use 0.y.x version nomenclature. Y are medium updates/ new calculators, and X are small updates/ refinements/ fixes
- [x] Edit TW3 copy/paste outflow function to include "via TW3" with BA score, and to also provide raw SMS score, and to put citation on new line
- [x] imbed cm/in toggle into user input text box where it is a separate row (ie. AAP BP) 
- [x] Add link in PHYSIS to GitHub (github icon) for feature requests/ bug reporting (bug-icon)
- [x] Make names of BSA formulas chosen: Costeff (kg only) and Haycock (true BSA) more readily available, including equations for both
- [x] Confirm gonad auxology graphing logic works for all 3 tools (SPL and clitoral dimensions)
- [x] manually remake cropped stage images from original scans
- [x] Add original RWT to the adj RWT for available APH estimation methods
  - [x] Make it so once bone age is input, Khamis-Roche is removed as an output method.
- [x] Go through at make sure footer text is embedded as i tooltips or citations
- [x] consider steroid functionality from [molony](https://molonych-source.github.io/steroid-wean-calculator-/): calculate current mg/m2/day equili then allow for X percent wean plan from current supraphysiologic (using current steroid or HCT) to stress dosing, followed by standard wean to off.
- [x] Refine steroid wean equal-preferred PO dosing, anesthesia rounding, transition mg/day+mg/m² display, and short wean-only HCT clinical copy

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