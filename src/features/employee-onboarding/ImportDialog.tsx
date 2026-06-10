import { useEffect, useState } from 'react';
import {
    Dialog,
    Button,
    Spinner,
    Badge,
    Icon,
    IconButton,
    Table3,
    Text,
    Tooltip,
    useDropTarget,
    type Color,
} from '@economic/taco';
import { DropZone } from './DropZone';

// Fake file used for usability testing — clicking browse or dropping any
// file always resolves to this preset so testers never need real documents.
const FAKE_UPLOAD = new File([''], 'Lønsedler_marts_2026.pdf', { type: 'application/pdf' });

// --- File type chips -------------------------------------------------------

const FILE_TYPES = [
    { label: 'Lønsedler · PDF',    bg: 'bg-red-100',    text: 'text-red-700',   abbr: 'PDF' },
    { label: 'Excel · XLSX',       bg: 'bg-green-100',  text: 'text-green-700', abbr: 'XLS' },
    { label: 'CSV',                bg: 'bg-green-100',  text: 'text-green-700', abbr: 'CSV' },
    { label: 'Word · DOCX',        bg: 'bg-blue-100',   text: 'text-blue-700',  abbr: 'DOC' },
    { label: 'Billeder · JPG, PNG',bg: 'bg-yellow-100', text: 'text-yellow-700',abbr: 'IMG' },
];

function ImportEmptyState({
    onFiles,
    intro,
}: {
    onFiles: (files: File[]) => void;
    intro: string;
}) {
    const handleDrop: React.DragEventHandler = (e) => {
        e.preventDefault();
        // Usability test: always resolve to the fake preset file.
        onFiles([FAKE_UPLOAD]);
    };
    const [isOver, dropHandlers] = useDropTarget(handleDrop);

    return (
        <div className="flex flex-col gap-4 py-2">
            <Text size="sm" color="secondary">{intro}</Text>
            <div
                {...dropHandlers}
                className={`flex flex-col items-center justify-center gap-3 py-10 px-8 rounded-[10px] border border-dashed transition-colors ${
                    isOver ? 'border-blue-400 bg-blue-50' : 'border-grey-400'
                }`}
            >
                <span className="text-neutral-400">
                    <Icon name="import" size="lg" />
                </span>
                <Text size="sm" color="secondary">PDF · Excel · Word · JPG, PNG</Text>
                <Button appearance="default" onClick={() => onFiles([FAKE_UPLOAD])}>
                    Vælg filer
                </Button>
            </div>
        </div>
    );
}
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
    onProcessed?: (info?: { firstEmployee: Employee | null }) => void;
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
        <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded bg-blue-100 text-neutral-900 shrink-0">
                <Icon name="person" />
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

