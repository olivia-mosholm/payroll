import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, type Color } from '@economic/taco';
import {
    prototypes,
    projects,
    type PrototypeStatus,
    type Prototype,
    type Project,
} from '../data/prototypes';
import { da } from '../data/danishCopy';

const STATUS_COLOR: Record<PrototypeStatus, Color> = {
    live: 'green',
    draft: 'orange',
    archived: 'grey',
};

// Filter: round-1 user testing only ships the first prototype variant.
const SHOWN_PROTOTYPE_IDS = new Set(['onboarding-v1']);

// The iframe loads the prototype at its native size and is visually scaled
// down so the desktop layout (sidebar + content) renders correctly inside the
// preview area.
const IFRAME_WIDTH = 1440;
const IFRAME_HEIGHT = 900;
const PREVIEW_SCALE = 0.7;
const PREVIEW_WIDTH = IFRAME_WIDTH * PREVIEW_SCALE;
const PREVIEW_HEIGHT = IFRAME_HEIGHT * PREVIEW_SCALE;

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const withBase = (path: string) =>
    path.startsWith('/') ? `${BASE}${path}` : path;

// --- Screen-share stepper visuals ---------------------------------------
//
// Each visual is a stylized but recognizable mock of the Google Meet UI a
// moderator sees at that step. Colors mirror Meet's palette
// (#1A73E8 primary, #202124 toolbar, #5F6368 secondary text).
//
// Visuals share a 280×160 viewBox so they render at a consistent size in the
// interactive single-step view.

function StepVisualJoin() {
    return (
        <svg
            viewBox="0 0 280 160"
            className="block w-full h-auto rounded"
            aria-hidden="true"
        >
            {/* Meet pre-call screen — white background */}
            <rect width="280" height="160" rx="6" fill="#FFFFFF" />
            {/* Top bar with Meet logo + time */}
            <rect x="0" y="0" width="280" height="18" fill="#FFFFFF" />
            <circle cx="14" cy="9" r="4" fill="#1A73E8" />
            <rect x="22" y="6" width="28" height="6" rx="1" fill="#202124" />
            <rect x="240" y="6" width="30" height="6" rx="1" fill="#5F6368" />
            {/* Camera preview tile (dark) */}
            <rect x="20" y="28" width="160" height="104" rx="8" fill="#202124" />
            {/* Avatar circle inside preview */}
            <circle cx="100" cy="74" r="22" fill="#3C4043" />
            <circle cx="100" cy="68" r="8" fill="#80868B" />
            <path d="M85 86 q15 -14 30 0" stroke="#80868B" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Bottom in-tile controls */}
            <circle cx="80" cy="120" r="6" fill="#5F6368" />
            <circle cx="100" cy="120" r="6" fill="#5F6368" />
            <circle cx="120" cy="120" r="6" fill="#5F6368" />
            {/* Right panel — Klar til at deltage + Tilslut button */}
            <rect x="194" y="36" width="70" height="6" rx="1" fill="#202124" />
            <rect x="194" y="48" width="56" height="4" rx="1" fill="#5F6368" />
            <rect x="194" y="56" width="48" height="4" rx="1" fill="#5F6368" />
            {/* Join button — Meet blue */}
            <rect x="194" y="78" width="74" height="22" rx="11" fill="#1A73E8" />
            <text
                x="231"
                y="93"
                textAnchor="middle"
                fontSize="9"
                fontWeight="600"
                fill="#FFFFFF"
                fontFamily="ui-sans-serif, system-ui"
            >
                Tilslut nu
            </text>
            {/* Cursor hint on join */}
            <path
                d="M243 102 L249 116 L246 116 L248 121 L246 122 L244 117 L241 119 Z"
                fill="#202124"
                stroke="#FFFFFF"
                strokeWidth="0.8"
            />
        </svg>
    );
}

