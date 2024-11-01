import { Observable, Frame } from '@nativescript/core';
import { AuthService } from '../../services/auth.service';

export class LoginViewModel extends Observable {
    private _email: string = '';
    private _password: string = '';
    private _errorMessage: string = '';
    private authService: AuthService;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        if (this._email !== value) {
            this._email = value;
            this.notifyPropertyChange('email', value);
        }
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        if (this._password !== value) {
            this._password = value;
            this.notifyPropertyChange('password', value);
        }
    }

    get errorMessage(): string {
        return this._errorMessage;
    }

    set errorMessage(value: string) {
        if (this._errorMessage !== value) {
            this._errorMessage = value;
            this.notifyPropertyChange('errorMessage', value);
        }
    }

    async onLogin() {
        try {
            const success = await this.authService.login(this.email, this.password);
            if (success) {
                Frame.topmost().navigate({
                    moduleName: "pages/chat/chat-page",
                    clearHistory: true
                });
            } else {
                this.errorMessage = "Échec de la connexion. Veuillez réessayer.";
            }
        } catch (error) {
            this.errorMessage = "Une erreur est survenue. Veuillez réessayer.";
        }
    }
}