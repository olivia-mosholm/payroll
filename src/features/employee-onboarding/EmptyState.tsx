import { EmptyStateIllustration } from './EmptyStateIllustration';
import { da } from '../../data/danishCopy';

type Props = {
    compact?: boolean;
};

export function EmptyState({ compact = false }: Props) {
    return (
        <div className="flex flex-col items-center text-center gap-2 px-7 py-4">
            {!compact && (
                <div className="mb-2">
                    <EmptyStateIllustration />
                </div>
            )}
            <h2 className="font-bold text-2xl leading-9 text-neutral-900">
                {da.empty.heading}
            </h2>
        </div>
    );
}
