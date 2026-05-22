import { useState } from 'react';
import { Dialog, Button, Spinner } from '@economic/taco';
import { DropZone } from './DropZone';
import {
    FileRow,
    type UploadedFile,
} from './UploadedFilesList';
import { useEmployees } from '../../store/employeesStore';
import type { Employee } from '../../data/mockEmployees';
import { additionalMockEmployees } from '../../data/additionalEmployees';
import { da } from '../../data/danishCopy';

let importBatch = 0;

type Step = 'idle' | 'analyzing';

type MatchResult = {
    createsCount: number;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /**
     * Called when import finishes. The parent can use this to show a summary
     * dialog. Receives the snapshot of dropped files and the newly created
     * employees.
     */
    onProcessed: (info?: { files: UploadedFile[]; employees: Employee[] }) => void;
};

function nextId() {
    return `file-${Math.random().toString(36).slice(2, 9)}`;
}

function computeMatches(files: UploadedFile[], employees: Employee[]): MatchResult {
    if (files.length === 0) return { createsCount: 0 };
    const pending = employees.filter((e) => e.status === 'pending');
    const matchCount = Math.min(2, files.length, pending.length);
    const createsCount = Math.max(0, files.length - matchCount);
    return { createsCount };
}

export function ImportDialog({ open, onOpenChange, onProcessed }: Props) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [step, setStep] = useState<Step>('idle');
    const employees = useEmployees();
    const t = da.importDialog;

    const reset = () => {
        setFiles([]);
        setStep('idle');
    };

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
            // Every file produces a draft. Prototype always creates at least
            // 3 drafts so the test experience is consistent.
            const MIN_DRAFTS = 3;
            const computed = computeMatches(filesSnapshot, employees);
            const targetCount =
                filesSnapshot.length === 0
                    ? 0
                    : Math.max(computed.createsCount, MIN_DRAFTS);
            const newOnes: Employee[] = [];
            for (let i = 0; i < targetCount; i++) {
                const template =
                    additionalMockEmployees[
                        (importBatch + i) % additionalMockEmployees.length
                    ];
                newOnes.push({
                    ...template,
                    id: `${template.id}-batch${importBatch}-${i}`,
                    employeeNumber: `${1000 + employees.length + i + 1}`,
                });
            }
            importBatch += targetCount;
            // The parent is responsible for committing the new drafts to the
            // store when the user confirms in the summary dialog.
            onProcessed({ files: filesSnapshot, employees: newOnes });
            reset();
            onOpenChange(false);
        }, 2000);
    };

    const handleClose = () => {
        if (step === 'analyzing') return;
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog
            open={open}
            onChange={(next) => {
                if (!next) reset();
                onOpenChange(next);
            }}
            size="md"
            closeOnEscape={step !== 'analyzing'}
        >
            <Dialog.Content aria-label={t.title}>
                <Dialog.Title>{t.title}</Dialog.Title>

                {step === 'analyzing' ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <Spinner />
                        <span className="text-sm text-neutral-700">
                            {t.analyzing}
                        </span>
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex flex-col gap-4 py-2">
                        <p className="text-sm text-neutral-700">{t.intro}</p>
                        <DropZone onFiles={handleFiles} />
                    </div>
                ) : (
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

                <Dialog.Footer>
                    {step === 'analyzing' ? null : files.length === 0 ? (
                        <div className="flex items-center justify-end gap-3">
                            <Button appearance="default" onClick={handleClose}>
                                {t.actions.cancel}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-end gap-3">
                            <Button appearance="default" onClick={handleClose}>
                                {t.actions.cancel}
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={handleProcess}
                                disabled={files.length === 0}
                            >
                                {t.processN(files.length)}
                            </Button>
                        </div>
                    )}
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog>
    );
}