function StepVisualPresent() {
    return (
        <svg
            viewBox="0 0 280 160"
            className="block w-full h-auto rounded"
            aria-hidden="true"
        >
            {/* Dark meeting view */}
            <rect width="280" height="160" rx="6" fill="#202124" />
            {/* Main video tile area */}
            <rect x="10" y="10" width="260" height="108" rx="6" fill="#3C4043" />
            {/* Speaker avatar */}
            <circle cx="140" cy="60" r="18" fill="#5F6368" />
            <circle cx="140" cy="55" r="7" fill="#9AA0A6" />
            <path d="M126 72 q14 -12 28 0" stroke="#9AA0A6" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Self-view tile bottom-right */}
            <rect x="226" y="86" width="38" height="26" rx="3" fill="#202124" />
            <circle cx="245" cy="98" r="6" fill="#5F6368" />
            {/* Bottom toolbar background */}
            <rect x="0" y="128" width="280" height="32" fill="#202124" />
            {/* Mic pill */}
            <rect x="36" y="134" width="22" height="22" rx="11" fill="#3C4043" />
            <rect x="45" y="139" width="4" height="8" rx="2" fill="#E8EAED" />
            <path d="M43 148 q4 4 8 0" stroke="#E8EAED" strokeWidth="1" fill="none" />
            {/* Camera pill */}
            <rect x="64" y="134" width="22" height="22" rx="11" fill="#3C4043" />
            <rect x="71" y="140" width="9" height="10" rx="1" fill="#E8EAED" />
            <path d="M80 143 L84 141 L84 149 L80 147 Z" fill="#E8EAED" />
            {/* Captions */}
            <rect x="92" y="134" width="22" height="22" rx="11" fill="#3C4043" />
            <rect x="98" y="142" width="10" height="2" rx="1" fill="#E8EAED" />
            <rect x="98" y="146" width="7" height="2" rx="1" fill="#E8EAED" />
            {/* Highlighted Present (Præsentér) button */}
            <rect
                x="120"
                y="134"
                width="22"
                height="22"
                rx="11"
                fill="#1A73E8"
            />
            {/* Screen share icon: monitor + up arrow */}
            <rect x="125" y="139" width="12" height="9" rx="1" fill="none" stroke="#FFFFFF" strokeWidth="1.4" />
            <path d="M131 142 L131 146 M129 144 L131 142 L133 144" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="128" y="149" width="6" height="1.4" rx="0.7" fill="#FFFFFF" />
            {/* Hand raise */}
            <rect x="148" y="134" width="22" height="22" rx="11" fill="#3C4043" />
            <path d="M156 140 v6 M159 138 v8 M162 140 v6" stroke="#E8EAED" strokeWidth="1.4" strokeLinecap="round" />
            {/* More */}
            <rect x="176" y="134" width="22" height="22" rx="11" fill="#3C4043" />
            <circle cx="183" cy="145" r="1.2" fill="#E8EAED" />
            <circle cx="187" cy="145" r="1.2" fill="#E8EAED" />
            <circle cx="191" cy="145" r="1.2" fill="#E8EAED" />
            {/* Hang up — red, wider */}
            <rect x="220" y="134" width="32" height="22" rx="11" fill="#EA4335" />
            <path
                d="M228 146 q8 -6 16 0"
                stroke="#FFFFFF"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
            />
            {/* Tooltip above Present button */}
            <rect x="106" y="118" width="56" height="12" rx="2" fill="#202124" stroke="#5F6368" strokeWidth="0.5" />
            <text
                x="134"
                y="126"
                textAnchor="middle"
                fontSize="6.5"
                fill="#E8EAED"
                fontFamily="ui-sans-serif, system-ui"
            >
                Præsentér nu
            </text>
        </svg>
    );
}

