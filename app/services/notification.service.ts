import { Observable } from '@nativescript/core';
import { MemoryService } from './memory.service';

export class NotificationService extends Observable {
    private static instance: NotificationService;
    private memoryService: MemoryService;
    private localNotifications: any;

    private constructor() {
        super();
        this.memoryService = MemoryService.getInstance();
        this.initialize();
    }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    private async initialize() {
        try {
            // Dynamically import local notifications to handle preview mode
            const notifications = await import('@nativescript/local-notifications');
            this.localNotifications = notifications.LocalNotifications;
            await this.localNotifications.requestPermission();
            this.setupDefaultNotifications();
        } catch (error) {
            console.log('Local notifications not available in preview mode');
        }
    }

    private async setupDefaultNotifications() {
        const preferences = await this.memoryService.getUserPreference('notifications');
        if (!preferences) {
            await this.memoryService.saveUserPreference('notifications', {
                dailyReminder: true,
                suggestionsEnabled: true,
                quietHoursStart: '22:00',
                quietHoursEnd: '07:00'
            });
        }
    }

    async scheduleNotification(options: {
        title: string;
        body: string;
        id?: number;
        at?: Date;
        sound?: string;
        interval?: 'minute' | 'hour' | 'day' | 'week' | 'month';
    }) {
        if (!this.localNotifications) {
            console.log('Notification scheduled (preview mode):', options);
            return Math.floor(Math.random() * 10000);
        }

        const notificationId = options.id || Math.floor(Math.random() * 10000);

        await this.localNotifications.schedule([{
            id: notificationId,
            title: options.title,
            body: options.body,
            at: options.at || new Date(),
            sound: options.sound || 'default',
            interval: options.interval,
            forceShowWhenInForeground: true,
        }]);

        return notificationId;
    }

    async scheduleDailyReminder(time: string) {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const scheduleTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        if (scheduleTime <= now) {
            scheduleTime.setDate(scheduleTime.getDate() + 1);
        }

        return this.scheduleNotification({
            id: 1,
            title: 'AiAssist - Rappel quotidien',
            body: 'Prenez un moment pour discuter avec votre assistant AI',
            at: scheduleTime,
            interval: 'day'
        });
    }

    async scheduleSuggestion(suggestion: string, delay: number = 30) {
        const scheduleTime = new Date(Date.now() + delay * 60000);

        return this.scheduleNotification({
            title: 'AiAssist - Suggestion',
            body: suggestion,
            at: scheduleTime
        });
    }

    async cancelNotification(id: number) {
        if (!this.localNotifications) {
            console.log('Notification cancelled (preview mode):', id);
            return;
        }
        await this.localNotifications.cancel(id);
    }

    async cancelAllNotifications() {
        if (!this.localNotifications) {
            console.log('All notifications cancelled (preview mode)');
            return;
        }
        await this.localNotifications.cancelAll();
    }

    async isQuietHours(): Promise<boolean> {
        const preferences = await this.memoryService.getUserPreference('notifications');
        if (!preferences) return false;

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        return currentTime >= preferences.quietHoursStart && currentTime <= preferences.quietHoursEnd;
    }
}