function EnrichmentCard({
    enrichment,
    onRemove,
}: {
    enrichment: Enrichment;
    onRemove: () => void;
}) {
    const t = da.importDialog.preview;
    return (
        <li className="flex items-center gap-3 w-full px-3 py-2.5 bg-white border border-grey-300 rounded-lg">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded bg-blue-100 text-neutral-900 shrink-0">
                <Icon name="person" />
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-neutral-900">
                        {enrichment.employee.name}
                    </span>
                    <Badge color="blue" subtle>
                        {t.updatePill}
                    </Badge>
                </div>
                <span className="text-xs text-neutral-500">
                    {enrichment.matchLabel} ·{' '}
                    {t.newFields(enrichment.fields.length)} ·{' '}
                    {t.fromFile(enrichment.sourceFile)}
                </span>
            </div>
            <IconButton
                icon="close"
                appearance="discrete"
                aria-label={da.actions.remove}
                onClick={onRemove}
            />
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
    // Conflicts default to expanded so the user sees the radio group right
    // away. The chevron toggles them collapsed without removing the card.
    const [expanded, setExpanded] = useState(true);
    return (
        <li className="flex flex-col w-full bg-white border border-grey-300 rounded-lg overflow-hidden">
            <div className="px-3 py-2.5 flex items-start gap-2">
                <RowHeader
                    name={conflict.employee.name}
                    metaParts={[
                        conflict.matchLabel,
                        t.fromFile(conflict.sourceFile),
                    ]}
                />
                <IconButton
                    icon={expanded ? 'chevron-up' : 'chevron-down'}
                    appearance="discrete"
                    aria-label={expanded ? 'Skjul' : 'Vis'}
                    aria-expanded={expanded}
                    onClick={() => setExpanded((v) => !v)}
                />
            </div>
            {expanded && (
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
            )}
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
        <fieldset className="flex flex-col gap-2">
            <legend className="text-xs text-neutral-700 mb-1">
                <span className="font-bold">{field.label}</span>{' '}
                {t.conflictExplanation(field.label).replace(`${field.label} `, '')}
            </legend>
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
    const chipClass =
        tone === 'new'
            ? 'bg-yellow-100 text-neutral-900'
            : 'text-neutral-700';
    return (
        <label className="flex items-center gap-3 cursor-pointer">
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
                    checked ? 'border-blue-500' : 'border-grey-500'
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
                className={`text-xs rounded ${
                    tone === 'new' ? 'px-1.5 py-px' : ''
                } ${chipClass} truncate min-w-0`}
                title={displayValue}
            >
                {displayValue}
            </span>
        </label>
    );
}

function NewDraftCard({
    creation,
    onRemove,
}: {
    creation: Creation;
    onRemove: () => void;
}) {
    const t = da.importDialog.preview;
    return (
        <li className="flex items-center gap-3 w-full px-3 py-2.5 bg-white border border-grey-300 rounded-lg">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded bg-blue-100 text-neutral-900 shrink-0">
                <Icon name="person" />
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
            <IconButton
                icon="close"
                appearance="discrete"
                aria-label={da.actions.remove}
                onClick={onRemove}
            />
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
    /**
     * Employee ids the user has dismissed from the preview via the X icon.
     * Removed enrichments / conflicts / new drafts are filtered out of both
     * the rendered list and the changes applied on confirm.
     */
    const [removed, setRemoved] = useState<Set<string>>(() => new Set());
    const employees = useEmployees();
    const t = da.importDialog;

    const reset = () => {
        setFiles([]);
        setStep('idle');
        setPreview(null);
        setResolutions({});
        setRemoved(new Set());
    };

    const handleRemovePreviewRow = (employeeId: string) => {
        setRemoved((prev) => {
            const next = new Set(prev);
            next.add(employeeId);
            return next;
        });
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
            if (removed.has(enrichment.employee.id)) continue;
            const patch: Partial<Employee> = {};
            for (const f of enrichment.fields) {
                (patch as Record<string, unknown>)[String(f.key)] = f.value;
            }
            updateEmployee(enrichment.employee.id, patch);
        }
        // Apply conflict resolutions — default is 'override' (the new value
        // wins). Only skip the patch when the user explicitly picked 'keep'.
        for (const conflict of preview.conflicts) {
            if (removed.has(conflict.employee.id)) continue;
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
        const newDrafts = preview.creates.filter(
            (c) => !removed.has(c.employee.id),
        );
        if (newDrafts.length > 0) {
            appendEmployees(newDrafts.map((c) => c.employee));
        }
        importBatch += newDrafts.length;
        // Pass the first newly created employee so the parent can open
        // the review dialog immediately after the modal closes.
        const firstNew = newDrafts[0]?.employee ?? null;
        onProcessed?.({ firstEmployee: firstNew });
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
            size={step === 'preview' ? 'md' : 'sm'}
            closeOnEscape={step !== 'analyzing'}
        >
            <Dialog.Content aria-labelledby={titleId}>
                <Dialog.Title id={titleId} className="!text-left">{t.title}</Dialog.Title>

                {step === 'analyzing' && (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <Spinner />
                        <span className="text-sm text-neutral-700">
                            {t.analyzing}
                        </span>
                    </div>
                )}

                {step === 'idle' && files.length === 0 && (
                    <ImportEmptyState onFiles={handleFiles} intro={t.intro} />
                )}

                {step === 'idle' && files.length > 0 && (
                    <div className="flex flex-col gap-4 py-2">
                        <ImportEmptyState onFiles={handleFiles} intro={t.intro} />
                        <ul className="flex flex-col gap-2 w-full max-h-[30vh] overflow-y-auto">
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
                    <PreviewTable
                        preview={preview}
                        resolutions={resolutions}
                        removed={removed}
                        onResolve={handleResolve}
                        onRemove={handleRemovePreviewRow}
                        files={files}
                    />
                )}

                <Dialog.Footer>
                    {step === 'analyzing' && null}

                    {step === 'idle' && (
                        <div className="flex items-center justify-end gap-3">
                            <Button appearance="default" onClick={handleClose}>
                                {t.actions.cancel}
                            </Button>
                            <Button
                                appearance="primary"
                                disabled={files.length === 0}
                                onClick={handleProcess}
                            >
                                Indlæs filer
                            </Button>
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

// --- Preview as Table3 -----------------------------------------------------

type PreviewTableRow = {
    id: string;
    name: string;
    employeeNumber: string;
    badge: { label: string; color: Color };
    sourceFile: string;
    matchLabel?: string;
    type: 'update' | 'conflict' | 'draft';
};

function PreviewExpandedRow({
    row,
    preview,
    resolutions,
    onResolve,
}: {
    row: PreviewTableRow;
    preview: Preview;
    resolutions: Record<string, Record<string, ConflictResolution>>;
    onResolve: (employeeId: string, field: string, choice: ConflictResolution) => void;
}) {
    if (row.type === 'update') {
        const enrichment = preview.enrichments.find(e => e.employee.id === row.id);
        if (!enrichment) return null;
        return (
            <div className="px-6 py-4 bg-neutral-50 flex flex-col gap-3">
                <Text size="sm" bold>{da.importDialog.preview.newFieldsLabel}</Text>
                <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                    {enrichment.fields.map(f => (
                        <div key={String(f.key)} className="flex flex-col gap-1">
                            <Text size="sm" bold>{f.label}</Text>
                            <div className="px-2 py-1.5 rounded bg-yellow-100 border border-yellow-200 text-sm">{f.value}</div>
                            <Text size="sm" color="secondary">{enrichment.sourceFile}</Text>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    if (row.type === 'conflict') {
        const conflict = preview.conflicts.find(c => c.employee.id === row.id);
        if (!conflict) return null;
        return (
            <div className="px-6 py-4 bg-neutral-50 flex flex-col gap-4">
                {conflict.fields.map(f => {
                    const choice = resolutions[row.id]?.[String(f.key)] ?? 'override';
                    return (
                        <ConflictFieldGroup
                            key={String(f.key)}
                            employeeId={row.id}
                            field={f}
                            choice={choice}
                            onResolve={(c) => onResolve(row.id, String(f.key), c)}
                        />
                    );
                })}
            </div>
        );
    }
    if (row.type === 'draft') {
        const creation = preview.creates.find(c => c.employee.id === row.id);
        if (!creation) return null;
        const f = da.editDialog.fields;
        const emp = creation.employee;
        const fields = [
            { label: f.cpr, value: emp.cpr },
            { label: f.employmentDate, value: emp.hireDate },
            { label: f.fullName, value: emp.name },
            emp.email ? { label: f.email, value: emp.email } : null,
            emp.address ? { label: f.address, value: emp.address } : null,
            emp.postCode ? { label: f.postCode, value: emp.postCode } : null,
            emp.city ? { label: f.city, value: emp.city } : null,
        ].filter(Boolean) as { label: string; value: string }[];
        return (
            <div className="px-6 py-4 bg-neutral-50 flex flex-col gap-4">
                <Text bold size="sm">{da.editDialog.tabs.personalInfo}</Text>
                <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                    {fields.map(fd => (
                        <div key={fd.label} className="flex flex-col gap-1">
                            <Text size="sm" bold>{fd.label}</Text>
                            <div className="px-2 py-1.5 rounded bg-yellow-100 border border-yellow-200 text-sm">{fd.value}</div>
                            <Text size="sm" color="secondary">{creation.sourceFile}</Text>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
}

function PreviewTable({
    preview,
    resolutions,
    removed,
    onResolve,
    onRemove,
    files,
}: {
    preview: Preview;
    resolutions: Record<string, Record<string, ConflictResolution>>;
    removed: Set<string>;
    onResolve: (employeeId: string, field: string, choice: ConflictResolution) => void;
    onRemove: (employeeId: string) => void;
    files: UploadedFile[];
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const t = da.importDialog.preview;
    const rows: PreviewTableRow[] = [
        ...preview.enrichments.filter(e => !removed.has(e.employee.id)).map(e => ({
            id: e.employee.id,
            name: e.employee.name,
            employeeNumber: e.employee.employeeNumber,
            badge: { label: t.updatePill, color: 'blue' as Color },
            sourceFile: e.sourceFile,
            matchLabel: e.matchLabel,
            type: 'update' as const,
        })),
        ...preview.conflicts.filter(c => !removed.has(c.employee.id)).map(c => ({
            id: c.employee.id,
            name: c.employee.name,
            employeeNumber: c.employee.employeeNumber,
            badge: { label: 'Konflikt', color: 'red' as Color },
            sourceFile: c.sourceFile,
            matchLabel: c.matchLabel,
            type: 'conflict' as const,
        })),
        ...preview.creates.filter(c => !removed.has(c.employee.id)).map(c => ({
            id: c.employee.id,
            name: c.employee.name,
            employeeNumber: c.employee.employeeNumber,
            badge: { label: t.draftPill, color: 'orange' as Color },
            sourceFile: c.sourceFile,
            type: 'draft' as const,
        })),
    ];

    const docsRead = files.length;
    const total = rows.length;

    return (
        <div className="flex flex-col gap-3">
            <Text size="sm" color="secondary">
                <strong className="text-neutral-900">{docsRead} {docsRead === 1 ? 'dokument' : 'dokumenter'}</strong> læst · <strong className="text-neutral-900">{total} {total === 1 ? 'medarbejder' : 'medarbejdere'}</strong> fundet
            </Text>

            <Table3<PreviewTableRow>
                id="import-preview"
                data={rows}
                rowIdentityAccessor="id"
                enableRowSelection
                selectedRows={selectedIds}
                onRowSelect={(_rows, ids) => setSelectedIds(ids)}
            >
            <Table3.Column<PreviewTableRow>
                accessor="name"
                header={da.table.name}
                defaultWidth="grow"
            />
        </Table3>
        </div>
    );
}

function PreviewBody({
    preview,
    resolutions,
    removed,
    onResolve,
    onRemove,
}: {
    preview: Preview;
    resolutions: Record<string, Record<string, ConflictResolution>>;
    removed: Set<string>;
    onResolve: (
        conflictKey: string,
        field: string,
        choice: ConflictResolution,
    ) => void;
    onRemove: (employeeId: string) => void;
}) {
    return (
        <ul className="flex flex-col gap-2 w-full max-w-none py-1">
            {preview.enrichments
                .filter((e) => !removed.has(e.employee.id))
                .map((e) => (
                    <EnrichmentCard
                        key={e.employee.id}
                        enrichment={e}
                        onRemove={() => onRemove(e.employee.id)}
                    />
                ))}
            {preview.conflicts
                .filter((c) => !removed.has(c.employee.id))
                .map((c) => (
                    <ConflictCard
                        key={c.employee.id}
                        conflict={c}
                        resolutions={resolutions[c.employee.id] ?? {}}
                        onResolve={(field, choice) =>
                            onResolve(c.employee.id, field, choice)
                        }
                    />
                ))}
            {preview.creates
                .filter((c) => !removed.has(c.employee.id))
                .map((c) => (
                    <NewDraftCard
                        key={c.employee.id}
                        creation={c}
                        onRemove={() => onRemove(c.employee.id)}
                    />
                ))}
        </ul>
    );
}