function StepVisualTab() {
    return (
        <svg
            viewBox="0 0 280 160"
            className="block w-full h-auto rounded"
            aria-hidden="true"
        >
            {/* Dim meeting backdrop */}
            <rect width="280" height="160" rx="6" fill="#202124" />
            <rect width="280" height="160" rx="6" fill="#000000" fillOpacity="0.4" />
            {/* Modal dialog — white card */}
            <rect
                x="28"
                y="20"
                width="224"
                height="120"
                rx="8"
                fill="#FFFFFF"
            />
            {/* Modal title */}
            <text
                x="44"
                y="42"
                fontSize="9"
                fontWeight="600"
                fill="#202124"
                fontFamily="ui-sans-serif, system-ui"
            >
                Vælg hvad du vil dele
            </text>
            {/* Three tiles */}
            {/* Tile 1: Hele skærmen */}
            <rect x="42" y="56" width="60" height="56" rx="4" fill="#F1F3F4" stroke="#DADCE0" strokeWidth="0.8" />
            <rect x="50" y="64" width="44" height="28" rx="2" fill="#FFFFFF" stroke="#5F6368" strokeWidth="0.8" />
            <rect x="60" y="94" width="24" height="2" rx="1" fill="#5F6368" />
            <text
                x="72"
                y="106"
                textAnchor="middle"
                fontSize="6"
                fill="#202124"
                fontFamily="ui-sans-serif, system-ui"
            >
                Hele skærmen
            </text>
            {/* Tile 2: Et vindue */}
            <rect x="110" y="56" width="60" height="56" rx="4" fill="#F1F3F4" stroke="#DADCE0" strokeWidth="0.8" />
            <rect x="118" y="64" width="44" height="28" rx="2" fill="#FFFFFF" stroke="#5F6368" strokeWidth="0.8" />
            <rect x="118" y="64" width="44" height="5" rx="2" fill="#DADCE0" />
            <text
                x="140"
                y="106"
                textAnchor="middle"
                fontSize="6"
                fill="#202124"
                fontFamily="ui-sans-serif, system-ui"
            >
                Et vindue
            </text>
            {/* Tile 3: Et faneblad — SELECTED */}
            <rect
                x="178"
                y="56"
                width="60"
                height="56"
                rx="4"
                fill="#E8F0FE"
                stroke="#1A73E8"
                strokeWidth="1.6"
            />
            {/* Tab strip inside tile */}
            <rect x="184" y="64" width="14" height="6" rx="1.5" fill="#DADCE0" />
            <rect x="200" y="62" width="14" height="8" rx="1.5" fill="#FFFFFF" stroke="#1A73E8" strokeWidth="0.8" />
            <rect x="216" y="64" width="14" height="6" rx="1.5" fill="#DADCE0" />
            <rect x="186" y="74" width="46" height="18" rx="1.5" fill="#FFFFFF" stroke="#DADCE0" strokeWidth="0.6" />
            <text
                x="208"
                y="106"
                textAnchor="middle"
                fontSize="6"
                fontWeight="600"
                fill="#1A73E8"
                fontFamily="ui-sans-serif, system-ui"
            >
                Et faneblad
            </text>
            {/* Footer buttons */}
            <rect x="170" y="120" width="34" height="14" rx="7" fill="#FFFFFF" stroke="#DADCE0" strokeWidth="0.8" />
            <text
                x="187"
                y="129.5"
                textAnchor="middle"
                fontSize="6"
                fill="#5F6368"
                fontFamily="ui-sans-serif, system-ui"
            >
                Annullér
            </text>
            <rect x="210" y="120" width="32" height="14" rx="7" fill="#1A73E8" />
            <text
                x="226"
                y="129.5"
                textAnchor="middle"
                fontSize="6"
                fontWeight="600"
                fill="#FFFFFF"
                fontFamily="ui-sans-serif, system-ui"
            >
                Næste
            </text>
        </svg>
    );
}

