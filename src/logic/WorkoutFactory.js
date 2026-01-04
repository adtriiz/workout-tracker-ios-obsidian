export const WorkoutFactory = {
    createEmpty() {
        return {
            id: Date.now().toString(),
            startTime: new Date().toISOString(),
            templateId: null,
            exercises: [],
        };
    },

    createFromTemplate(template) {
        if (!template) return this.createEmpty();

        return {
            id: Date.now().toString(),
            startTime: new Date().toISOString(),
            templateId: template.id,
            templateName: template.name,
            workoutType: template.workoutType,
            exercises: template.exercises.map(e => ({
                ...e,
                instanceId: Math.random().toString(36).substr(2, 9),
                supersetId: e.supersetId || null,
                sets: e.sets && e.sets.length > 0 ? e.sets.map((s, i) => ({
                    id: Date.now() + '-' + i + '-' + Math.random().toString(36).substr(2, 5),
                    weight: s.weight || 0,
                    reps: s.reps || 0,
                    completed: false,
                    rest: s.rest || 90
                })) : [{ id: '1', weight: 0, reps: 0, completed: false }]
            })),
        };
    },

    applyConfig(workout, overrides) {
        if (!overrides || overrides.length === 0) return workout;

        const updatedExercises = [...workout.exercises];

        overrides.forEach(config => {
            const exercise = updatedExercises[config.exerciseIndex];
            if (exercise) {
                // Generate target sets
                const sets = Array.from({ length: config.targetSets }).map((_, i) => ({
                    id: `${Date.now()}-${i}`,
                    weight: 0,
                    reps: config.targetReps,
                    completed: false
                }));

                updatedExercises[config.exerciseIndex] = {
                    ...exercise,
                    sets: sets
                };
            }
        });

        return {
            ...workout,
            exercises: updatedExercises
        };
    }
};
