import { useEffect, useMemo, useState } from 'react';
import { Dialog, Button, Spinner, Badge, Icon } from '@economic/taco';
import { DropZone } from './DropZone';
import {
    FileRow,
    type UploadedFile,
} from './UploadedFilesList';
import {
    appendEmployees,
    updateEmployee,
    useEmployees,
} from '../../store/employeesStore';
import type { Employee } from '../../data/mockEmployees';
import { additionalMockEmployees } from '../../data/additionalEmployees';
import { da } from '../../data/danishCopy';

let importBatch = 0;

type Step = 'idle' | 'analyzing' | 'preview';

type EnrichmentField = {
    key: keyof Employee;
    label: string;
    value: string;
};

type Enrichment = {
    employee: Employee;
    matchLabel: string;
    sourceFile: string;
    fields: EnrichmentField[];
};

type ConflictField = {
    key: keyof Employee;
    label: string;
    existing: string;
    incoming: string;
};

type Conflict = {
    employee: Employee;
    matchLabel: string;
    sourceFile: string;
    fields: ConflictField[];
};

type Creation = {
    employee: Employee;
    sourceFile: string;
};

type Preview = {
    enrichments: Enrichment[];
    conflicts: Conflict[];
    creates: Creation[];
};

type ConflictResolution = 'keep' | 'override' | null;

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /**
     * Optional notifier the parent can use to react to a finished import.
     * In the new flow the dialog applies all changes to the store itself —
     * the parent does not need to do anything. The callback is preserved
     * for backwards compatibility with the empty-state drop flow.
     */
    onProcessed?: (info?: { files: UploadedFile[]; employees: Employee[] }) => void;
};

function nextId() {
    return `file-${Math.random().toString(36).slice(2, 9)}`;
}

// --- Preview construction ------------------------------------------------
//
// The canned demo: regardless of which files were dropped, the AI always
// "finds" exactly one enrichment + one conflict + one new draft. The targets
// are picked from whatever is currently in the store so the preview ties
// back to drafts the tester can already see on the list. If nothing is in
// the store yet (very first import from the empty state) we degrade to just
// creating new drafts.
function buildPreview(files: UploadedFile[], employees: Employee[]): Preview {
    const sourceA = files[0]?.name ?? 'Lønsedler_marts_2026.pdf';
    const sourceB = files[1]?.name ?? sourceA;
    const sourceC = files[2]?.name ?? sourceB;

    // Enrichment target: prefer Mette Jensen, else first pending that lacks
    // an email, else first pending.
    const enrichTarget =
        employees.find(
            (e) => e.name === 'Mette Jensen' && e.status === 'pending',
        ) ??
        employees.find((e) => e.status === 'pending' && !e.email) ??
        employees.find((e) => e.status === 'pending');

    const enrichments: Enrichment[] = enrichTarget
        ? [
              {
                  employee: enrichTarget,
                  matchLabel: da.importDialog.preview.matchCpr,
                  sourceFile: sourceA,
                  fields: [
                      {
                          key: 'email',
                          label: da.editDialog.fields.email,
                          value: 'mette.jensen@cafevirksomhed.dk',
                      },
                      {
                          key: 'phone',
                          label: da.editDialog.fields.phone,
                          value: '+45 31 22 45 78',
                      },
                      {
                          key: 'address',
                          label: da.editDialog.fields.address,
                          value: 'Bredgade 17',
                      },
                  ],
              },
          ]
        : [];

    // Conflict target: prefer Anders Sørensen (always seeded with an
    // email in mockEmployees), else first enriched employee that has an
    // email already.
    const conflictTarget =
        employees.find(
            (e) => e.name === 'Anders Sørensen' && !!e.email,
        ) ??
        employees.find((e) => !!e.email);

    const conflicts: Conflict[] = conflictTarget
        ? [
              {
                  employee: conflictTarget,
                  matchLabel: da.importDialog.preview.matchCpr,
                  sourceFile: sourceB,
                  fields: [
                      {
                          key: 'email',
                          label: da.editDialog.fields.email,
                          existing:
                              conflictTarget.email ??
                              'anders.sorensen@cafevirksomhed.dk',
                          incoming: 'anders.s@cafe-vejle.dk',
                      },
                  ],
              },
          ]
        : [];

    // Always exactly one new draft from the additional pool.
    const template =
        additionalMockEmployees[importBatch % additionalMockEmployees.length];
    const creates: Creation[] =
        files.length > 0
            ? [
                  {
                      employee: {
                          ...template,
                          id: `${template.id}-batch${importBatch}`,
                          employeeNumber: `${1000 + employees.length + 1}`,
                      },
                      sourceFile: sourceC,
                  },
              ]
            : [];

    return { enrichments, conflicts, creates };
}

