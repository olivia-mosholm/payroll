// Curated Danish → English translation map.
//
// The Translator walks the DOM and replaces text nodes / placeholder
// attributes whose trimmed content matches a key here. The pairs are
// derived from src/data/danishCopy.ts plus a few hardcoded strings
// found in components (page titles, landing copy, prototype metadata).
//
// To translate back (en → da) we invert the map at runtime. That means
// each English value must be unique within this object — if two Danish
// strings map to the same English string, reversing would be lossy.
// In practice the duplicates we have are intentional ("Annullér" appears
// in many sections, all → "Cancel"), and reversing always picks the
// canonical form, which is fine for a prototype.

export const danishToEnglish: Record<string, string> = {
    // --- Browser title ---------------------------------------------------
    'Brugertest - e-conomic': 'User testing - e-conomic',

    // --- Landing page ---------------------------------------------------
    Prototyper: 'Prototypes',
    'Hub for brugertest og iterationer over e-conomic Løn-flows.':
        'Hub for user testing and iterations of e-conomic Payroll flows.',
    'Hver variant nedenfor er en kørbar prototype. Del linket direkte med en tester, eller åbn den selv.':
        'Each variant below is a runnable prototype. Share the link with a tester, or open it yourself.',
    'Aktive prototyper': 'Active prototypes',
    Versioner: 'Versions',
    'Antagelser vi tester': 'Assumptions we are testing',
    'Åbn prototype': 'Open prototype',
    'Brugertest · prototyper': 'User testing · prototypes',
    'e-conomic Løn · brugertest-hub for prototyper':
        'e-conomic Payroll · user-testing hub for prototypes',

    // Screen-share guide
    'Del skærm i Google Meet': 'Share screen in Google Meet',
    'Hurtig guide til moderator': 'Quick guide for the moderator',
    'Tilslut dig Google Meet-mødet.': 'Join the Google Meet meeting.',
    'Klik på "Præsentér nu" i bunden af mødet.':
        'Click "Present now" at the bottom of the meeting.',
    'Vælg "Et faneblad" (anbefales — skarpere kvalitet og lyd).':
        'Choose "A tab" (recommended — sharper quality and audio).',
    'Vælg fanen med prototypen, og klik "Del".':
        'Pick the tab with the prototype and click "Share".',
    Tilbage: 'Back',
    Næste: 'Next',
    'Tip: åbn prototypen i sin egen Chrome-fane før mødet for hurtigere deling.':
        'Tip: open the prototype in its own Chrome tab before the meeting for faster sharing.',
    // Strings rendered inside the SVG illustrations
    'Tilslut nu': 'Join now',
    'Præsentér nu': 'Present now',
    'Vælg hvad du vil dele': 'Choose what to share',
    'Hele skærmen': 'Entire screen',
    'Et vindue': 'A window',
    'Et faneblad': 'A tab',
    'Vælg et faneblad, du vil dele': 'Choose a tab to share',
    'Gmail — Indbakke (4)': 'Gmail — Inbox (4)',
    'Figma — e-conomic Løn': 'Figma — e-conomic Payroll',
    Del: 'Share',

    // Card metadata
    Live: 'Live',
    Udkast: 'Draft',
    Arkiveret: 'Archived',
    Flow: 'Flow',
    Version: 'Version',
    Opdateret: 'Updated',
    'Endnu ingen prototyper. Tilføj én ved at oprette en ny route og en post i src/data/prototypes.ts.':
        'No prototypes yet. Add one by creating a new route and a record in src/data/prototypes.ts.',
    '← Tilbage til prototyper': '← Back to prototypes',

    // --- Project metadata (prototypes.ts) -------------------------------
    Migrering: 'Migration',
    'Migrering · v1': 'Migration · v1',
    'Test af upload-flow, AI-forslag og gennemgang af medarbejderudkast ved migrering til e-conomic Løn.':
        'Test of upload flow, AI suggestions and review of employee drafts during migration to e-conomic Payroll.',
    'Drag-and-drop af lønsedler og regneark for automatisk at oprette medarbejderudkast. Rettedialog som fuld side med gul fremhævning af udtrukne felter.':
        'Drag-and-drop payslips and spreadsheets to automatically create employee drafts. Edit dialog as full page with yellow highlighting of extracted fields.',
    Medarbejderoprettelse: 'Employee creation',
    'Bulk-import': 'Bulk import',
    'Fuld side-edit': 'Full-page edit',

    // --- Navigation ------------------------------------------------------
    Hjem: 'Home',
    Salg: 'Sales',
    Regnskab: 'Accounting',
    Rapporter: 'Reports',
    Løn: 'Payroll',
    Oversigt: 'Overview',
    Lønkørsler: 'Payroll runs',
    Arkiv: 'Archive',
    Medarbejder: 'Employee',
    'Alle medarbejdere': 'All employees',
    Medarbejdergrupper: 'Employee groups',
    Feriepenge: 'Vacation pay',
    Indstillinger: 'Settings',
    Virksomhed: 'Company',

    // --- Page title ------------------------------------------------------
    Medarbejdere: 'Employees',

    // --- Empty state -----------------------------------------------------
    'Tilføj din første medarbejder': 'Add your first employee',
    'Træk lønsedler, regneark eller billeder ind i dette område for automatisk at oprette medarbejderudkast.':
        'Drag payslips, spreadsheets or images into this area to automatically create employee drafts.',

    // --- Drop zone -------------------------------------------------------
    'Træk filerne direkte hertil': 'Drag the files directly here',
    eller: 'or',
    'Vælg filer': 'Choose files',

    // --- Actions ---------------------------------------------------------
    'Behandl dokumenter': 'Process documents',
    'Ny medarbejder': 'New employee',
    'Opret manuelt': 'Create manually',
    'Hurtig oprettelse': 'Quick creation',
    Mere: 'More',
    'Ingen handlinger endnu': 'No actions yet',
    Importér: 'Import',
    'Importér fra dokumenter': 'Import from documents',
    'Søg...': 'Search...',
    'Nulstil prototype': 'Reset prototype',
    Fjern: 'Remove',
    Annullér: 'Cancel',

    // --- Scheduled changes -----------------------------------------------
    'Planlagte ændringer': 'Scheduled changes',
    'Planlæg ændring': 'Schedule change',
    'Ny værdi': 'New value',
    'Gælder fra': 'Effective from',
    'DD.MM.ÅÅÅÅ': 'DD.MM.YYYY',
    'Tilføj ændring': 'Add change',
    Gem: 'Save',
    'Ingen planlagte ændringer endnu. Klik på "Planlæg ændring" ved et felt for at tidsstyre en værdi.':
        'No scheduled changes yet. Click "Schedule change" on a field to schedule a value.',
    Planlagt: 'Scheduled',
    'Her kan du tilføje løntyper, som skal indgå i medarbejderens løn. Lønandelene tilføjes automatisk i lønrapporten.':
        'Add the pay types that should be part of this employee’s salary. The components are added automatically to the pay report.',
    'Tilføj løntype': 'Add pay type',

    // --- Processed dialog ------------------------------------------------
    'Kladder klar til oprettelse': 'Drafts ready to create',
    'Kunne ikke læses': 'Could not be read',
    Kladde: 'Draft',
    'Lav scanningskvalitet — prøv et tydeligere billede':
        'Low scan quality — try a clearer image',
    'Prøv igen': 'Try again',
    'Opret kladder': 'Create drafts',

    // --- Import dialog ---------------------------------------------------
    'Hurtig import': 'Quick import',
    'Træk lønsedler, regneark eller billeder ind for at oprette nye medarbejderudkast oven på din eksisterende liste.':
        'Drag payslips, spreadsheets or images in to create new employee drafts on top of your existing list.',
    'Klar til behandling': 'Ready for processing',
    'Hvad sker der nu?': 'What happens now?',
    'Vi læser hver fil, finder navne, CPR og lønforhold, og opretter en kladde pr. medarbejder. Du gennemgår dem inden de bliver aktive.':
        'We read each file, extract names, civil reg. numbers and pay info, and create a draft per employee. You review them before they go active.',
    'Tilføj flere...': 'Add more...',
    'Analyserer dine filer og matcher mod eksisterende medarbejdere...':
        'Analyzing your files and matching against existing employees...',
    'AI matchede dine filer': 'AI matched your files',
    'OPDATERER EKSISTERENDE': 'UPDATING EXISTING',
    'KONFLIKT — VÆLG VÆRDI': 'CONFLICT — PICK A VALUE',
    'OPRETTER NYT UDKAST': 'CREATING NEW DRAFT',
    Kladde: 'Draft',
    'CPR-match': 'Civil reg. match',
    'Navne-match': 'Name match',
    'Nye felter fra dokumentet': 'New fields from the document',
    'Behold': 'Keep',
    'Erstat med ny': 'Replace with new',
    'AI fandt ingen brugbar information i de uploadede filer.':
        'AI found no usable information in the uploaded files.',
    'Opret/opdater kladder': 'Create/update drafts',

    // --- Edit dialog -----------------------------------------------------
    'Gennemgå de udtrukne oplysninger': 'Review the extracted information',
    'Felter med data fra dine uploadede dokumenter er markeret gult. Gennemgå alle faner og gem relevante oplysninger for denne medarbejder.':
        'Fields with data from your uploaded documents are highlighted yellow. Review all tabs and save the relevant information for this employee.',
    'Felter markeret med ✨ er udfyldt automatisk fra dine uploadede dokumenter. Gennemgå alle faner og gem relevante oplysninger for denne medarbejder.':
        'Fields marked with ✨ are auto-filled from your uploaded documents. Review all tabs and save the relevant information for this employee.',
    Medarbejderoplysninger: 'Employee information',
    Saldi: 'Balances',
    'Ferie og opsparinger': 'Vacation and savings',
    Stamdata: 'Master data',
    Økonomi: 'Financial',
    Ferie: 'Vacation',
    Lønoplysninger: 'Payroll details',
    Pension: 'Pension',
    Aktieordninger: 'Stock options',

    // Fields
    'CPR-nr.': 'Civil reg. no.',
    'Hent CPR-data': 'Fetch civil reg. data',
    'Fulde navn': 'Full name',
    'C/O': 'c/o',
    'Postnr.': 'Postcode',
    By: 'City',
    Adresse: 'Address',
    Land: 'Country',
    'E-mail': 'Email',
    'Telefonnr.': 'Phone no.',
    Medarbejdergruppe: 'Employee group',
    Ansættelsesdato: 'Hire date',
    'Medarbejdernr.': 'Employee no.',
    Afdeling: 'Department',
    Lønperiode: 'Pay period',

    // Defaults
    Danmark: 'Denmark',
    Funktionær: 'Salaried',

    // Actions
    'Gem & næste': 'Save & next',
    'Denne fane er ikke en del af prototypen.':
        'This tab is not part of the prototype.',

    // --- Detail page -----------------------------------------------------
    Redigér: 'Edit',
    'Indeværende år': 'Current year',
    'Sidste år': 'Last year',
    'Arbejdstimer ÅTD': 'Hours worked YTD',
    t: 'hr',
    'Resterende feriedage': 'Remaining vacation days',
    dage: 'days',
    'Løn under ferie': 'Pay during vacation',
    'Månedslønnede, bagud': 'Monthly, paid in arrears',
    'Næste automatiske betaling': 'Next automatic payment',
    'om 14 dage': 'in 14 days',
    'Bruttoløn ÅTD': 'Gross pay YTD',
    'Total af 0 lønninger': 'Total of 0 payments',

    // Detail tabs
    'Personlige oplysninger': 'Personal information',
    Ansættelsesoplysninger: 'Employment information',
    Tilvalgsordninger: 'Optional schemes',
    Statistik: 'Statistics',
    Registreringsapp: 'Registration app',
    Opsparinger: 'Savings',

    // Balances
    'Afstemning til eIndkomst': 'Reconciliation with eIncome',
    'Nr.': 'No.',
    Løndel: 'Pay component',
    Beløb: 'Amount',
    Bruttoindkomst: 'Gross income',
    'Indkomst, hvoraf der skal betales AM-bidrag':
        'Income subject to labour market contribution',
    'Indkomst, hvoraf der ikke skal betales AM-bidrag':
        'Income not subject to labour market contribution',
    'A-skat': 'A-tax',
    'AM-bidrag': 'Labour market contribution',
    'Værdi af fri bil': 'Value of company car',
    'Værdi til multimediebeskatning': 'Value for multimedia taxation',
    'Værdi af fri kost og logi efter ligningsrådets satser':
        'Value of free board and lodging per assessment council rates',

    // Vacation
    Feriedage: 'Vacation days',
    Type: 'Type',
    Optjeningsperiode: 'Accrual period',
    Optjent: 'Accrued',
    Afholdt: 'Taken',
    Rest: 'Remaining',
    Lovpligtige: 'Statutory',
    Overførte: 'Transferred',
    'I alt': 'Total',
    Feriepengebeskatninger: 'Vacation pay tax',
    Feriepengegrundlag: 'Vacation pay basis',

    // --- Table -----------------------------------------------------------
    Navn: 'Name',
    Ansat: 'Hired',
    Løntermin: 'Pay term',
    'Total udbetalt ÅTD': 'Total paid YTD',
    'Sidste udbetaling': 'Last payment',
    Status: 'Status',

    // --- Status badges ---------------------------------------------------
    Aktiv: 'Active',
    Fratrådt: 'Resigned',

    // --- Placeholder pages -----------------------------------------------
    'Ikke en del af prototypen': 'Not part of the prototype',
    "Denne side er udeladt fra prototypen. Gå tilbage til \"Alle medarbejdere\" for at fortsætte testen.":
        'This page is not part of the prototype. Go back to "All employees" to continue the test.',

    // --- Options preview (ideation page) --------------------------------
    'Ideation: opdatér eksisterende medarbejderudkast':
        'Ideation: update existing employee drafts',
    'Tre forslag til hvordan brugeren kan uploade ny info til et udkast, der allerede eksisterer.':
        'Three ideas for how users can upload new info to a draft that already exists.',
    'Sammenlign opdateringsforslag': 'Compare update proposals',
    'Tilbage til medarbejdere': 'Back to employees',

    // --- Pay-term descriptions (data) ------------------------------------
    'Månedslønnede, forud': 'Monthly, paid in advance',
    'Månedslønnede, bagud': 'Monthly, paid in arrears',
    '14-dages lønnede, udbetaling ulige uger':
        'Biweekly, paid on odd weeks',
    '14-dages lønnede, udbetaling lige uger':
        'Biweekly, paid on even weeks',
    'Ugeløn, udbetaling fredag': 'Weekly, paid on Friday',
    'Café Virksomhed': 'Café Company',

    // --- Misc ------------------------------------------------------------
    KB: 'KB',
    MB: 'MB',
    'Behandler dokumenter — opretter medarbejderudkast...':
        'Processing documents — creating employee drafts...',

    // --- Translator UI itself ------------------------------------------
    'Oversæt til engelsk': 'Translate to Danish',
};

