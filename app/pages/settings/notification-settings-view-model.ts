import { Observable } from '@nativescript/core';
import { NotificationService } from '../../services/notification.service';
import { MemoryService } from '../../services/memory.service';

export class NotificationSettingsViewModel extends Observable {
    private notificationService: NotificationService;
    private memoryService: MemoryService;
    private _dailyReminder: boolean = true;
    private _suggestionsEnabled: boolean = true;
    private _quietHoursStart = { hour: 22, minute: 0 };
    private _quietHoursEnd = { hour: 7, minute: 0 };

    constructor() {
        super();
        this.notificationService = NotificationService.getInstance();
        this.memoryService = MemoryService.getInstance();
        this.loadSettings();
    }

    async loadSettings() {
        const preferences = await this.memoryService.getUserPreference('notifications');
        if (preferences) {
            this.dailyReminder = preferences.dailyReminder;
            this.suggestionsEnabled = preferences.suggestionsEnabled;
            
            const [startHours, startMinutes] = preferences.quietHoursStart.split(':').map(Number);
            const [endHours, endMinutes] = preferences.quietHoursEnd.split(':').map(Number);
            
            this.quietHoursStart = { hour: startHours, minute: startMinutes };
            this.quietHoursEnd = { hour: endHours, minute: endMinutes };
        }
    }

    async saveSettings() {
        const settings = {
            dailyReminder: this.dailyReminder,
            suggestionsEnabled: this.suggestionsEnabled,
            quietHoursStart: `${this.quietHoursStart.hour.toString().padStart(2, '0')}:${this.quietHoursStart.minute.toString().padStart(2, '0')}`,
            quietHoursEnd: `${this.quietHoursEnd.hour.toString().padStart(2, '0')}:${this.quietHoursEnd.minute.toString().padStart(2, '0')}`
        };

        await this.memoryService.saveUserPreference('notifications', settings);

        if (this.dailyReminder) {
            await this.notificationService.scheduleDailyReminder('09:00');
        } else {
            await this.notificationService.cancelNotification(1);
        }
    }

    async testNotification() {
        await this.notificationService.scheduleNotification({
            title: 'Test de notification',
            body: 'Les notifications fonctionnent correctement !',
            at: new Date(Date.now() + 3000)
        });
    }

    // Getters and setters
    get dailyReminder(): boolean {
        return this._dailyReminder;
    }

    set dailyReminder(value: boolean) {
        if (this._dailyReminder !== value) {
            this._dailyReminder = value;
            this.notifyPropertyChange('dailyReminder', value);
            this.saveSettings();
        }
    }

    get suggestionsEnabled(): boolean {
        return this._suggestionsEnabled;
    }

    set suggestionsEnabled(value: boolean) {
        if (this._suggestionsEnabled !== value) {
            this._suggestionsEnabled = value;
            this.notifyPropertyChange('suggestionsEnabled', value);
            this.saveSettings();
        }
    }

    get quietHoursStart(): { hour: number; minute: number } {
        return this._quietHoursStart;
    }

    set quietHoursStart(value: { hour: number; minute: number }) {
        this._quietHoursStart = value;
        this.notifyPropertyChange('quietHoursStart', value);
        this.saveSettings();
    }

    get quietHoursEnd(): { hour: number; minute: number } {
        return this._quietHoursEnd;
    }

    set quietHoursEnd(value: { hour: number; minute: number }) {
        this._quietHoursEnd = value;
        this.notifyPropertyChange('quietHoursEnd', value);
        this.saveSettings();
    }
}