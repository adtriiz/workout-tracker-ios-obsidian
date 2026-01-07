import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme/tokens';
import { X, Play, Settings2, Edit2, Link as LinkIcon, ArrowUp, ArrowDown } from 'lucide-react-native';
import { WorkoutFactory } from '../logic/WorkoutFactory';
import TemplateEditor from './TemplateEditor';

const WorkoutSetup = ({ template, exercises: allExercises, onStart, onClose }) => {
    const [workoutConfig, setWorkoutConfig] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Initialize draft workout from template or empty
        const draft = WorkoutFactory.createFromTemplate(template);
        setWorkoutConfig(draft);
    }, [template]);

    const handleSaveEdit = (updatedTemplate) => {
        setWorkoutConfig(prev => ({
            ...prev,
            exercises: updatedTemplate.exercises
        }));
        setIsEditing(false);
    };

    const handleUpdateSet = (exerciseInstanceId, setIndex, field, value) => {
        setWorkoutConfig(prev => ({
            ...prev,
            exercises: prev.exercises.map(ex =>
                ex.instanceId === exerciseInstanceId
                    ? {
                        ...ex,
                        sets: ex.sets.map((s, i) =>
                            i === setIndex ? { ...s, [field]: value } : s
                        )
                    }
                    : ex
            )
        }));
    };

    const handleUpdateEquipment = (exerciseInstanceId, equipment) => {
        setWorkoutConfig(prev => ({
            ...prev,
            exercises: prev.exercises.map(ex =>
                ex.instanceId === exerciseInstanceId ? { ...ex, activeEquipment: equipment } : ex
            )
        }));
    };

    const handleMove = (index, direction) => {
        const newExercises = [...workoutConfig.exercises];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newExercises.length) {
            [newExercises[index], newExercises[targetIndex]] = [newExercises[targetIndex], newExercises[index]];
            setWorkoutConfig(prev => ({ ...prev, exercises: newExercises }));
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

    if (!workoutConfig) return <View style={styles.container} />;

    const groups = groupExercises(workoutConfig.exercises);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose}>
                    <X color={COLORS.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>SESSION_CONFIG</Text>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Edit2 color={COLORS.primary} size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.infoCard}>
                    <Text style={styles.label}>PROTOCOL:</Text>
                    <Text style={styles.templateName}>{template ? template.name.toUpperCase() : 'FREESTYLE'}</Text>
                </View>

                <Text style={styles.sectionTitle}>EXERCISE_SEQUENCE</Text>

                {workoutConfig.exercises.length === 0 ? (
                    <Text style={styles.emptyText}>NO_EXERCISES_QUEUED</Text>
                ) : (
                    groups.map((group) => (
                        <View key={group.id} style={group.type === 'superset' ? styles.supersetContainer : null}>
                            {group.type === 'superset' && (
                                <View style={styles.supersetTag}>
                                    <LinkIcon color={COLORS.background} size={10} />
                                    <Text style={styles.supersetTagText}>SUPERSET_GROUP</Text>
                                </View>
                            )}

                            {(group.type === 'superset' ? group.exercises : [group.exercise]).map((ex, exIdxInGroup) => {
                                const globalExIndex = workoutConfig.exercises.findIndex(e => e.instanceId === ex.instanceId);
                                return (
                                    <View key={ex.instanceId} style={styles.exerciseCard}>
                                        <View style={styles.cardHeader}>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                    <Text style={styles.exerciseName}>{ex.name.toUpperCase()}</Text>
                                                    {ex.exerciseType === 'bodyweight' && (
                                                        <View style={[styles.badge, styles.badgeBW]}>
                                                            <Text style={styles.badgeText}>BW</Text>
                                                        </View>
                                                    )}
                                                    {ex.activeEquipment && (
                                                        <View style={[styles.badge, styles.badgeEquipment]}>
                                                            <Text style={styles.badgeText}>{ex.activeEquipment}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.exerciseSubtitle}>{ex.category}</Text>
                                            </View>
                                            <View style={styles.headerActions}>
                                                <TouchableOpacity onPress={() => handleMove(globalExIndex, 'up')} disabled={globalExIndex === 0}>
                                                    <ArrowUp color={globalExIndex === 0 ? COLORS.border : COLORS.textMuted} size={16} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleMove(globalExIndex, 'down')} disabled={globalExIndex === workoutConfig.exercises.length - 1}>
                                                    <ArrowDown color={globalExIndex === workoutConfig.exercises.length - 1 ? COLORS.border : COLORS.textMuted} size={16} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                        {ex.exerciseType === 'weighted' && ex.equipmentOptions && ex.equipmentOptions.length > 0 && (
                                            <View style={styles.equipmentToggle}>
                                                {ex.equipmentOptions.map(eq => (
                                                    <TouchableOpacity
                                                        key={eq}
                                                        style={[styles.eqChip, ex.activeEquipment === eq && styles.eqChipActive]}
                                                        onPress={() => handleUpdateEquipment(ex.instanceId, eq)}
                                                    >
                                                        <Text style={[styles.eqChipText, ex.activeEquipment === eq && styles.eqChipTextActive]}>{eq}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}

                                        <View style={styles.statsContainer}>
                                            <View style={styles.statHeader}>
                                                <Text style={[styles.statLabel, { width: 40 }]}>SET</Text>
                                                <Text style={[styles.statLabel, { flex: 1 }]}>{ex.exerciseType === 'bodyweight' ? '+ KG' : 'KG'}</Text>
                                                <Text style={[styles.statLabel, { flex: 1 }]}>REPS</Text>
                                                <Text style={[styles.statLabel, { width: 50 }]}>REST</Text>
                                            </View>
                                            {ex.sets.map((set, i) => (
                                                <View key={i} style={styles.statRow}>
                                                    <Text style={styles.statSet}>{i + 1}</Text>
                                                    <TextInput
                                                        style={styles.statInput}
                                                        keyboardType="numeric"
                                                        value={set.weight.toString()}
                                                        onChangeText={(v) => handleUpdateSet(ex.instanceId, i, 'weight', parseFloat(v) || 0)}
                                                    />
                                                    <TextInput
                                                        style={styles.statInput}
                                                        keyboardType="numeric"
                                                        value={set.reps.toString()}
                                                        onChangeText={(v) => handleUpdateSet(ex.instanceId, i, 'reps', parseInt(v) || 0)}
                                                    />
                                                    <Text style={styles.statRest}>{set.rest}s</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    ))
                )}
            </ScrollView>

            <Modal visible={isEditing} animationType="slide">
                <TemplateEditor
                    initialTemplate={{ ...template, exercises: workoutConfig.exercises }}
                    exercises={allExercises}
                    onSave={handleSaveEdit}
                    onCancel={() => setIsEditing(false)}
                />
            </Modal>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.startButton} onPress={() => onStart(workoutConfig)}>
                    <Play color={COLORS.background} size={24} fill={COLORS.background} />
                    <Text style={styles.startButtonText}>INITIATE_SEQUENCE</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        borderBottomWidth: BORDERS.medium,
        borderBottomColor: COLORS.border,
        paddingBottom: SPACING.sm,
    },
    headerTitle: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.lg,
    },
    content: {
        padding: SPACING.md,
    },
    infoCard: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.primary,
        marginBottom: SPACING.xl,
    },
    label: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        marginBottom: 4,
    },
    templateName: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.xl,
    },
    sectionTitle: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
        marginBottom: SPACING.md,
    },
    exerciseCard: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        marginBottom: SPACING.md,
    },
    exerciseName: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
    },
    exerciseSubtitle: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        marginTop: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    headerActions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeBW: {
        backgroundColor: COLORS.success,
    },
    badgeEquipment: {
        backgroundColor: COLORS.primary,
    },
    badgeText: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: 8,
    },
    equipmentToggle: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: SPACING.md,
        paddingBottom: SPACING.sm,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
    eqChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        borderRadius: 4,
    },
    eqChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    eqChipText: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 9,
    },
    eqChipTextActive: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.xs,
        marginBottom: 4,
    },
    statLabel: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 8,
        textAlign: 'center',
    },
    statsContainer: {
        gap: 4,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statSet: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: 10,
        width: 40,
        textAlign: 'center',
    },
    statInput: {
        flex: 1,
        backgroundColor: COLORS.surfaceElevated,
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 12,
        padding: 4,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: COLORS.border,
        textAlign: 'center',
    },
    statRest: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        width: 50,
        textAlign: 'right',
    },
    emptyText: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        textAlign: 'center',
        marginTop: SPACING.xl,
    },
    footer: {
        padding: SPACING.md,
        borderTopWidth: BORDERS.medium,
        borderTopColor: COLORS.border,
    },
    startButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        gap: SPACING.sm,
    },
    startButtonText: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.lg,
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        marginBottom: SPACING.xs,
    },
    supersetTagText: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: 10,
    },
});

export default WorkoutSetup;
