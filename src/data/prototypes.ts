import { PATHS } from '../paths';

export type PrototypeStatus = 'live' | 'draft' | 'archived';

export type Project = {
    id: string;
    title: string;
    summary: string;
    assumptions: string[];
};

export const projects: Project[] = [
    {
        id: 'onboarding',
        title: 'Migrering',
        summary:
            'Test af upload-flow, AI-forslag og gennemgang af medarbejderudkast ved migrering til e-conomic Løn.',
        assumptions: [],
    },
    {
        id: 'scheduled-changes',
        title: 'Planlagte ændringer',
        summary:
            'Hvordan tidsstyrer brugere fremtidige ændringer i lønelementer per medarbejder?',
        assumptions: [
            'Brugere har brug for at planlægge fremtidige ændringer pr. løntype, fx en lønstigning fra 1. april.',
            'En accordion-baseret liste af løntyper, hvor kun de tidsstyrbare felter har en "Planlæg ændring"-affordance, er forståelig.',
            'Planlagte ændringer skal vises som chips under det relevante felt, så de er nemme at finde, redigere og fjerne.',
        ],
    },
];

export type Prototype = {
    id: string;
    projectId: Project['id'];
    title: string;
    summary: string;
    description: string;
    status: PrototypeStatus;
    path: string;
    tags: string[];
    flow: string;
    version: string;
    updatedAt: string;
};

export const prototypes: Prototype[] = [
    {
        id: 'onboarding-v1',
        projectId: 'onboarding',
        title: 'Migrering · v1',
        summary: 'Drag-and-drop af lønsedler og regneark for automatisk at oprette medarbejderudkast. Rettedialog som fuld side med gul fremhævning af udtrukne felter.',
        description:
            'Ny bruger lander på en tom medarbejderliste, trækker lønsedler eller regneark ind, og får genereret medarbejderudkast med markerede felter. Inkluderer bulk-import med AI-matching mod eksisterende udkast og fuld stamdata-side per medarbejder.',
        status: 'live',
        path: PATHS.onboardingV1.employees,
        tags: ['Medarbejderoprettelse', 'Bulk-import', 'Fuld side-edit'],
        flow: 'Migrering',
        version: 'v1',
        updatedAt: '2026-05-15',
    },
    {
        id: 'onboarding-v2',
        projectId: 'onboarding',
        title: 'Onboarding · v2',
        summary: 'Samme upload-flow som v1, men rettelse foregår i en modal og AI-udtrukne felter markeres med ✨-ikon i højre side af input-feltet.',
        description:
            'V2 tester to hypoteser: (1) er en modal hurtigere at åbne/lukke end at navigere til en separat side? (2) er et ✨-ikon i højre side af input-feltet en klarere signal end gul baggrund?',
        status: 'live',
        path: PATHS.onboardingV2.employees,
        tags: ['Modal-edit', 'AI-stars indikator', 'A/B-test mod v1'],
        flow: 'Onboarding',
        version: 'v2',
        updatedAt: '2026-05-15',
    },
    {
        id: 'scheduled-changes-v1',
        projectId: 'scheduled-changes',
        title: 'Planlagte ændringer · v1',
        summary: 'Bruger åbner en medarbejder fra listen og planlægger fremtidige ændringer af løn, afdeling, lønperiode m.m. via rettedialogen.',
        description:
            'Tester hvordan brugere opdager og bruger en "Planlæg ændring"-affordance per felt: hver tidsstyrbar værdi har et eget link, der åbner en inline panel med Ny værdi + Gælder fra dato. Planlagte ændringer vises som chips under feltet og opsamlet i bunden af dialogen.',
        status: 'live',
        path: `${PATHS.scheduledChangesV1.employees}?state=processed`,
        tags: ['Tidsstyring', 'Modal-edit', 'Planlagte ændringer'],
        flow: 'Planlagte ændringer',
        version: 'v1',
        updatedAt: '2026-05-18',
    },
];
