import { Observable } from '@nativescript/core';
import { AIService } from '../../services/ai.service';
import { MemoryService } from '../../services/memory.service';

interface ChatMessage {
    message: string;
    isUser: boolean;
    timestamp: string;
    avatar: string;
    canPlayVoice: boolean;
}

export class ChatViewModel extends Observable {
    private aiService: AIService;
    private memoryService: MemoryService;
    private _messages: Array<ChatMessage> = [];
    private _messageText: string = '';
    private _isProcessing: boolean = false;

    constructor() {
        super();
        this.aiService = AIService.getInstance();
        this.memoryService = MemoryService.getInstance();
        this.loadChatHistory();
    }

    async loadChatHistory() {
        const history = await this.memoryService.getChatHistory();
        this._messages = history;
        this.notifyPropertyChange('messages', this._messages);
    }

    async sendMessage() {
        if (!this.messageText.trim() || this._isProcessing) return;

        const userMessage: ChatMessage = {
            message: this.messageText,
            isUser: true,
            timestamp: new Date().toLocaleTimeString(),
            avatar: '~/assets/user-avatar.png',
            canPlayVoice: false
        };

        this._messages.push(userMessage);
        this.notifyPropertyChange('messages', this._messages);
        this.messageText = '';

        this._isProcessing = true;
        try {
            const response = await this.aiService.generateResponse(userMessage.message);
            const aiMessage: ChatMessage = {
                message: response,
                isUser: false,
                timestamp: new Date().toLocaleTimeString(),
                avatar: '~/assets/ai-avatar.png',
                canPlayVoice: true
            };
            
            this._messages.push(aiMessage);
            this.notifyPropertyChange('messages', this._messages);
            
            // Save to memory
            await this.memoryService.saveChatMessage(userMessage);
            await this.memoryService.saveChatMessage(aiMessage);
        } catch (error) {
            console.error('Failed to get AI response:', error);
        } finally {
            this._isProcessing = false;
        }
    }

    async startVoiceInput() {
        // Implement voice input logic
    }

    async playVoice(message: string) {
        await this.aiService.synthesizeSpeech(message);
    }

    get messages(): Array<ChatMessage> {
        return this._messages;
    }

    get messageText(): string {
        return this._messageText;
    }

    set messageText(value: string) {
        if (this._messageText !== value) {
            this._messageText = value;
            this.notifyPropertyChange('messageText', value);
        }
    }
}