> **Note:** This file was converted from `predeployPHYSIS.txt` to Markdown (`predeployPHYSIS.md`) for richer task formatting (checkboxes, links). It remains the source of truth for release planning and README changelog sync.

Larger Tasks for Final Push:

- [ ] add XR images from CHP database → see [README](data/atlas/xr/README.md)
- [ ] make TW3 workflow pages more closely resemble mock-up images
- [ ] Make, finalize and add PHYSIS CALC logo
- [ ] Google analytics to optimize search functioning and reach
- [ ] Get full cohort of pre-test data from RedCAP (PES survery dispersal)

Small Tasks

- [ ] Edit TW3 copy/paste outflow function to include "via TW3" with BA score, and to also provide raw SMS score, and to put citation on new line
- [ ] Add RedCAP (post-test) QR code at APH/CDC page for user input
- [ ] imbed cm/in toggle into user input text box where it is a separate row (ie. AAP BP) 
- [ ] Add link in PHYSIS to GitHub (github icon) for feature requests/ bug reporting (bug-icon)
- [x] Make names of BSA formulas chosen: Costeff (kg only) and Haycock (true BSA) more readily available, including equations for both
- [ ] Confirm gonad auxology graphing logic works for all 3 tools (SPL and clitoral dimensions)
- [ ] Make sure every calculator includes references if indicated, and copy-paste functionality, if necessary.
- [ ] fix bone age calculator for improved speed for scoring (slide bar, image loading, layout, etc)
- [ ] manually remake cropped stage images from original scans
- [ ] Add original RWT to the adj RWT for available APH estimation methods
  - [ ] Make it so once bone age is input, Khamis-Roche is removed as an output method.
- [ ] Go through at make sure footer text is embedded as i tooltips or citations
- [ ] consider adding features/ references from TSPED's website: [ceddcozum](https://www.ceddcozum.com/)
- [ ] consider adding features to steroid wean calculator using inspiration from: [molony](https://molonych-source.github.io/steroid-wean-calculator-/)

Calculators and Tools to Add/ Consider:

- [ ] Elemental Calcium Calculator (salt <> elemental based, and dosage calculator)
- [ ] Add ESOTERIX lab values (create as .MD file) as a search tool, and include unit converter tool  
- [ ] IGF1 LMS/SMS (Z-score) calculator (Heliyon, Roche, Esoterix:  in /references). 
- [ ] Esoterix Labcorp IGF1 SMS scraper tool, obtain LMS data (2.5%, 97.5%, 50% quantiles required)
- [ ] time-based IGF1 intrepretation calculator for long-acting GH

CHANGELOG:

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