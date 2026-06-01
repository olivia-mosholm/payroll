import { useRef } from 'react';
import { Button, useDropTarget } from '@economic/taco';
import { da } from '../../data/danishCopy';

type Props = {
    onFiles: (files: File[]) => void;
};

export function DropZone({ onFiles }: Props) {
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
            className={`flex flex-col items-center justify-center py-6 rounded-[10px] border border-dashed transition-colors ${
                isOver
                    ? 'border-blue-500 bg-blue-100'
                    : 'border-[#75A0F5] bg-transparent'
            }`}
            role="button"
            tabIndex={0}
            aria-label={da.dropzone.title}
        >
            <p className="font-bold text-base leading-tight text-neutral-900 mb-0">
                {da.dropzone.title}
            </p>
            <p className="text-sm leading-tight text-neutral-900 mt-3 mb-3">
                {da.dropzone.separator}
            </p>
            <Button appearance="ghost" onClick={handleBrowseClick}>
                {da.dropzone.browse}
            </Button>
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
