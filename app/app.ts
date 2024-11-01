import { Application } from '@nativescript/core';
import { initializeApp } from './services/initialize';

// Initialize app services
initializeApp();

Application.run({ moduleName: 'app-root' });