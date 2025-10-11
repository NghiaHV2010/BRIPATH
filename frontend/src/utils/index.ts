export function formatDistanceToNow(date: Date, { addSuffix }: { addSuffix: boolean }): React.ReactNode {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    let value: number;
    let unit: string;

    if (diffSec < 60) {
        value = diffSec;
        unit = 'second';
    } else if (diffSec < 3600) {
        value = Math.floor(diffSec / 60);
        unit = 'minute';
    } else if (diffSec < 86400) {
        value = Math.floor(diffSec / 3600);
        unit = 'hour';
    } else if (diffSec < 2592000) {
        value = Math.floor(diffSec / 86400);
        unit = 'day';
    } else if (diffSec < 31536000) {
        value = Math.floor(diffSec / 2592000);
        unit = 'month';
    } else {
        value = Math.floor(diffSec / 31536000);
        unit = 'year';
    }

    const plural = value !== 1 ? 's' : '';
    const suffix = addSuffix ? (diffMs < 0 ? ' from now' : ' ago') : '';

    return `${value} ${unit}${plural}${suffix}`;
}