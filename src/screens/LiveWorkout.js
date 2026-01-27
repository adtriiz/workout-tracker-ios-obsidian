import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, PanResponder, Animated, Alert } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme/tokens';
import { Square, Plus, Trash2, X, Check, Minus, Plus as PlusIcon } from 'lucide-react-native';

// Custom Swipeable Row Component
const SwipeableSetRow = ({ item, isActive, onUpdate, onToggle, onDelete }) => {
    const { exercise, set, index } = item;
    const translateX = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // only active if horizontal swipe is dominant
                return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx < 0) { // Only swipe left
                    translateX.setValue(gestureState.dx);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -100) {
                    // Swiped far enough - trigger delete logic
                    // Animate off screen then call delete
                    Animated.timing(translateX, {
                        toValue: -500,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        onDelete(exercise.instanceId, set.id);
                        // Reset immediately for recycling (though this component likely unmounts)
                        translateX.setValue(0);
                    });
                } else {
                    // Reset
                    Animated.spring(translateX, {
                        toValue: 0,
                        friction: 5,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    return (
        <View style={styles.swipeContainer}>
            {/* Background Delete Layer */}
            <View style={styles.deleteBackground}>
                <Trash2 color={COLORS.error} size={24} />
            </View>

            {/* Foreground Content */}
            <Animated.View
                style={[
                    styles.setRow,
                    set.completed && styles.setRowCompleted,
                    isActive && styles.setRowActive,
                    { transform: [{ translateX }] }
                ]}
                {...panResponder.panHandlers}
            >
                <View style={styles.setInfoContainer}>
                    <Text style={styles.setExerciseName} numberOfLines={1}>
                        {exercise.name}
                    </Text>
                    <View style={styles.setMetaRow}>
                        <Text style={styles.setNumber}>Set {index + 1}</Text>
                        {isActive && <Text style={styles.activeLabel}>CURRENT</Text>}
                    </View>
                </View>

                <TextInput
                    style={[styles.setInput, isActive && styles.setInputActive]}
                    keyboardType="numeric"
                    value={set.weight.toString()}
                    placeholder="KG"
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={(val) => onUpdate(exercise.instanceId, set.id, { weight: parseFloat(val) || 0 })}
                />

                <TextInput
                    style={[styles.setInput, isActive && styles.setInputActive]}
                    keyboardType="numeric"
                    value={set.reps.toString()}
                    placeholder="REPS"
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={(val) => onUpdate(exercise.instanceId, set.id, { reps: parseInt(val) || 0 })}
                />

                <TouchableOpacity
                    style={[styles.checkButton, set.completed && styles.checkButtonActive]}
                    onPress={() => onToggle(exercise.instanceId, set.id, set.completed)}
                >
                    {set.completed ? (
                        <Check size={20} color={COLORS.background} />
                    ) : (
                        <View style={styles.checkCircle} />
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const LiveWorkout = ({ workout, onAddSet, onUpdateSet, onDeleteSet, onFinish, onAbort }) => {
    // ... existing state ... 
    const [timer, setTimer] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [restTimer, setRestTimer] = useState(0);
    const scrollViewRef = useRef(null);

    // ... existing timer useEffect ...
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

    // ... existing helpers ...
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const adjustRestTimer = (delta) => {
        setRestTimer(prev => Math.max(0, prev + delta));
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

    // ... grouping logic ...
    const groupExercises = (exercises) => {
        const groups = [];
        const processedSupersets = new Set();
        const processedSingles = new Set();
        exercises.forEach((ex) => {
            if (ex.supersetId) {
                if (!processedSupersets.has(ex.supersetId)) {
                    const supersetExercises = exercises.filter(e => e.supersetId === ex.supersetId);
                    groups.push({ type: 'superset', exercises: supersetExercises, id: ex.supersetId });
                    processedSupersets.add(ex.supersetId);
                }
            } else {
                if (!processedSingles.has(ex.instanceId)) {
                    groups.push({ type: 'single', exercise: ex, id: ex.instanceId });
                    processedSingles.add(ex.instanceId);
                }
            }
        });
        return groups;
    };

    const getFlatSetSequence = (groupedExercises) => {
        const sequence = [];
        groupedExercises.forEach(group => {
            if (group.type === 'superset') {
                const maxSets = Math.max(...group.exercises.map(e => e.sets.length));
                for (let i = 0; i < maxSets; i++) {
                    group.exercises.forEach(exercise => {
                        if (exercise.sets[i]) {
                            sequence.push({
                                exerciseId: exercise.instanceId,
                                setId: exercise.sets[i].id,
                                completed: exercise.sets[i].completed
                            });
                        }
                    });
                }
            } else {
                group.exercise.sets.forEach(set => {
                    sequence.push({
                        exerciseId: group.exercise.instanceId,
                        setId: set.id,
                        completed: set.completed
                    });
                });
            }
        });
        return sequence;
    };

    const groups = groupExercises(workout.exercises);
    const flatSequence = getFlatSetSequence(groups);
    const findActiveSet = () => flatSequence.find(s => !s.completed) || null;
    const activeSet = findActiveSet();

    const renderHeaderRow = () => (
        <View style={styles.columnHeaderRow}>
            <Text style={[styles.columnHeader, { flex: 1.5 }]}>EXERCISE</Text>
            <Text style={[styles.columnHeader, { flex: 1, textAlign: 'center' }]}>KG</Text>
            <Text style={[styles.columnHeader, { flex: 1, textAlign: 'center' }]}>REPS</Text>
            <Text style={[styles.columnHeader, { width: 48, textAlign: 'center' }]}>LOG</Text>
        </View>
    );

    const renderSuperset = (group) => {
        // Calculate max sets to determine number of rows
        const maxSets = Math.max(...group.exercises.map(e => e.sets.length));
        const rows = [];

        for (let i = 0; i < maxSets; i++) {
            group.exercises.forEach(exercise => {
                if (exercise.sets[i]) {
                    const set = exercise.sets[i];
                    const isActive = activeSet && activeSet.setId === set.id;
                    rows.push(
                        <SwipeableSetRow
                            key={set.id}
                            item={{ exercise, set, index: i }}
                            isActive={isActive}
                            onUpdate={onUpdateSet}
                            onToggle={handleToggleSet}
                            onDelete={onDeleteSet}
                        />
                    );
                }
            });
        }

        return (
            <View key={group.id} style={styles.supersetContainer}>
                <View style={styles.supersetHeader}>
                    <Text style={styles.supersetTitle}>SUPERSET GROUP</Text>
                    <View style={styles.supersetBadges}>
                        {group.exercises.map(ex => (
                            <Text key={ex.instanceId} style={styles.supersetBadgeText}>{ex.name}</Text>
                        ))}
                    </View>
                </View>
                {renderHeaderRow()}
                {rows}
                <View style={styles.supersetActions}>
                    {group.exercises.map(ex => (
                        <TouchableOpacity
                            key={`add-${ex.instanceId}`}
                            style={styles.addSetButtonSmall}
                            onPress={() => onAddSet(ex.instanceId)}
                        >
                            <Plus color={COLORS.primary} size={14} />
                            <Text style={styles.addSetButtonTextSmall}>Add {ex.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderSingleExercise = (group) => {
        const { exercise } = group;
        return (
            <View key={exercise.instanceId} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseTitle}>{exercise.name.toUpperCase()}</Text>
                    {exercise.activeEquipment && (
                        <Text style={styles.exerciseSubtitle}>{exercise.activeEquipment}</Text>
                    )}
                </View>

                {renderHeaderRow()}

                {exercise.sets.map((set, i) => {
                    const isActive = activeSet && activeSet.setId === set.id;
                    return (
                        <SwipeableSetRow
                            key={set.id}
                            item={{ exercise, set, index: i }}
                            isActive={isActive}
                            onUpdate={onUpdateSet}
                            onToggle={handleToggleSet}
                            onDelete={onDeleteSet}
                        />
                    );
                })}

                <TouchableOpacity style={styles.addSetButton} onPress={() => onAddSet(exercise.instanceId)}>
                    <Plus color={COLORS.primary} size={16} />
                    <Text style={styles.addSetButtonText}>ADD SET</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onAbort} style={{ padding: 8 }}>
                            <X color={COLORS.error} size={24} />
                        </TouchableOpacity>
                        <View style={styles.headerTimerContainer}>
                            <Text style={styles.mainTimer}>{formatTime(timer)}</Text>
                            <Text style={styles.timerLabel}>ELAPSED</Text>
                        </View>
                        <View style={styles.headerTimerContainer}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <TouchableOpacity onPress={() => adjustRestTimer(-10)} style={{ padding: 4 }}>
                                    <Minus size={12} color={COLORS.textMuted} />
                                </TouchableOpacity>
                                <Text style={[styles.mainTimer, { color: COLORS.success }]}>{formatTime(restTimer)}</Text>
                                <TouchableOpacity onPress={() => adjustRestTimer(10)} style={{ padding: 4 }}>
                                    <PlusIcon size={12} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.timerLabel}>REST</Text>
                        </View>
                        <TouchableOpacity style={styles.finishButton} onPress={onFinish}>
                            <Square color={COLORS.background} size={20} fill={COLORS.background} />
                            <Text style={styles.finishButtonText}>END</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.content}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                    >
                        {groups.map((group) => (
                            group.type === 'superset'
                                ? renderSuperset(group)
                                : renderSingleExercise(group)
                        ))}
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
    headerTimerContainer: {
        alignItems: 'center',
    },
    mainTimer: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.xl,
        lineHeight: 28,
    },
    timerLabel: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
    },
    finishButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        gap: 6,
    },
    finishButtonText: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
    },
    content: {
        padding: SPACING.md,
        paddingBottom: 100,
    },
    // Single Exercise Card
    exerciseCard: {
        marginBottom: SPACING.lg,
    },
    exerciseHeader: {
        marginBottom: SPACING.xs,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    exerciseTitle: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.lg,
    },
    exerciseSubtitle: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.xs,
    },
    // Superset Styles
    supersetContainer: {
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.primary,
        padding: SPACING.sm,
        backgroundColor: 'rgba(238, 255, 65, 0.05)', // faint primary tint
    },
    supersetHeader: {
        marginBottom: SPACING.md,
    },
    supersetTitle: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.sm,
        marginBottom: 4,
    },
    supersetBadges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    supersetBadgeText: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.xs,
    },
    supersetActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.sm,
    },
    // Set Row Unified Styles
    swipeContainer: {
        marginBottom: SPACING.xs,
        height: 72,
        position: 'relative',
    },
    deleteBackground: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 100,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: SPACING.md,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        // Remove marginBottom because container handles it
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 72,
    },
    setRowCompleted: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.success,
    },
    setRowActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surfaceElevated,
        borderWidth: 2,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 1,
    },
    setInfoContainer: {
        flex: 1.5,
        justifyContent: 'center',
    },
    setExerciseName: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.sm,
        marginBottom: 4,
    },
    setMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    setNumber: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
    },
    activeLabel: {
        color: COLORS.background,
        backgroundColor: COLORS.primary,
        fontSize: 9,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        paddingHorizontal: 4,
        paddingVertical: 1,
    },
    setInput: {
        flex: 1,
        height: 48,
        backgroundColor: COLORS.background,
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.lg,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    setInputActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surface,
    },
    checkButton: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.surfaceElevated,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    checkButtonActive: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
    },
    checkCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.textMuted,
    },
    addSetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        padding: SPACING.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: COLORS.border,
        marginTop: SPACING.xs,
    },
    addSetButtonText: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.sm,
    },
    addSetButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addSetButtonTextSmall: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
    },
    columnHeaderRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.xs,
        gap: SPACING.sm,
    },
    columnHeader: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: 10,
    },
});

export default LiveWorkout;
