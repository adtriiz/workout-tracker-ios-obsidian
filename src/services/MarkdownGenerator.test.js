import { MarkdownGenerator } from './MarkdownGenerator';

describe('MarkdownGenerator', () => {
    const mockWorkout = {
        startTime: '2024-01-25T14:30:00.000Z',
        templateName: 'Upper Body',
        workoutType: 'Strength',
        duration: 45,
        exercises: [
            {
                name: 'Bench Press',
                exerciseType: 'weighted',
                sets: [
                    { weight: 135, reps: 10 },
                    { weight: 135, reps: 8 }
                ]
            },
            {
                name: 'Pull-ups',
                exerciseType: 'bodyweight',
                sets: [
                    { weight: 0, reps: 8 },
                    { weight: 0, reps: 6 }
                ]
            }
        ]
    };

    const mockSettings = {
        yamlMapping: {
            date: 'date',
            duration: 'duration',
            type: 'workout_type',
            tags: 'tags'
        },
        tags: ['#workout'],
        userBodyweight: 180
    };

    it('should generate markdown with numeric duration', () => {
        const markdown = MarkdownGenerator.generate(mockWorkout, mockSettings);
        
        // Duration should be numeric, not with " min" suffix
        expect(markdown).toContain('duration: 45');
        expect(markdown).not.toContain('duration: 45 min');
    });

    it('should not include total_volume in YAML', () => {
        const markdown = MarkdownGenerator.generate(mockWorkout, mockSettings);
        
        // Should not contain total volume field (but should contain per-exercise volumes)
        expect(markdown).not.toContain('total_volume');
        expect(markdown).not.toMatch(/\nvolume:\s*\d+/); // Only match standalone volume field
    });

    it('should include per-exercise volumes for evolution tracking', () => {
        const markdown = MarkdownGenerator.generate(mockWorkout, mockSettings);
        
        // Should contain per-exercise volumes (note: exercise names are sanitized)
        expect(markdown).toContain('Bench_Press_volume:');
        expect(markdown).toContain('Pull_ups_volume:'); // Note the underscore, not hyphen
        
        // Verify the volume calculations
        const benchVolume = 135 * 10 + 135 * 8; // 2430
        const pullupVolume = (180 + 0) * 8 + (180 + 0) * 6; // 180 * 14 = 2520 (bodyweight with user weight)
        
        expect(markdown).toContain(`Bench_Press_volume: ${benchVolume}`);
        expect(markdown).toContain(`Pull_ups_volume: ${pullupVolume}`);
    });

    it('should generate valid YAML frontmatter structure', () => {
        const markdown = MarkdownGenerator.generate(mockWorkout, mockSettings);
        
        // Should start with YAML frontmatter
        expect(markdown).toMatch(/^---/);
        
        // Should contain expected fields in correct order
        expect(markdown).toMatch(/date:\s*2024-01-25/);
        expect(markdown).toMatch(/workout_type:\s*"\[\[Strength\]\]"/);
        expect(markdown).toMatch(/duration:\s*45/);
        expect(markdown).toMatch(/tags:\s*workout/);
        expect(markdown).toMatch(/---\n\n/);
        
        // Should NOT contain total volume
        expect(markdown).not.toContain('total_volume');
    });
});