// --- UI sub-components ---------------------------------------------------

function EnrichmentCard({ enrichment }: { enrichment: Enrichment }) {
    const t = da.importDialog.preview;
    return (
        <li className="flex flex-col gap-3 w-full px-4 py-3 bg-white border border-grey-300 rounded-lg">
            <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded text-neutral-500 shrink-0">
                    <Icon name="user" />
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-neutral-900">
                            {enrichment.employee.name}
                        </span>
                        <Badge color="blue" subtle>
                            {t.updateBadge}
                        </Badge>
                    </div>
                    <span className="text-xs text-neutral-500">
                        {enrichment.matchLabel} ·{' '}
                        {t.newFields(enrichment.fields.length)} ·{' '}
                        {t.fromFile(enrichment.sourceFile)}
                    </span>
                </div>
            </div>
            <ul className="flex flex-col gap-1 pl-[52px]">
                {enrichment.fields.map((f) => (
                    <li
                        key={String(f.key)}
                        className="flex items-baseline gap-2 text-xs"
                    >
                        <span className="text-neutral-500 min-w-[80px]">
                            {f.label}
                        </span>
                        <span className="rounded px-2 py-0.5 bg-yellow-100 text-neutral-900 font-medium inline-flex items-center gap-1">
                            <Icon name="ai-stars" />
                            {f.value}
                        </span>
                    </li>
                ))}
            </ul>
        </li>
    );
}

