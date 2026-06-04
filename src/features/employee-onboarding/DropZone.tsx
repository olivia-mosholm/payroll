import { useRef } from 'react';
import { Button, Heading, Text, useDropTarget } from '@economic/taco';
import { da } from '../../data/danishCopy';

type Props = {
    onFiles: (files: File[]) => void;
    /** Optional heading rendered inside the dashed drop zone. */
    heading?: string;
    /**
     * Optional descriptive content rendered inside the dashed-border
     * dropzone. Accepts a ReactNode so callers can embed links/buttons.
     */
    description?: React.ReactNode;
    /**
     * When true, suppress the inline "eller / Vælg filer" affordance. The
     * dropzone only handles drag-and-drop in this mode; the caller renders
     * its own buttons below it.
     */
    hideBrowseButton?: boolean;
};

export function DropZone({
    onFiles,
    heading,
    description,
    hideBrowseButton,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop: React.DragEventHandler = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) onFiles(files);
    };

    const [isOver, dropHandlers] = useDropTarget(handleDrop);

    const handleBrowseClick = () => inputRef.current?.click();

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length > 0) onFiles(files);
        // Reset so the same file can be picked again
        e.target.value = '';
    };

    return (
        <div
            {...dropHandlers}
            className={`w-full max-w-2xl flex flex-col items-center justify-center pt-10 pb-20 px-8 rounded-[10px] border border-dashed transition-colors ${
                isOver
                    ? 'border-blue-400 bg-blue-100'
                    : 'border-[#75A0F5] bg-transparent'
            }`}
            role="button"
            tabIndex={0}
            aria-label={da.dropzone.title}
        >
            {heading ? (
                <Heading level={2} size="md" className="mb-4 text-center">{heading}</Heading>
            ) : !description ? (
                <Text bold>{da.dropzone.title}</Text>
            ) : null}
            {description && (
                <Text size="md" color="secondary" as="p" className="max-w-[400px] text-center mt-3 mb-0">
                    {description}
                </Text>
            )}
            {!hideBrowseButton && (
                <>
                    <Text size="sm" as="p" className="mt-3 mb-3">{da.dropzone.separator}</Text>
                    <Button appearance="ghost" onClick={handleBrowseClick}>
                        {da.dropzone.browse}
                    </Button>
                </>
            )}
            <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                onChange={handleInputChange}
                className="hidden"
                aria-hidden="true"
            />
        </div>
    );
}
