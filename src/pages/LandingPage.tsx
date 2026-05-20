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

// The iframe loads the prototype at its native size and is visually scaled
// down so the desktop layout (sidebar + content) renders correctly inside the
// preview area.
const IFRAME_WIDTH = 1440;
const IFRAME_HEIGHT = 900;
const PREVIEW_SCALE = 0.7;
const PREVIEW_WIDTH = IFRAME_WIDTH * PREVIEW_SCALE;
const PREVIEW_HEIGHT = IFRAME_HEIGHT * PREVIEW_SCALE;

// Vite's BASE_URL ("/" in dev, "/payroll/" when deployed to GitHub Pages).
// React Router's <Link> handles the prefix automatically via `basename`, but
// raw iframe src attributes need it applied manually.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const withBase = (path: string) =>
    path.startsWith('/') ? `${BASE}${path}` : path;

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

function AssumptionsSection({ project }: { project: Project }) {
    const t = da.landing;
    return (
        <section className="bg-blue-50/60 rounded-2xl px-8 py-7">
            <div className="flex flex-col gap-4 max-w-3xl">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-neutral-900">
                        {project.title}
                    </h2>
                    <p className="text-base text-neutral-700">{project.summary}</p>
                </div>
                <div className="flex flex-col gap-3 mt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        {t.assumptionsHeading}
                    </h3>
                    <ul className="flex flex-col gap-2">
                        {project.assumptions.map((a, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-3 text-sm text-neutral-900"
                            >
                                <span className="inline-flex items-center justify-center w-5 h-5 mt-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold shrink-0">
                                    {i + 1}
                                </span>
                                <span>{a}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

function ProjectTabContent({ project }: { project: Project }) {
    const t = da.landing;
    const versions = prototypes.filter((p) => p.projectId === project.id);
    return (
        <div className="flex flex-col gap-8">
            <AssumptionsSection project={project} />

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
    const [activeProjectId, setActiveProjectId] = useState(projects[0]?.id);
    const activeProject =
        projects.find((p) => p.id === activeProjectId) ?? projects[0];

    return (
        <div className="min-h-screen bg-neutral-50">
            <header className="bg-white">
                <div className="mx-auto max-w-6xl px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            P
                        </div>
                        <span className="font-bold text-neutral-900">
                            Prototyper
                        </span>
                    </div>
                    <span className="text-xs text-neutral-500">
                        e-conomic Løn · brugertest
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
                        <p className="text-sm text-neutral-500 mt-1">{t.intro}</p>
                    </div>
                    <aside className="w-full md:w-[340px] shrink-0 rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] px-6 py-5 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-500">
                                <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true">
                                    <path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2h-4l1 2h1a1 1 0 110 2H6a1 1 0 110-2h1l1-2H4a2 2 0 01-2-2V4zm2 0v9h12V4H4z" />
                                </svg>
                            </span>
                            <h3 className="text-sm font-bold text-neutral-900">
                                {t.screenShare.title}
                            </h3>
                        </div>
                        <p className="text-xs text-neutral-500">
                            {t.screenShare.subtitle}
                        </p>
                        <ol className="flex flex-col gap-2 mt-1">
                            {t.screenShare.steps.map((step, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2.5 text-sm text-neutral-900"
                                >
                                    <span className="inline-flex items-center justify-center w-5 h-5 mt-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold shrink-0">
                                        {i + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                        <p className="text-xs text-neutral-500 mt-2 border-t border-grey-200 pt-3">
                            {t.screenShare.tip}
                        </p>
                    </aside>
                </section>

                <nav
                    className="flex items-center gap-1 border-b border-grey-300"
                    aria-label="Projects"
                >
                    {projects.map((project) => {
                        const isActive = project.id === activeProject?.id;
                        return (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() => setActiveProjectId(project.id)}
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

                {activeProject && <ProjectTabContent project={activeProject} />}
            </main>

            <footer className="mx-auto max-w-6xl px-8 py-10 text-xs text-neutral-500">
                <p>e-conomic Løn · brugertest-hub for prototyper</p>
            </footer>
        </div>
    );
}
