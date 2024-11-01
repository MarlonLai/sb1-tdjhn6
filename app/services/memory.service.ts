import { Observable } from '@nativescript/core';
import { Couchbase } from '@nativescript/couchbase';

export class MemoryService extends Observable {
    private static instance: MemoryService;
    private database: Couchbase;

    private constructor() {
        super();
        this.database = new Couchbase('aiassist_memory');
    }

    static getInstance(): MemoryService {
        if (!MemoryService.instance) {
            MemoryService.instance = new MemoryService();
        }
        return MemoryService.instance;
    }

    async saveChatMessage(message: any): Promise<void> {
        const timestamp = new Date().getTime();
        await this.database.createDocument({
            type: 'chat_message',
            content: message,
            timestamp
        });
    }

    async getChatHistory(): Promise<any[]> {
        const query = this.database.query({
            select: [],
            where: [{ property: 'type', comparison: 'equalTo', value: 'chat_message' }],
            order: [{ property: 'timestamp', direction: 'desc' }]
        });
        return query.map(doc => doc.content);
    }

    async saveUserPreference(key: string, value: any): Promise<void> {
        await this.database.createDocument({
            type: 'preference',
            key,
            value,
            timestamp: new Date().getTime()
        });
    }

    async getUserPreference(key: string): Promise<any> {
        const query = this.database.query({
            select: [],
            where: [
                { property: 'type', comparison: 'equalTo', value: 'preference' },
                { property: 'key', comparison: 'equalTo', value: key }
            ],
            order: [{ property: 'timestamp', direction: 'desc' }],
            limit: 1
        });
        return query.length > 0 ? query[0].value : null;
    }

    async clearMemory(): Promise<void> {
        await this.database.destroyDatabase();
        this.database = new Couchbase('aiassist_memory');
    }
}