// Bidirectional regex patterns for dynamic strings. Each pattern is tried
// in order; first match wins. We list them in pairs (da, en) so we can pick
// the right direction at translate time.
export type RegexPattern = {
    da: RegExp;
    en: RegExp;
    toEn: (m: RegExpMatchArray) => string;
    toDa: (m: RegExpMatchArray) => string;
};

export const dynamicPatterns: RegexPattern[] = [
    {
        da: /^(\d+) kladder klar til oprettelse$/,
        en: /^(\d+) drafts ready to create$/,
        toEn: (m) => `${m[1]} drafts ready to create`,
        toDa: (m) => `${m[1]} kladder klar til oprettelse`,
    },
    {
        da: /^(\d+) kladde klar til oprettelse$/,
        en: /^(\d+) draft ready to create$/,
        toEn: (m) => `${m[1]} draft ready to create`,
        toDa: (m) => `${m[1]} kladde klar til oprettelse`,
    },
    {
        da: /^(\d+) filer klar til behandling\. Du kan fjerne enkelte filer før du starter\.$/,
        en: /^(\d+) files ready for processing\. You can remove individual files before you start\.$/,
        toEn: (m) =>
            `${m[1]} files ready for processing. You can remove individual files before you start.`,
        toDa: (m) =>
            `${m[1]} filer klar til behandling. Du kan fjerne enkelte filer før du starter.`,
    },
    {
        da: /^(\d+) fil klar til behandling\. Du kan fjerne enkelte filer før du starter\.$/,
        en: /^(\d+) file ready for processing\. You can remove individual files before you start\.$/,
        toEn: (m) =>
            `${m[1]} file ready for processing. You can remove individual files before you start.`,
        toDa: (m) =>
            `${m[1]} fil klar til behandling. Du kan fjerne enkelte filer før du starter.`,
    },
    {
        da: /^Behandl (\d+) filer$/,
        en: /^Process (\d+) files$/,
        toEn: (m) => `Process ${m[1]} files`,
        toDa: (m) => `Behandl ${m[1]} filer`,
    },
    {
        da: /^Behandl (\d+) fil$/,
        en: /^Process (\d+) file$/,
        toEn: (m) => `Process ${m[1]} file`,
        toDa: (m) => `Behandl ${m[1]} fil`,
    },
    {
        da: /^(\d+) nye felter$/,
        en: /^(\d+) new fields$/,
        toEn: (m) => `${m[1]} new fields`,
        toDa: (m) => `${m[1]} nye felter`,
    },
    {
        da: /^(\d+) nyt felt$/,
        en: /^(\d+) new field$/,
        toEn: (m) => `${m[1]} new field`,
        toDa: (m) => `${m[1]} nyt felt`,
    },
    {
        da: /^Trin (\d+) af (\d+)$/,
        en: /^Step (\d+) of (\d+)$/,
        toEn: (m) => `Step ${m[1]} of ${m[2]}`,
        toDa: (m) => `Trin ${m[1]} af ${m[2]}`,
    },
    {
        da: /^Opdaterer (\d+) eksisterende udkast$/,
        en: /^Updating (\d+) existing drafts$/,
        toEn: (m) => `Updating ${m[1]} existing drafts`,
        toDa: (m) => `Opdaterer ${m[1]} eksisterende udkast`,
    },
    {
        da: /^Opretter (\d+) nyt udkast$/,
        en: /^Creating (\d+) new draft$/,
        toEn: (m) => `Creating ${m[1]} new draft`,
        toDa: (m) => `Opretter ${m[1]} nyt udkast`,
    },
    {
        da: /^Opretter (\d+) nye udkast$/,
        en: /^Creating (\d+) new drafts$/,
        toEn: (m) => `Creating ${m[1]} new drafts`,
        toDa: (m) => `Opretter ${m[1]} nye udkast`,
    },
    // ImportDialog preview summary, e.g. "· 1 opdateres · 1 konflikt · 1 ny"
    // The leading "· " is rendered separately, so this matches just the
    // count clauses joined by " · ".
    {
        da: /^(\d+) opdateres · (\d+) (konflikt|konflikter) · (\d+) (ny|nye)$/,
        en: /^(\d+) updated · (\d+) (conflict|conflicts) · (\d+) (new|new ones)$/,
        toEn: (m) => {
            const conflict =
                m[3] === 'konflikt' ? 'conflict' : 'conflicts';
            const created = m[5] === 'ny' ? 'new' : 'new ones';
            return `${m[1]} updated · ${m[2]} ${conflict} · ${m[4]} ${created}`;
        },
        toDa: (m) => {
            const konflikt =
                m[3] === 'conflict' ? 'konflikt' : 'konflikter';
            const ny = m[5] === 'new' ? 'ny' : 'nye';
            return `${m[1]} opdateres · ${m[2]} ${konflikt} · ${m[4]} ${ny}`;
        },
    },
    // Source-file caption: "Fra Lønsedler_marts_2026.pdf"
    {
        da: /^Fra (.+)$/,
        en: /^From (.+)$/,
        toEn: (m) => `From ${m[1]}`,
        toDa: (m) => `Fra ${m[1]}`,
    },
];

// Pre-computed reverse map (en → da). Built lazily so we only pay the
// cost on first toggle to English-then-back.
let _enToDa: Record<string, string> | null = null;
export function englishToDanish(): Record<string, string> {
    if (_enToDa) return _enToDa;
    const out: Record<string, string> = {};
    for (const [da, en] of Object.entries(danishToEnglish)) {
        // Last writer wins; the map is already curated to be reversible,
        // and where multiple Danish keys share an English value the
        // canonical reverse is the alphabetically-first definition.
        if (!(en in out)) out[en] = da;
    }
    _enToDa = out;
    return out;
}
