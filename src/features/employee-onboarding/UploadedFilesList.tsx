import { Button, IconButton, Spinner } from '@economic/taco';
import { da } from '../../data/danishCopy';

export type UploadedFile = {
    id: string;
    name: string;
    size: number;
};

type FileBadge = { label: string; bg: string; text: string };

export function fileBadge(filename: string): FileBadge {
    const ext = filename.toLowerCase().split('.').pop() ?? '';
    switch (ext) {
        case 'pdf':
            return { label: 'PDF', bg: 'bg-red-100', text: 'text-red-700' };
        case 'xls':
        case 'xlsx':
        case 'csv':
            return { label: 'XLS', bg: 'bg-green-100', text: 'text-green-700' };
        case 'doc':
        case 'docx':
            return { label: 'DOC', bg: 'bg-blue-100', text: 'text-blue-700' };
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
            return { label: 'IMG', bg: 'bg-orange-100', text: 'text-orange-700' };
        default:
            return {
                label: (ext || 'FIL').toUpperCase().slice(0, 3),
                bg: 'bg-grey-200',
                text: 'text-neutral-700',
            };
    }
}

export function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024)
        return `${Math.max(1, Math.round(bytes / 1024))} ${da.files.kb}`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} ${da.files.mb}`;
}

export function FileRow({
    file,
    onRemove,
    disabled = false,
}: {
    file: UploadedFile;
    onRemove: () => void;
    disabled?: boolean;
}) {
    const badge = fileBadge(file.name);
    return (
        <li className="flex items-center gap-3 w-full px-3 py-2 bg-white border border-grey-300 rounded-lg">
            <span
                className={`inline-flex items-center justify-center w-12 h-10 rounded shrink-0 text-xs font-bold ${badge.bg} ${badge.text}`}
            >
                {badge.label}
            </span>
            <span className="flex-1 min-w-0 flex flex-col">
                <span className="text-sm font-bold text-neutral-900 truncate">
                    {file.name}
                </span>
                <span className="text-xs text-neutral-500">
                    {formatSize(file.size)} · {da.importDialog.fileReady}
                </span>
            </span>
            <IconButton
                icon="close"
                appearance="discrete"
                onClick={onRemove}
                aria-label={da.actions.remove}
                disabled={disabled}
            />
        </li>
    );
}

type Props = {
    files: UploadedFile[];
    processing: boolean;
    onRemove: (id: string) => void;
    onProcess: () => void;
    /**
     * Hide the inline "Behandl dokumenter" button and spinner. Used by the
     * import modal which renders its own action buttons in the dialog footer.
     */
    hideActions?: boolean;
};

export function UploadedFilesList({
    files,
    processing,
    onRemove,
    onProcess,
    hideActions = false,
}: Props) {
    return (
        <div className="flex flex-col gap-3 w-full h-full min-h-0">
            <ul className="flex flex-col gap-2 w-full max-w-none flex-1 min-h-0 overflow-y-auto">
                {files.map((file) => (
                    <FileRow
                        key={file.id}
                        file={file}
                        onRemove={() => onRemove(file.id)}
                        disabled={processing}
                    />
                ))}
            </ul>

            {!hideActions &&
                (processing ? (
                    <div className="flex items-center justify-center gap-2 py-2">
                        <Spinner />
                        <span className="text-sm text-neutral-700">
                            {da.processing.label}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center justify-end">
                        <Button
                            appearance="primary"
                            onClick={onProcess}
                            disabled={files.length === 0}
                        >
                            {da.actions.process}
                        </Button>
                    </div>
                ))}
        </div>
    );
}
