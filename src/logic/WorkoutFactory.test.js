import { WorkoutFactory } from './WorkoutFactory';

describe('WorkoutFactory', () => {
    const mockTemplate = {
        id: 'temp-1',
        name: 'Heavy Chest',
        exercises: [
            { id: 'ex-1', name: 'Bench Press', category: 'CHEST' },
            { id: 'ex-2', name: 'Fly', category: 'CHEST' }
        ]
    };

    it('creates a workout from a template with initialized sets', () => {
        const workout = WorkoutFactory.createFromTemplate(mockTemplate);

        expect(workout.templateId).toBe('temp-1');
        expect(workout.exercises).toHaveLength(2);

        // Check first exercise structure
        const bench = workout.exercises[0];
        expect(bench.name).toBe('Bench Press');
        expect(bench.exerciseType).toBe('weighted'); // Default from factory
        expect(bench.instanceId).toBeDefined();
        expect(bench.sets).toHaveLength(1);
        expect(bench.sets[0]).toEqual(expect.objectContaining({
            weight: 0,
            reps: 0,
            completed: false
        }));
    });

    it('creates an empty workout if no template is provided', () => {
        const workout = WorkoutFactory.createEmpty();
        expect(workout.templateId).toBeNull();
        expect(workout.exercises).toEqual([]);
    });

    it('allows applying target overrides', () => {
        const workout = WorkoutFactory.createFromTemplate(mockTemplate);

        // User wants to do 3 sets of 10 reps for Bench Press
        const overrides = [
            { exerciseIndex: 0, targetSets: 3, targetReps: 10 }
        ];

        const configuredWorkout = WorkoutFactory.applyConfig(workout, overrides);

        const bench = configuredWorkout.exercises[0];
        expect(bench.sets).toHaveLength(3);
        bench.sets.forEach(set => {
            expect(set.reps).toBe(10);
            expect(set.completed).toBe(false);
        });
    });
});
