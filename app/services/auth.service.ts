import { Observable } from '@nativescript/core';

export class AuthService extends Observable {
    private static instance: AuthService;
    private _isLoggedIn = false;
    private _currentUser: any = null;

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async login(email: string, password: string): Promise<boolean> {
        try {
            // Implement secure login logic
            this._isLoggedIn = true;
            this._currentUser = { email };
            this.notifyPropertyChange('isLoggedIn', this._isLoggedIn);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    }

    async logout(): Promise<void> {
        this._isLoggedIn = false;
        this._currentUser = null;
        this.notifyPropertyChange('isLoggedIn', this._isLoggedIn);
    }

    get isLoggedIn(): boolean {
        return this._isLoggedIn;
    }

    get currentUser(): any {
        return this._currentUser;
    }
}