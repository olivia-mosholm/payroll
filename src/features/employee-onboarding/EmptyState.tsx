import { EmptyStateIllustration } from './EmptyStateIllustration';

type Props = {
    compact?: boolean;
};

export function EmptyState({ compact: _compact = false }: Props) {
    return (
        <div className="flex flex-col items-center pt-2 pb-0">
            <EmptyStateIllustration />
        </div>
    );
}
