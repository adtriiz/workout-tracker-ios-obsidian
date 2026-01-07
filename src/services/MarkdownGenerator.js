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
        markdown += `${yamlMapping.volume}: ${this.calculateTotalVolume(workout, settings)}\n`;

        // Per-exercise volume properties
        if (workout.exercises) {
            const volumeMap = {};
            workout.exercises.forEach(ex => {
                if (!ex.name) return;
                const vol = this.calculateExerciseVolume(ex, settings);
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

    calculateTotalVolume(workout, settings) {
        if (!workout || !workout.exercises) return 0;
        return workout.exercises.reduce((acc, ex) => acc + this.calculateExerciseVolume(ex, settings), 0);
    },

    calculateExerciseVolume(exercise, settings) {
        if (!exercise || !exercise.sets) return 0;
        const userBW = parseFloat(settings?.userBodyweight) || 0;
        const isBW = exercise.exerciseType === 'bodyweight';

        return exercise.sets.reduce((acc, set) => {
            const addedWeight = parseFloat(set.weight) || 0;
            const reps = parseFloat(set.reps) || 0;

            if (isBW) {
                // Volume = (User BW + Added Weight) * Reps
                // If userBW is 0 and addedWeight is 0, it counts as reps only (simplified to reps if you want, 
                // but let's stick to the math: (0+0)*reps = 0. 
                // Plan said: "If not set, bodyweight exercises count reps only."
                // To accurately reflect "reps only" in the volume number, 
                // we'd have to treat reps as volume.
                if (userBW === 0 && addedWeight === 0) {
                    return acc + reps;
                }
                return acc + ((userBW + addedWeight) * reps);
            }

            return acc + (addedWeight * reps);
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
        const eqInfo = exercise.activeEquipment ? ` (${exercise.activeEquipment})` : '';
        const bwInfo = exercise.exerciseType === 'bodyweight' ? ' [BW]' : '';
        let exMd = `#### ${exercise.name || 'Unknown Exercise'}${bwInfo}${eqInfo}\n`;
        exMd += `| Set | Weight | Reps |\n`;
        exMd += `| --- | --- | --- |\n`;

        const sets = exercise.sets || [];
        sets.forEach((set, i) => {
            let weightDisplay = set.weight || 0;
            if (exercise.exerciseType === 'bodyweight') {
                weightDisplay = set.weight > 0 ? `+${set.weight}` : 'BW';
            }
            exMd += `| ${i + 1} | ${weightDisplay} | ${set.reps || 0} |\n`;
        });
        return exMd + `\n`;
    }
};
