import { Button, Icon, IconButton, Spinner } from '@economic/taco';
import { da } from '../../data/danishCopy';

export type UploadedFile = {
    id: string;
    name: string;
    size: number;
};

/**
 * Visual file-type indicator used at the start of every uploaded-file row.
 * Used to be a coloured "PDF" / "XLS" / "IMG" letter chip — the prototype
 * standardised on a single blue document icon since the file-type signal
 * wasn't pulling its weight in user testing.
 */
export function FileTypeIcon() {
    return (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded shrink-0 bg-blue-100 text-neutral-900">
            <Icon name="person-solid" />
        </span>
    );
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
    return (
        <li className="flex items-center gap-3 w-full px-3 py-2 bg-white border border-grey-300 rounded-lg">
            <FileTypeIcon />
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
