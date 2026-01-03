import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme/tokens';
import { Play, Pause, Square, Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react-native';

const LiveWorkout = ({ workout, onAddSet, onUpdateSet, onFinish, onAbort }) => {

    const [timer, setTimer] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [restTimer, setRestTimer] = useState(0);

    useEffect(() => {
        let interval;
        if (!isPaused) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
                setRestTimer((prev) => prev > 0 ? prev - 1 : 0);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPaused]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleToggleSet = (exerciseId, setId, currentCompleted) => {
        onUpdateSet(exerciseId, setId, { completed: !currentCompleted });
        if (!currentCompleted) {
            // Just finished a set, start countdown
            const exercise = workout.exercises.find(e => e.instanceId === exerciseId);
            const set = exercise?.sets.find(s => s.id === setId);
            const restTime = set?.rest ? parseInt(set.rest) : 90;
            setRestTimer(restTime);
        }
    };

    const groupExercises = (exercises) => {
        const groups = [];
        const processedSupersets = new Set();

        exercises.forEach((ex) => {
            if (ex.supersetId) {
                if (!processedSupersets.has(ex.supersetId)) {
                    const supersetExercises = exercises.filter(e => e.supersetId === ex.supersetId);
                    groups.push({ type: 'superset', exercises: supersetExercises, id: ex.supersetId });
                    processedSupersets.add(ex.supersetId);
                }
            } else {
                groups.push({ type: 'single', exercise: ex, id: ex.instanceId });
            }
        });
        return groups;
    };

    const groups = groupExercises(workout.exercises);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onAbort} style={{ padding: 8 }}>
                    <X color={COLORS.error} size={24} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerLabel}>SESSION_TIMER</Text>
                    <Text style={styles.headerTimer}>{formatTime(timer)}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerLabel}>REST_TIMER</Text>
                    <Text style={[styles.headerTimer, { color: COLORS.success }]}>{formatTime(restTimer)}</Text>
                </View>
                <TouchableOpacity style={styles.finishButton} onPress={onFinish}>
                    <Square color={COLORS.background} size={20} fill={COLORS.background} />
                    <Text style={styles.finishButtonText}>FINISH</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {groups.map((group) => (
                    <View key={group.id} style={group.type === 'superset' ? styles.supersetContainer : null}>
                        {group.type === 'superset' && (
                            <View style={styles.supersetTag}>
                                <Text style={styles.supersetTagText}>SUPERSET_GROUP</Text>
                            </View>
                        )}

                        {(group.type === 'superset' ? group.exercises : [group.exercise]).map((exercise) => (
                            <View key={exercise.instanceId} style={styles.exerciseCard}>
                                <View style={styles.exerciseHeader}>
                                    <Text style={styles.exerciseTitle}>{exercise.name.toUpperCase()}</Text>
                                    <Text style={styles.exerciseCategory}>{exercise.category || 'GENERAL'}</Text>
                                </View>

                                <View style={styles.setGrid}>
                                    <View style={styles.setRowHeader}>
                                        <Text style={[styles.setLabel, { flex: 0.5 }]}>SET</Text>
                                        <Text style={[styles.setLabel, { flex: 1 }]}>WEIGHT</Text>
                                        <Text style={[styles.setLabel, { flex: 1 }]}>REPS</Text>
                                        <Text style={[styles.setLabel, { flex: 0.5 }]}></Text>
                                    </View>

                                    {exercise.sets.map((set, setIndex) => (
                                        <View key={set.id} style={[styles.setRow, set.completed && styles.setRowCompleted]}>
                                            <Text style={styles.setNumber}>{setIndex + 1}</Text>

                                            <TextInput
                                                style={styles.setInput}
                                                keyboardType="numeric"
                                                value={set.weight.toString()}
                                                onChangeText={(val) => onUpdateSet(exercise.instanceId, set.id, { weight: parseFloat(val) || 0 })}
                                            />

                                            <TextInput
                                                style={styles.setInput}
                                                keyboardType="numeric"
                                                value={set.reps.toString()}
                                                onChangeText={(val) => onUpdateSet(exercise.instanceId, set.id, { reps: parseInt(val) || 0 })}
                                            />

                                            <TouchableOpacity
                                                style={[styles.checkButton, set.completed && styles.checkButtonActive]}
                                                onPress={() => handleToggleSet(exercise.instanceId, set.id, set.completed)}
                                            >
                                                <Text style={[styles.checkButtonText, set.completed && styles.checkButtonTextActive]}>
                                                    {set.completed ? 'DONE!' : 'LOG'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>

                                <TouchableOpacity style={styles.addSetButton} onPress={() => onAddSet(exercise.instanceId)}>
                                    <Plus color={COLORS.primary} size={16} />
                                    <Text style={styles.addSetButtonText}>ADD_SET</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: BORDERS.thick,
        borderBottomColor: COLORS.primary,
    },
    headerLabel: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.xs,
    },
    headerTimer: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.xxl,
    },
    finishButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
    },
    finishButtonText: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
    },
    content: {
        padding: SPACING.md,
    },
    exerciseCard: {
        backgroundColor: COLORS.surface,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    supersetContainer: {
        padding: SPACING.xs,
        backgroundColor: COLORS.surfaceElevated,
        borderWidth: BORDERS.medium,
        borderColor: COLORS.primary,
        marginBottom: SPACING.md,
    },
    supersetTag: {
        backgroundColor: COLORS.primary,
        alignSelf: 'flex-start',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        marginBottom: SPACING.xs,
    },
    supersetTagText: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: 10,
    },
    exerciseHeader: {
        marginBottom: SPACING.md,
    },
    exerciseTitle: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.lg,
    },
    exerciseCategory: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.xs,
    },
    setGrid: {
        marginBottom: SPACING.sm,
    },
    setRowHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
        paddingHorizontal: SPACING.xs,
    },
    setLabel: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.xs,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
        backgroundColor: COLORS.surfaceElevated,
        padding: SPACING.xs,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
    },
    setRowCompleted: {
        borderColor: COLORS.success,
        backgroundColor: COLORS.success + '20', // Add some transparency if possible, otherwise just use success color maybe? 
        // Wait, React Native doesn't support hex + alpha string concatenation if it's already a var, unless it's a hex string.
        // Assuming COLORS.success is a hex string.
        // Let's safe bet: just border and maybe assume background color change isn't strictly needed if border is clear, 
        // BUT user said "turns green". 
        // Let's try to use a style that definitely looks green.
        backgroundColor: '#00F0FF20', // Fallback or assume custom. 
        // Actually, let's look at tokens.js. I'll stick to a safe green border for now and maybe tint if I can.
        // Re-reading user request: "turns green".
        // I will set borderColor to success and maybe backgroundColor to a hardcoded transparent green for now since I can't guarantee token format.
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
    },
    setNumber: {
        flex: 0.5,
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
        textAlign: 'center',
    },
    setInput: {
        flex: 1,
        backgroundColor: COLORS.background,
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.md,
        padding: SPACING.sm,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        textAlign: 'center',
    },
    checkButton: {
        flex: 0.5,
        backgroundColor: COLORS.surfaceElevated,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
    },
    checkButtonActive: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    checkButtonText: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.xs,
    },
    checkButtonTextActive: {
        color: COLORS.background,
    },
    addSetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        padding: SPACING.sm,
        borderWidth: BORDERS.thin,
        borderStyle: 'dashed',
        borderColor: COLORS.primary,
        marginTop: SPACING.sm,
    },
    addSetButtonText: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.xs,
    },
});

export default LiveWorkout;