function StepVisualShare() {
    return (
        <svg
            viewBox="0 0 280 160"
            className="block w-full h-auto rounded"
            aria-hidden="true"
        >
            {/* Modal scrim */}
            <rect width="280" height="160" rx="6" fill="#202124" />
            <rect width="280" height="160" rx="6" fill="#000000" fillOpacity="0.4" />
            {/* Modal dialog */}
            <rect x="28" y="16" width="224" height="128" rx="8" fill="#FFFFFF" />
            <text
                x="44"
                y="36"
                fontSize="8.5"
                fontWeight="600"
                fill="#202124"
                fontFamily="ui-sans-serif, system-ui"
            >
                Vælg et faneblad, du vil dele
            </text>
            {/* Tab list rows */}
            {/* Row 1 */}
            <rect x="42" y="46" width="196" height="18" rx="3" fill="#F8F9FA" />
            <rect x="50" y="52" width="8" height="6" rx="1" fill="#5F6368" />
            <text x="64" y="58" fontSize="6.5" fill="#5F6368" fontFamily="ui-sans-serif, system-ui">
                Gmail — Indbakke (4)
            </text>
            {/* Row 2 — SELECTED (Brugertest - e-conomic) */}
            <rect
                x="42"
                y="66"
                width="196"
                height="18"
                rx="3"
                fill="#E8F0FE"
                stroke="#1A73E8"
                strokeWidth="1.4"
            />
            <rect x="50" y="72" width="8" height="6" rx="1" fill="#1A73E8" />
            <text
                x="64"
                y="78"
                fontSize="6.5"
                fontWeight="600"
                fill="#1A73E8"
                fontFamily="ui-sans-serif, system-ui"
            >
                Brugertest - e-conomic
            </text>
            {/* check icon on selected */}
            <circle cx="228" cy="75" r="4" fill="#1A73E8" />
            <path d="M225.5 75 L227.5 77 L230.5 73.5" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {/* Row 3 */}
            <rect x="42" y="86" width="196" height="18" rx="3" fill="#F8F9FA" />
            <rect x="50" y="92" width="8" height="6" rx="1" fill="#5F6368" />
            <text x="64" y="98" fontSize="6.5" fill="#5F6368" fontFamily="ui-sans-serif, system-ui">
                Figma — e-conomic Løn
            </text>
            {/* Row 4 */}
            <rect x="42" y="106" width="196" height="18" rx="3" fill="#F8F9FA" />
            <rect x="50" y="112" width="8" height="6" rx="1" fill="#5F6368" />
            <text x="64" y="118" fontSize="6.5" fill="#5F6368" fontFamily="ui-sans-serif, system-ui">
                Google Meet
            </text>
            {/* Footer buttons */}
            <rect x="160" y="128" width="34" height="12" rx="6" fill="#FFFFFF" stroke="#DADCE0" strokeWidth="0.8" />
            <text x="177" y="136.5" textAnchor="middle" fontSize="6" fill="#5F6368" fontFamily="ui-sans-serif, system-ui">
                Annullér
            </text>
            <rect x="200" y="128" width="38" height="12" rx="6" fill="#1A73E8" />
            <text
                x="219"
                y="136.5"
                textAnchor="middle"
                fontSize="6.5"
                fontWeight="600"
                fill="#FFFFFF"
                fontFamily="ui-sans-serif, system-ui"
            >
                Del
            </text>
            {/* Cursor hovering Del button */}
            <path
                d="M232 138 L238 152 L235 152 L237 157 L235 158 L233 153 L230 155 Z"
                fill="#202124"
                stroke="#FFFFFF"
                strokeWidth="0.8"
            />
        </svg>
    );
}

