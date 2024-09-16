import { Pipe, PipeTransform } from '@angular/core';
import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'; // Optional: Use date-fns library if available

@Pipe({
    name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {
    transform(value: any): string {
        if (!value) return 'No date provided';

        const now = new Date();
        const notificationDate = new Date(value); // Ensure the date is in proper format

        const minutesAgo = differenceInMinutes(now, notificationDate);
        const hoursAgo = differenceInHours(now, notificationDate);
        const daysAgo = differenceInDays(now, notificationDate);

        if (minutesAgo < 1) {
            return 'Just now';
        } else if (minutesAgo < 60) {
            return `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
        } else if (hoursAgo < 24) {
            return `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
        } else {
            return `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
        }
    }
}