import { format } from 'date-fns';

export const MarkdownGenerator = {
    generate(workout, settings) {
        const { yamlMapping, tags } = settings;
        const dateStr = format(new Date(workout.startTime), 'yyyy-MM-dd HH:mm');
        const cleanTags = tags.map(t => t.replace('#', '')).join(', ');
        const workoutType = workout.workoutType ? `"[[${workout.workoutType}]]"` : '';

        let markdown = `---\n`;
        markdown += `${yamlMapping.date}: ${dateStr}\n`;
        markdown += `${yamlMapping.type}: ${workoutType}\n`;
        markdown += `${yamlMapping.duration}: ${workout.duration} min\n`;
        markdown += `${yamlMapping.volume}: ${this.calculateTotalVolume(workout)}\n`;

        // Per-exercise volume properties
        if (workout.exercises) {
            const volumeMap = {};
            workout.exercises.forEach(ex => {
                if (!ex.name) return;
                const vol = this.calculateExerciseVolume(ex);
                if (vol > 0) {
                    const key = `${ex.name.replace(/[^a-zA-Z0-9]/g, '_')}_volume`;
                    if (volumeMap[key]) {
                        volumeMap[key] += vol;
                    } else {
                        volumeMap[key] = vol;
                    }
                }
            });

            Object.entries(volumeMap).forEach(([key, val]) => {
                markdown += `${key}: ${val}\n`;
            });
        }

        markdown += `${yamlMapping.tags}: ${cleanTags}\n`;
        markdown += `---\n\n`;

        markdown += `# ${workout.templateName || format(new Date(workout.startTime), 'EEEE, MMM d')} - ${format(new Date(workout.startTime), 'yyyy-MM-dd')}\n\n`;

        const groups = this.groupExercises(workout.exercises);

        groups.forEach((group, index) => {
            if (group.type === 'superset') {
                markdown += `### Superset ${index + 1}\n`;
                group.exercises.forEach(ex => {
                    markdown += this.formatExercise(ex);
                });
                markdown += `\n`;
            } else {
                markdown += this.formatExercise(group.exercise);
                markdown += `\n`;
            }
        });

        return markdown;
    },

    calculateTotalVolume(workout) {
        if (!workout || !workout.exercises) return 0;
        return workout.exercises.reduce((acc, ex) => acc + this.calculateExerciseVolume(ex), 0);
    },

    calculateExerciseVolume(exercise) {
        if (!exercise || !exercise.sets) return 0;
        return exercise.sets.reduce((acc, set) => {
            const weight = parseFloat(set.weight) || 0;
            const reps = parseFloat(set.reps) || 0;
            return acc + (weight * reps);
        }, 0);
    },

    groupExercises(exercises) {
        if (!exercises) return [];
        const groups = [];
        const processedSupersets = new Set();

        exercises.forEach((ex) => {
            if (ex.supersetId) {
                if (!processedSupersets.has(ex.supersetId)) {
                    const supersetExercises = exercises.filter(e => e.supersetId === ex.supersetId);
                    groups.push({ type: 'superset', exercises: supersetExercises });
                    processedSupersets.add(ex.supersetId);
                }
            } else {
                groups.push({ type: 'single', exercise: ex });
            }
        });

        return groups;
    },

    formatExercise(exercise) {
        if (!exercise) return '';
        let exMd = `#### ${exercise.name || 'Unknown Exercise'}\n`;
        exMd += `| Set | Weight | Reps |\n`;
        exMd += `| --- | --- | --- |\n`;

        const sets = exercise.sets || [];
        sets.forEach((set, i) => {
            exMd += `| ${i + 1} | ${set.weight || 0} | ${set.reps || 0} |\n`;
        });
        return exMd + `\n`;
    }
};