function ScreenShareStepper() {
    const t = da.landing.screenShare;
    const steps: { visual: React.ReactNode; text: string }[] = [
        { visual: <StepVisualJoin />, text: t.steps[0] },
        { visual: <StepVisualPresent />, text: t.steps[1] },
        { visual: <StepVisualTab />, text: t.steps[2] },
        { visual: <StepVisualShare />, text: t.steps[3] },
    ];
    const [current, setCurrent] = useState(0);
    const total = steps.length;
    const step = steps[current];
    const canPrev = current > 0;
    const canNext = current < total - 1;

    return (
        <div className="flex flex-col gap-3 mt-1">
            <div className="rounded-lg border border-grey-200 bg-white p-2.5 flex flex-col gap-2">
                {step.visual}
                <div className="flex items-start gap-2 px-1 pb-1 pt-1 min-h-[40px]">
                    <span className="inline-flex items-center justify-center w-5 h-5 mt-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold shrink-0">
                        {current + 1}
                    </span>
                    <span className="text-sm text-neutral-900 leading-snug">
                        {step.text}
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-between gap-2">
                <button
                    type="button"
                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                    disabled={!canPrev}
                    className="inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-bold text-neutral-700 border border-grey-300 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-grey-100 transition-colors"
                    aria-label={t.prev}
                >
                    ← {t.prev}
                </button>
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Skridt">
                    {steps.map((_, i) => {
                        const active = i === current;
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setCurrent(i)}
                                aria-label={t.stepOf(i + 1, total)}
                                aria-current={active ? 'step' : undefined}
                                className={`h-2 rounded-full transition-all ${
                                    active
                                        ? 'w-6 bg-blue-500'
                                        : 'w-2 bg-grey-300 hover:bg-grey-500'
                                }`}
                            />
                        );
                    })}
                </div>
                <button
                    type="button"
                    onClick={() =>
                        setCurrent((c) => Math.min(total - 1, c + 1))
                    }
                    disabled={!canNext}
                    className="inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-bold text-white bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                    aria-label={t.next}
                >
                    {t.next} →
                </button>
            </div>
            <p className="text-[11px] text-neutral-500 text-center">
                {t.stepOf(current + 1, total)}
            </p>
        </div>
    );
}

// --- Prototype card -----------------------------------------------------

