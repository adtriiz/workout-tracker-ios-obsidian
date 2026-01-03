import { format } from 'date-fns';

export const MarkdownGenerator = {
    generate(workout, settings) {
        const { yamlMapping, tags } = settings;
        const dateStr = format(new Date(workout.startTime), 'yyyy-MM-dd HH:mm');

        let markdown = `---\n`;
        markdown += `${yamlMapping.date}: ${dateStr}\n`;
        markdown += `${yamlMapping.type}: ${workout.templateName || 'Manual Session'}\n`;
        markdown += `${yamlMapping.duration}: ${workout.duration} min\n`;
        markdown += `${yamlMapping.volume}: ${this.calculateTotalVolume(workout)}\n`;
        markdown += `${yamlMapping.tags}: ${tags.join(', ')}\n`;
        markdown += `---\n\n`;

        markdown += `# Workout: ${workout.templateName || format(new Date(workout.startTime), 'EEEE, MMM d')}\n\n`;

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
        return workout.exercises.reduce((acc, ex) => {
            return acc + ex.sets.reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0);
        }, 0);
    },

    groupExercises(exercises) {
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
        let exMd = `#### ${exercise.name}\n`;
        exMd += `| Set | Weight | Reps |\n`;
        exMd += `| --- | --- | --- |\n`;
        exercise.sets.forEach((set, i) => {
            exMd += `| ${i + 1} | ${set.weight} | ${set.reps} |\n`;
        });
        return exMd + `\n`;
    }
};
