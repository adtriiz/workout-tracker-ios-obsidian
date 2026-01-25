import { ConfigSchema, DEFAULT_CONFIG } from '../config/ConfigSchema';

describe('ConfigSchema', () => {
    describe('validate', () => {
        it('should validate a correct config', () => {
            const result = ConfigSchema.validate(DEFAULT_CONFIG);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject invalid config types', () => {
            const result = ConfigSchema.validate(null);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Config must be an object');
        });

        it('should reject invalid defaultTemplate', () => {
            const config = {
                ...DEFAULT_CONFIG,
                export: {
                    ...DEFAULT_CONFIG.export,
                    defaultTemplate: 'invalid_template'
                }
            };
            const result = ConfigSchema.validate(config);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Invalid defaultTemplate: invalid_template');
        });

        it('should reject negative restTime', () => {
            const config = {
                ...DEFAULT_CONFIG,
                workout: {
                    ...DEFAULT_CONFIG.workout,
                    defaults: {
                        ...DEFAULT_CONFIG.workout.defaults,
                        restTime: -10
                    }
                }
            };
            const result = ConfigSchema.validate(config);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('restTime must be a positive number');
        });

        it('should reject invalid userBodyweight', () => {
            const config = {
                ...DEFAULT_CONFIG,
                workout: {
                    ...DEFAULT_CONFIG.workout,
                    volume: {
                        ...DEFAULT_CONFIG.workout.volume,
                        userBodyweight: -5
                    }
                }
            };
            const result = ConfigSchema.validate(config);
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('userBodyweight must be a positive number');
        });
    });

    describe('getDefaults', () => {
        it('should return full default config when no section provided', () => {
            const result = ConfigSchema.getDefaults();
            expect(result).toEqual(DEFAULT_CONFIG);
        });

        it('should return section defaults', () => {
            const result = ConfigSchema.getDefaults('export.defaultTemplate');
            expect(result).toBe('dataview');
        });

        it('should return nested section defaults', () => {
            const result = ConfigSchema.getDefaults('workout.defaults.restTime');
            expect(result).toBe(60);
        });

        it('should return null for invalid section', () => {
            const result = ConfigSchema.getDefaults('invalid.path');
            expect(result).toBeNull();
        });
    });

    describe('migrateFromLegacy', () => {
        it('should migrate legacy settings to new config format', () => {
            const legacySettings = {
                yamlMapping: {
                    date: 'workout_date',
                    volume: 'total_volume'
                },
                tags: ['#workout', '#gym'],
                userBodyweight: 75
            };

            const result = ConfigSchema.migrateFromLegacy(legacySettings);

            expect(result.export.templates.dataview.yamlMapping.date).toBe('workout_date');
            // Volume mapping should be removed during migration
            expect(result.export.templates.dataview.yamlMapping.volume).toBeUndefined();
            expect(result.workout.volume.userBodyweight).toBe(75);
            expect(result.meta.lastMigration).toBe('0->1');
        });

        it('should handle empty legacy settings', () => {
            const legacySettings = {};
            const result = ConfigSchema.migrateFromLegacy(legacySettings);
            
            expect(result).toBeDefined();
            expect(result.meta.version).toBe(1);
        });
    });
});