function PrototypeCard({ p }: { p: Prototype }) {
    const t = da.landing;
    return (
        <article className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
            <header className="px-8 pt-8 pb-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-6">
                    <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-neutral-900">
                                {p.title}
                            </h3>
                            <Badge color={STATUS_COLOR[p.status]} subtle>
                                {t.statusLabels[p.status]}
                            </Badge>
                        </div>
                        <p className="text-sm text-neutral-700 max-w-2xl">
                            {p.summary}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {p.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <Link
                        to={p.path}
                        className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                    >
                        {t.cta} →
                    </Link>
                </div>
                <dl className="grid grid-cols-3 gap-4 text-xs pt-4 mt-2">
                    <div>
                        <dt className="font-bold text-neutral-500 uppercase tracking-wider mb-1">
                            {t.flowLabel}
                        </dt>
                        <dd className="text-sm text-neutral-900">{p.flow}</dd>
                    </div>
                    <div>
                        <dt className="font-bold text-neutral-500 uppercase tracking-wider mb-1">
                            {t.versionLabel}
                        </dt>
                        <dd className="text-sm text-neutral-900">{p.version}</dd>
                    </div>
                    <div>
                        <dt className="font-bold text-neutral-500 uppercase tracking-wider mb-1">
                            {t.updatedLabel}
                        </dt>
                        <dd className="text-sm text-neutral-900">{p.updatedAt}</dd>
                    </div>
                </dl>
            </header>

            <div className="px-8 pb-8 flex justify-center">
                <div
                    className="relative overflow-hidden rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05),0_24px_48px_rgba(0,0,0,0.08)] bg-white"
                    style={{
                        width: PREVIEW_WIDTH,
                        height: PREVIEW_HEIGHT,
                    }}
                >
                    <iframe
                        src={withBase(p.path)}
                        title={p.title}
                        loading="lazy"
                        className="block bg-white"
                        style={{
                            width: IFRAME_WIDTH,
                            height: IFRAME_HEIGHT,
                            border: 0,
                            transform: `scale(${PREVIEW_SCALE})`,
                            transformOrigin: 'top left',
                        }}
                    />
                </div>
            </div>
        </article>
    );
}

function ProjectIntroSection({ project }: { project: Project }) {
    return (
        <section className="bg-blue-50/60 rounded-2xl px-8 py-7">
            <div className="flex flex-col gap-3 max-w-3xl">
                <h2 className="text-2xl font-bold text-neutral-900">
                    {project.title}
                </h2>
                <p className="text-base text-neutral-700">{project.summary}</p>
            </div>
        </section>
    );
}

function ProjectTabContent({
    project,
    versions,
}: {
    project: Project;
    versions: Prototype[];
}) {
    const t = da.landing;
    return (
        <div className="flex flex-col gap-8">
            <ProjectIntroSection project={project} />

            <section className="flex flex-col gap-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    {t.sectionVersions} · {versions.length}
                </h3>
                {versions.length > 0 ? (
                    <div className="flex flex-col gap-10">
                        {versions.map((p) => (
                            <PrototypeCard key={p.id} p={p} />
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-neutral-500">{t.emptyHint}</p>
                )}
            </section>
        </div>
    );
}

export function LandingPage() {
    const t = da.landing;

    // Only show prototypes whose id is in the allowlist, and only projects
    // that still have at least one visible prototype.
    const visiblePrototypes = prototypes.filter((p) =>
        SHOWN_PROTOTYPE_IDS.has(p.id)
    );
    const visibleProjects = projects.filter((project) =>
        visiblePrototypes.some((p) => p.projectId === project.id)
    );
    const [activeProjectId, setActiveProjectId] = useState(
        visibleProjects[0]?.id
    );
    const activeProject =
        visibleProjects.find((p) => p.id === activeProjectId) ??
        visibleProjects[0];
    const activeVersions = activeProject
        ? visiblePrototypes.filter((p) => p.projectId === activeProject.id)
        : [];

    return (
        <div className="min-h-screen bg-neutral-50">
            <header className="bg-white">
                <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-end">
                    <span className="text-xs text-neutral-500">
                        Brugertest · prototyper
                    </span>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-8 py-16 flex flex-col gap-12">
                <section className="flex items-start gap-10 flex-col md:flex-row md:justify-between">
                    <div className="flex flex-col gap-3 max-w-3xl flex-1">
                        <h1 className="text-5xl font-bold leading-[1.1] text-neutral-900">
                            {t.title}
                        </h1>
                        <p className="text-lg text-neutral-700 mt-2">
                            {t.subtitle}
                        </p>
                        <p className="text-sm text-neutral-500 mt-1">
                            {t.intro}
                        </p>
                    </div>
                    <aside className="w-full md:w-[340px] shrink-0 rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] px-5 py-5 flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-bold text-neutral-900">
                                {t.screenShare.title}
                            </h3>
                            <p className="text-xs text-neutral-500">
                                {t.screenShare.subtitle}
                            </p>
                        </div>
                        <ScreenShareStepper />
                        <p className="text-xs text-neutral-500 mt-1 border-t border-grey-200 pt-3">
                            {t.screenShare.tip}
                        </p>
                    </aside>
                </section>

                {visibleProjects.length > 1 && (
                    <nav
                        className="flex items-center gap-1 border-b border-grey-300"
                        aria-label="Projects"
                    >
                        {visibleProjects.map((project) => {
                            const isActive = project.id === activeProject?.id;
                            return (
                                <button
                                    key={project.id}
                                    type="button"
                                    onClick={() =>
                                        setActiveProjectId(project.id)
                                    }
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`px-5 py-3 text-sm font-bold transition-colors border-b-2 -mb-px ${
                                        isActive
                                            ? 'text-blue-500 border-blue-500'
                                            : 'text-neutral-500 border-transparent hover:text-neutral-900'
                                    }`}
                                >
                                    {project.title}
                                </button>
                            );
                        })}
                    </nav>
                )}

                {activeProject && (
                    <ProjectTabContent
                        project={activeProject}
                        versions={activeVersions}
                    />
                )}
            </main>

            <footer className="mx-auto max-w-6xl px-8 py-10 text-xs text-neutral-500">
                <p>e-conomic Løn · brugertest-hub for prototyper</p>
            </footer>
        </div>
    );
}
