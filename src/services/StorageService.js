import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    EXERCISES: '@workout_tracker:exercises',
    TEMPLATES: '@workout_tracker:templates',
    LOGS: '@workout_tracker:logs',
    SETTINGS: '@workout_tracker:settings',
};

export const StorageService = {
    async save(key, data) {
        try {
            const jsonValue = JSON.stringify(data);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (e) {
            console.error('Error saving data:', e);
        }
    },

    async load(key) {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Error loading data:', e);
            return null;
        }
    },

    async reset() {
        try {
            await AsyncStorage.clear();
        } catch (e) {
            console.error('Error clearing storage:', e);
        }
    },

    // Helpers
    async getExercises() {
        const exercises = (await this.load(KEYS.EXERCISES)) || [];
        // Migration: ensure all exercises have exerciseType field
        return exercises.map(ex => ({
            ...ex,
            exerciseType: ex.exerciseType || 'weighted',
            equipmentOptions: ex.equipmentOptions || [],
        }));
    },

    async saveExercise(exercise) {
        const exercises = await this.getExercises();
        const index = exercises.findIndex((e) => e.id === exercise.id);
        if (index >= 0) {
            exercises[index] = exercise;
        } else {
            exercises.push(exercise);
        }
        await this.save(KEYS.EXERCISES, exercises);
    },

    async deleteExercise(id) {
        const exercises = await this.getExercises();
        const updated = exercises.filter(e => e.id !== id);
        await this.save(KEYS.EXERCISES, updated);
    },

    async getTemplates() {
        return (await this.load(KEYS.TEMPLATES)) || [];
    },

    async saveTemplate(template) {
        const templates = await this.getTemplates();
        const index = templates.findIndex((t) => t.id === template.id);
        if (index >= 0) {
            templates[index] = template;
        } else {
            templates.push(template);
        }
        await this.save(KEYS.TEMPLATES, templates);
    },

    async deleteTemplate(id) {
        const templates = await this.getTemplates();
        const updated = templates.filter(t => t.id !== id);
        await this.save(KEYS.TEMPLATES, updated);
    },

    async getLogs() {
        return (await this.load(KEYS.LOGS)) || [];
    },

    async saveLog(log) {
        const logs = await this.getLogs();
        logs.push(log);
        await this.save(KEYS.LOGS, logs);
    },

    async deleteLog(id) {
        const logs = await this.getLogs();
        const updated = logs.filter(l => l.id !== id);
        await this.save(KEYS.LOGS, updated);
    },

    async getSettings() {
        const defaultSettings = {
            yamlMapping: {
                date: 'date',
                volume: 'total_volume',
                duration: 'duration',
                type: 'workout_type',
                tags: 'tags',
            },
            tags: ['#workout/gym'],
            userBodyweight: null, // Optional: used for bodyweight exercise volume calculations
        };
        const settings = await this.load(KEYS.SETTINGS);
        // Merge with defaults to ensure new fields are present
        return settings ? { ...defaultSettings, ...settings } : defaultSettings;
    },

    async saveSettings(settings) {
        await this.save(KEYS.SETTINGS, settings);
    },

    async getMuscleGroups() {
        return (await this.load('muscle_groups')) || ['GENERAL', 'CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE'];
    },

    async saveMuscleGroups(groups) {
        await this.save('muscle_groups', groups);
    },
};

export { KEYS };