function ConflictCard({
    conflict,
    resolutions,
    onResolve,
}: {
    conflict: Conflict;
    resolutions: Record<string, ConflictResolution>;
    onResolve: (field: string, choice: ConflictResolution) => void;
}) {
    const t = da.importDialog.preview;
    return (
        <li className="flex flex-col gap-4 w-full px-4 py-3 bg-white border border-grey-300 rounded-lg">
            <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded text-orange-700 shrink-0">
                    <Icon name="warning" />
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-neutral-900">
                            {conflict.employee.name}
                        </span>
                        <Badge color="orange" subtle>
                            {t.conflictBadge}
                        </Badge>
                    </div>
                    <span className="text-xs text-neutral-500">
                        {conflict.matchLabel} ·{' '}
                        {t.fromFile(conflict.sourceFile)}
                    </span>
                </div>
            </div>
            <ul className="flex flex-col gap-3 pl-[52px]">
                {conflict.fields.map((f) => {
                    const choice = resolutions[String(f.key)] ?? null;
                    return (
                        <li
                            key={String(f.key)}
                            className="flex flex-col gap-2"
                        >
                            <p className="text-xs font-bold text-neutral-700">
                                {f.label}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <ConflictValueOption
                                    label={t.existingLabel}
                                    value={f.existing}
                                    tone="muted"
                                    selected={choice === 'keep'}
                                    actionLabel={t.keepExisting}
                                    onClick={() =>
                                        onResolve(String(f.key), 'keep')
                                    }
                                />
                                <ConflictValueOption
                                    label={t.newLabel}
                                    value={f.incoming}
                                    tone="new"
                                    selected={choice === 'override'}
                                    actionLabel={t.overrideWithNew}
                                    onClick={() =>
                                        onResolve(String(f.key), 'override')
                                    }
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>
        </li>
    );
}

function ConflictValueOption({
    label,
    value,
    tone,
    selected,
    actionLabel,
    onClick,
}: {
    label: string;
    value: string;
    tone: 'muted' | 'new';
    selected: boolean;
    actionLabel: string;
    onClick: () => void;
}) {
    const valueChipClass =
        tone === 'new'
            ? 'bg-yellow-100 text-neutral-900'
            : 'bg-grey-100 text-neutral-700';
    const borderClass = selected
        ? 'border-blue-500 ring-2 ring-blue-500/30'
        : 'border-grey-300 hover:border-grey-500';
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={`group flex flex-col gap-1.5 text-left rounded-md border bg-white px-3 py-2.5 transition-colors ${borderClass}`}
        >
            <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-500">
                {label}
            </span>
            <span
                className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${valueChipClass} self-start max-w-full truncate`}
                title={value}
            >
                {value}
            </span>
            <span
                className={`text-xs font-bold inline-flex items-center gap-1 ${
                    selected ? 'text-blue-700' : 'text-neutral-700'
                }`}
            >
                {selected ? (
                    <Icon name="tick" />
                ) : (
                    <span
                        aria-hidden="true"
                        className="inline-block w-3.5 h-3.5 rounded-full border border-grey-500"
                    />
                )}
                {actionLabel}
            </span>
        </button>
    );
}

function CreatedCard({ creation }: { creation: Creation }) {
    const t = da.importDialog.preview;
    return (
        <li className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-grey-300 rounded-lg">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded text-neutral-500 shrink-0">
                <Icon name="document" />
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-neutral-900">
                        {creation.employee.name}
                    </span>
                    <Badge color="green" subtle>
                        {t.createBadge}
                    </Badge>
                </div>
                <span className="text-xs text-neutral-500">
                    {t.noMatch} · {t.fromFile(creation.sourceFile)}
                </span>
            </div>
        </li>
    );
}

// --- Main component ------------------------------------------------------

export function ImportDialog({ open, onOpenChange, onProcessed }: Props) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [step, setStep] = useState<Step>('idle');
    const [preview, setPreview] = useState<Preview | null>(null);
    const [resolutions, setResolutions] = useState<
        Record<string, Record<string, ConflictResolution>>
    >({});
    const employees = useEmployees();
    const t = da.importDialog;

    const reset = () => {
        setFiles([]);
        setStep('idle');
        setPreview(null);
        setResolutions({});
    };

    useEffect(() => {
        if (!open) {
            // When the dialog closes for any reason, clear local state so
            // a re-open starts fresh.
            reset();
        }
    }, [open]);

    const handleFiles = (newFiles: File[]) => {
        setFiles((prev) => [
            ...prev,
            ...newFiles.map((f) => ({ id: nextId(), name: f.name, size: f.size })),
        ]);
    };

    const handleRemove = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const handleProcess = () => {
        setStep('analyzing');
        const filesSnapshot = files;
        window.setTimeout(() => {
            const p = buildPreview(filesSnapshot, employees);
            setPreview(p);
            setStep('preview');
        }, 1500);
    };

    const handleResolve = (
        conflictKey: string,
        field: string,
        choice: ConflictResolution,
    ) => {
        setResolutions((prev) => ({
            ...prev,
            [conflictKey]: { ...(prev[conflictKey] ?? {}), [field]: choice },
        }));
    };

    const conflictsResolved = useMemo(() => {
        if (!preview) return true;
        return preview.conflicts.every((c) =>
            c.fields.every(
                (f) => resolutions[c.employee.id]?.[String(f.key)] != null,
            ),
        );
    }, [preview, resolutions]);

    const handleConfirm = () => {
        if (!preview || !conflictsResolved) return;
        // Apply enrichments — additive merge, no destructive overwrite.
        for (const enrichment of preview.enrichments) {
            const patch: Partial<Employee> = {};
            for (const f of enrichment.fields) {
                (patch as Record<string, unknown>)[String(f.key)] = f.value;
            }
            updateEmployee(enrichment.employee.id, patch);
        }
        // Apply conflict resolutions — only override when the user picked it.
        for (const conflict of preview.conflicts) {
            const patch: Partial<Employee> = {};
            for (const f of conflict.fields) {
                const choice =
                    resolutions[conflict.employee.id]?.[String(f.key)];
                if (choice === 'override') {
                    (patch as Record<string, unknown>)[String(f.key)] =
                        f.incoming;
                }
            }
            if (Object.keys(patch).length > 0) {
                updateEmployee(conflict.employee.id, patch);
            }
        }
        // Append new drafts.
        if (preview.creates.length > 0) {
            appendEmployees(preview.creates.map((c) => c.employee));
        }
        importBatch += preview.creates.length;
        onProcessed?.();
        onOpenChange(false);
    };

    const handleBackToFiles = () => {
        setStep('idle');
        setPreview(null);
        setResolutions({});
    };

    const handleClose = () => {
        if (step === 'analyzing') return;
        onOpenChange(false);
    };

    const titleId = 'import-dialog-title';

    return (
        <Dialog
            open={open}
            onChange={(next) => {
                onOpenChange(next);
            }}
            size="md"
            closeOnEscape={step !== 'analyzing'}
        >
            <Dialog.Content aria-labelledby={titleId}>
                <Dialog.Title id={titleId}>{t.title}</Dialog.Title>

                {step === 'analyzing' && (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <Spinner />
                        <span className="text-sm text-neutral-700">
                            {t.analyzing}
                        </span>
                    </div>
                )}

                {step === 'idle' && files.length === 0 && (
                    <div className="flex flex-col gap-4 py-2">
                        <p className="text-sm text-neutral-700">{t.intro}</p>
                        <DropZone onFiles={handleFiles} />
                    </div>
                )}

                {step === 'idle' && files.length > 0 && (
                    <div className="flex flex-col gap-4 py-2">
                        <p className="text-sm text-neutral-700">
                            {t.readySubtitle(files.length)}
                        </p>
                        <DropZone onFiles={handleFiles} />
                        <ul className="flex flex-col gap-2 w-full max-w-none max-h-[40vh] overflow-y-auto">
                            {files.map((f) => (
                                <FileRow
                                    key={f.id}
                                    file={f}
                                    onRemove={() => handleRemove(f.id)}
                                    disabled={false}
                                />
                            ))}
                        </ul>
                    </div>
                )}

                {step === 'preview' && preview && (
                    <div className="max-h-[65vh] overflow-y-auto -mx-1 px-1">
                        <PreviewBody
                            preview={preview}
                            resolutions={resolutions}
                            onResolve={handleResolve}
                        />
                    </div>
                )}

                <Dialog.Footer>
                    {step === 'analyzing' && null}

                    {step === 'idle' && (
                        <div className="flex items-center justify-end gap-3">
                            <Button appearance="default" onClick={handleClose}>
                                {t.actions.cancel}
                            </Button>
                            {files.length > 0 && (
                                <Button
                                    appearance="primary"
                                    onClick={handleProcess}
                                >
                                    {t.processN(files.length)}
                                </Button>
                            )}
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="flex items-center justify-between gap-3 w-full">
                            <Button
                                appearance="default"
                                onClick={handleBackToFiles}
                            >
                                ← {t.actions.back}
                            </Button>
                            <div className="flex items-center gap-3">
                                {!conflictsResolved &&
                                    preview &&
                                    preview.conflicts.length > 0 && (
                                        <span className="text-xs text-orange-700">
                                            {da.importDialog.preview
                                                .resolveAllHint}
                                        </span>
                                    )}
                                <Button
                                    appearance="primary"
                                    onClick={handleConfirm}
                                    disabled={!conflictsResolved}
                                >
                                    {t.actions.confirm}
                                </Button>
                            </div>
                        </div>
                    )}
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog>
    );
}

function PreviewBody({
    preview,
    resolutions,
    onResolve,
}: {
    preview: Preview;
    resolutions: Record<string, Record<string, ConflictResolution>>;
    onResolve: (
        conflictKey: string,
        field: string,
        choice: ConflictResolution,
    ) => void;
}) {
    const t = da.importDialog.preview;
    return (
        <div className="flex flex-col gap-5 py-2">
            <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 shrink-0">
                    <Icon name="ai-stars" />
                </span>
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-lg font-bold text-neutral-900">
                        {t.heading}
                    </h2>
                    <p className="text-xs text-neutral-500">
                        {t.subN(
                            preview.enrichments.length,
                            preview.conflicts.length,
                            preview.creates.length,
                        )}
                    </p>
                </div>
            </div>

            {preview.enrichments.length > 0 && (
                <PreviewSection
                    title={t.updatesHeading}
                    count={preview.enrichments.length}
                >
                    <ul className="flex flex-col gap-2 w-full max-w-none">
                        {preview.enrichments.map((e) => (
                            <EnrichmentCard
                                key={e.employee.id}
                                enrichment={e}
                            />
                        ))}
                    </ul>
                </PreviewSection>
            )}

            {preview.conflicts.length > 0 && (
                <PreviewSection
                    title={t.conflictsHeading}
                    count={preview.conflicts.length}
                    tone="warn"
                >
                    <ul className="flex flex-col gap-2 w-full max-w-none">
                        {preview.conflicts.map((c) => (
                            <ConflictCard
                                key={c.employee.id}
                                conflict={c}
                                resolutions={
                                    resolutions[c.employee.id] ?? {}
                                }
                                onResolve={(field, choice) =>
                                    onResolve(c.employee.id, field, choice)
                                }
                            />
                        ))}
                    </ul>
                </PreviewSection>
            )}

            {preview.creates.length > 0 && (
                <PreviewSection
                    title={t.createsHeading}
                    count={preview.creates.length}
                >
                    <ul className="flex flex-col gap-2 w-full max-w-none">
                        {preview.creates.map((c) => (
                            <CreatedCard
                                key={c.employee.id}
                                creation={c}
                            />
                        ))}
                    </ul>
                </PreviewSection>
            )}
        </div>
    );
}

function PreviewSection({
    title,
    count,
    tone = 'default',
    children,
}: {
    title: string;
    count: number;
    tone?: 'default' | 'warn';
    children: React.ReactNode;
}) {
    const colorClass =
        tone === 'warn' ? 'text-orange-700' : 'text-neutral-500';
    return (
        <section className="flex flex-col gap-2">
            <p
                className={`text-xs font-bold uppercase tracking-wider ${colorClass}`}
            >
                {title} · {count}
            </p>
            {children}
        </section>
    );
}
