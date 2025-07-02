import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Settings } from './entities/Settings';
import * as path from 'node:path';
import { app } from 'electron';
import {initSettings} from "./init";

export let AppDataSource: DataSource;

export async function initializeDatabase() {
    const dataSource = new DataSource({
        type: 'sqlite',
        database: path.join(app.getPath('userData'), 'pomodoro.db'),
        synchronize: true,
        entities: [Settings],
    });
    try {
        await dataSource.initialize();
        console.log('Database initialized at:', dataSource.options.database);

        await initSettings(dataSource);
        AppDataSource = dataSource; // Permet l'accès ailleurs si nécessaire
    } catch (err) {
        console.error('Database initialization failed:', err);
        throw err; // Propager pour arrêter l'app si besoin
    }
}