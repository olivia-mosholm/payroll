import { useEffect, useState } from 'react';
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

type ConflictResolution = 'keep' | 'override';

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

function RowHeader({
    name,
    metaParts,
}: {
    name: string;
    metaParts: string[];
}) {
    return (
        <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded bg-grey-100 text-neutral-700 shrink-0">
                <Icon name="document" />
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-sm font-bold text-neutral-900">
                    {name}
                </span>
                <span className="text-xs text-neutral-500">
                    {metaParts.filter(Boolean).join(' · ')}
                </span>
            </div>
        </div>
    );
}

function EnrichmentCard({ enrichment }: { enrichment: Enrichment }) {
    const t = da.importDialog.preview;
    return (
        <li className="flex flex-col w-full bg-white border border-grey-300 rounded-lg overflow-hidden">
            <div className="px-3 py-2.5">
                <RowHeader
                    name={enrichment.employee.name}
                    metaParts={[
                        enrichment.matchLabel,
                        t.newFields(enrichment.fields.length),
                        t.fromFile(enrichment.sourceFile),
                    ]}
                />
            </div>
            <dl className="border-t border-grey-200 px-3 py-2 flex flex-col gap-1 text-xs">
                {enrichment.fields.map((f) => (
                    <div key={String(f.key)} className="flex flex-col">
                        <dt className="text-neutral-500">{f.label}</dt>
                        <dd>
                            <span className="rounded bg-yellow-100 text-neutral-900 inline-block max-w-full truncate px-1.5 py-px -ml-1.5">
                                {f.value}
                            </span>
                        </dd>
                    </div>
                ))}
            </dl>
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
        <li className="flex flex-col w-full bg-white border border-grey-300 rounded-lg overflow-hidden">
            <div className="px-3 py-2.5">
                <RowHeader
                    name={conflict.employee.name}
                    metaParts={[
                        conflict.matchLabel,
                        t.fromFile(conflict.sourceFile),
                    ]}
                />
            </div>
            <div className="border-t border-grey-200 px-3 py-3 flex flex-col gap-4">
                {conflict.fields.map((f) => {
                    const choice =
                        resolutions[String(f.key)] ?? 'override';
                    return (
                        <ConflictFieldGroup
                            key={String(f.key)}
                            employeeId={conflict.employee.id}
                            field={f}
                            choice={choice}
                            onResolve={(c) => onResolve(String(f.key), c)}
                        />
                    );
                })}
            </div>
        </li>
    );
}

function ConflictFieldGroup({
    employeeId,
    field,
    choice,
    onResolve,
}: {
    employeeId: string;
    field: ConflictField;
    choice: ConflictResolution;
    onResolve: (choice: ConflictResolution) => void;
}) {
    const t = da.importDialog.preview;
    const groupName = `conflict-${employeeId}-${String(field.key)}`;
    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs text-neutral-700">
                <span className="font-bold">{field.label}</span>{' '}
                {t.conflictExplanation(field.label).replace(`${field.label} `, '')}
            </p>
            <fieldset
                role="radiogroup"
                aria-label={field.label}
                className="flex flex-col gap-2"
            >
                <ConflictRadioOption
                    name={groupName}
                    value="keep"
                    label={t.keepExisting}
                    displayValue={field.existing}
                    tone="muted"
                    checked={choice === 'keep'}
                    onChange={() => onResolve('keep')}
                />
                <ConflictRadioOption
                    name={groupName}
                    value="override"
                    label={t.overrideWithNew}
                    displayValue={field.incoming}
                    tone="new"
                    checked={choice === 'override'}
                    onChange={() => onResolve('override')}
                />
            </fieldset>
        </div>
    );
}

function ConflictRadioOption({
    name,
    value,
    label,
    displayValue,
    tone,
    checked,
    onChange,
}: {
    name: string;
    value: ConflictResolution;
    label: string;
    displayValue: string;
    tone: 'muted' | 'new';
    checked: boolean;
    onChange: () => void;
}) {
    const containerClass = checked
        ? 'border-blue-500 bg-blue-50/50'
        : 'border-grey-300 hover:border-grey-500';
    const chipClass =
        tone === 'new'
            ? 'bg-yellow-100 text-neutral-900'
            : 'bg-grey-100 text-neutral-700';
    return (
        <label
            className={`flex items-center gap-3 rounded-md border px-3 py-2.5 cursor-pointer transition-colors ${containerClass}`}
        >
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                className="sr-only peer"
            />
            <span
                aria-hidden="true"
                className={`inline-flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 ${
                    checked
                        ? 'border-blue-500'
                        : 'border-grey-500'
                }`}
            >
                {checked && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                )}
            </span>
            <span
                className={`text-xs font-bold ${
                    checked ? 'text-blue-700' : 'text-neutral-900'
                } shrink-0`}
            >
                {label}
            </span>
            <span
                className={`text-xs rounded px-2 py-0.5 ${chipClass} truncate min-w-0`}
                title={displayValue}
            >
                {displayValue}
            </span>
        </label>
    );
}

function NewDraftCard({ creation }: { creation: Creation }) {
    const t = da.importDialog.preview;
    return (
        <li className="flex items-center gap-3 w-full px-3 py-2.5 bg-white border border-grey-300 rounded-lg">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded bg-grey-100 text-neutral-700 shrink-0">
                <Icon name="document" />
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-neutral-900">
                        {creation.employee.name}
                    </span>
                    <Badge color="orange" subtle>
                        {t.draftPill}
                    </Badge>
                </div>
                <span className="text-xs text-neutral-500">
                    {creation.sourceFile}
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

    const handleConfirm = () => {
        if (!preview) return;
        // Apply enrichments — additive merge, no destructive overwrite.
        for (const enrichment of preview.enrichments) {
            const patch: Partial<Employee> = {};
            for (const f of enrichment.fields) {
                (patch as Record<string, unknown>)[String(f.key)] = f.value;
            }
            updateEmployee(enrichment.employee.id, patch);
        }
        // Apply conflict resolutions — default is 'override' (the new value
        // wins). Only skip the patch when the user explicitly picked 'keep'.
        for (const conflict of preview.conflicts) {
            const patch: Partial<Employee> = {};
            for (const f of conflict.fields) {
                const choice =
                    resolutions[conflict.employee.id]?.[String(f.key)] ??
                    'override';
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
                        <div className="flex items-center justify-end gap-3 w-full">
                            <Button
                                appearance="default"
                                onClick={handleBackToFiles}
                            >
                                {t.actions.back}
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={handleConfirm}
                            >
                                {t.actions.confirm}
                            </Button>
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
        <div className="flex flex-col gap-4 py-1">
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
                            <NewDraftCard
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
    children,
}: {
    title: string;
    count: number;
    children: React.ReactNode;
}) {
    return (
        <section className="flex flex-col gap-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {title} · {count}
            </p>
            {children}
        </section>
    );
}
