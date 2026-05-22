import { Dialog, Button, Badge, Icon } from '@economic/taco';
import type { Employee } from '../../data/mockEmployees';
import type { UploadedFile } from './UploadedFilesList';
import { da } from '../../data/danishCopy';

type Props = {
    open: boolean;
    /** Cancel the import — closes without creating drafts. */
    onClose: () => void;
    /** Commit the import — creates the listed drafts and closes. */
    onConfirm: () => void;
    files: UploadedFile[];
    employees: Employee[];
};

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic']);

function ext(filename: string): string {
    return filename.toLowerCase().split('.').pop() ?? '';
}

function isImage(filename: string): boolean {
    return IMAGE_EXTS.has(ext(filename));
}

type ImgBadge = { label: string; bg: string; text: string };
function imgBadge(filename: string): ImgBadge {
    const e = ext(filename);
    if (IMAGE_EXTS.has(e))
        return { label: 'IMG', bg: 'bg-orange-100', text: 'text-orange-700' };
    if (e === 'pdf')
        return { label: 'PDF', bg: 'bg-red-100', text: 'text-red-700' };
    if (e === 'xls' || e === 'xlsx' || e === 'csv')
        return { label: 'XLS', bg: 'bg-green-100', text: 'text-green-700' };
    if (e === 'doc' || e === 'docx')
        return { label: 'DOC', bg: 'bg-blue-100', text: 'text-blue-700' };
    return {
        label: (e || 'FIL').toUpperCase().slice(0, 3),
        bg: 'bg-grey-200',
        text: 'text-neutral-700',
    };
}

function CreatedRow({
    employeeName,
    sourceFile,
}: {
    employeeName: string;
    sourceFile: string;
}) {
    return (
        <li className="flex items-center gap-3 w-full px-3 py-3 bg-white border border-grey-300 rounded-lg">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded text-neutral-500 shrink-0">
                <Icon name="document" />
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-neutral-900">
                        {employeeName}
                    </span>
                    <Badge color="orange" subtle>
                        {da.processedDialog.draftBadge}
                    </Badge>
                </div>
                <span className="text-xs text-neutral-500 truncate">
                    {sourceFile}
                </span>
            </div>
            <button
                type="button"
                aria-label="Fjern"
                className="inline-flex items-center justify-center w-8 h-8 rounded text-neutral-500 hover:bg-grey-200 hover:text-neutral-900 shrink-0"
            >
                <Icon name="close" />
            </button>
        </li>
    );
}

function FailedRow({ filename }: { filename: string }) {
    const t = da.processedDialog;
    const badge = imgBadge(filename);
    return (
        <li className="flex items-center gap-3 w-full px-3 py-3 bg-red-50 rounded-lg">
            <span
                className={`inline-flex items-center justify-center w-12 h-10 rounded shrink-0 text-xs font-bold ${badge.bg} ${badge.text}`}
            >
                {badge.label}
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-sm font-bold text-neutral-900 truncate">
                    {filename}
                </span>
                <span className="text-xs text-red-700">{t.errorPoorScan}</span>
            </div>
            <Button appearance="default">{t.tryAgain}</Button>
        </li>
    );
}

export function ProcessingCompletedDialog({
    open,
    onClose,
    onConfirm,
    files,
    employees,
}: Props) {
    const t = da.processedDialog;
    // Split dropped files into "successfully read" vs "failed":
    // image files are treated as scan-quality failures; everything else
    // produced a draft. Each successful file pairs 1:1 with an employee in
    // order; if there are fewer files than employees, remaining employees
    // share a generic source line.
    // Every dropped file is treated as a successful read in this prototype;
    // there is no "failed scan" bucket.
    const successFiles = files;
    const failedFiles: typeof files = [];

    // Show all created drafts. If there are more drafts than source files
    // (the prototype guarantees ≥3 drafts for a consistent test experience),
    // we recycle through the available files for each extra draft.
    const successPairs = employees.map((employee, i) => ({
        employee,
        sourceFile:
            successFiles.length > 0
                ? successFiles[i % successFiles.length].name
                : '',
    }));

    return (
        <Dialog
            open={open}
            onChange={(next) => {
                if (!next) onClose();
            }}
            size="md"
        >
            <Dialog.Content aria-label={t.titleN(successPairs.length)}>
                <div className="flex flex-col items-center gap-3 pt-4 pb-2">
                    <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-700">
                        <Icon name="tick" />
                    </span>
                    <h2 className="text-2xl font-bold text-neutral-900 text-center mt-1">
                        {t.titleN(successPairs.length)}
                    </h2>
                </div>

                <div className="flex flex-col gap-4 py-2">
                    {successPairs.length > 0 && (
                        <section className="flex flex-col gap-2">
                            <ul className="flex flex-col gap-2 w-full max-w-none">
                                {successPairs.map((p) => (
                                    <CreatedRow
                                        key={p.employee.id}
                                        employeeName={p.employee.name}
                                        sourceFile={p.sourceFile}
                                    />
                                ))}
                            </ul>
                        </section>
                    )}

                    {failedFiles.length > 0 && (
                        <section className="flex flex-col gap-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                                {t.sectionFailed} · {failedFiles.length}
                            </p>
                            <ul className="flex flex-col gap-2 w-full max-w-none">
                                {failedFiles.map((f) => (
                                    <FailedRow key={f.id} filename={f.name} />
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <Dialog.Footer>
                    <div className="flex items-center justify-end">
                        <Button appearance="primary" onClick={onConfirm}>
                            {t.confirm}
                        </Button>
                    </div>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog>
    );
}
