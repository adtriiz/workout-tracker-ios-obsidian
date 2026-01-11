import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme/tokens';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Save, Clock, Dumbbell, Hash, Link as LinkIcon, Unlink } from 'lucide-react-native';

const TemplateEditor = ({ exercises, onSave, onCancel, initialTemplate = null }) => {
    const [name, setName] = useState(initialTemplate ? initialTemplate.name : '');
    const [workoutType, setWorkoutType] = useState(initialTemplate ? initialTemplate.workoutType : '');
    const [templateExercises, setTemplateExercises] = useState(
        initialTemplate ? initialTemplate.exercises.map(ex => ({
            ...ex,
            templateId: ex.templateId || Date.now().toString() + Math.random(),
            sets: ex.sets || Array.from({ length: 3 }).map((_, i) => ({
                id: Date.now() + i,
                weight: '',
                reps: '',
                rest: '90'
            }))
        })) : []
    );
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    // Add Exercise Modal State
    const [selectedGroup, setSelectedGroup] = useState('ALL');
    const muscleGroups = ['ALL', ...new Set(exercises.map(e => e.category || 'GENERAL'))].sort();

    const handleAddExercise = (exercise) => {
        // Create a new template exercise instance with default 3 sets
        const newExercise = {
            ...exercise,
            templateId: Date.now().toString() + Math.random(), // unique ID for this instance in template
            sets: Array.from({ length: 3 }).map((_, i) => ({
                id: Date.now() + i,
                weight: '',
                reps: '',
                rest: '90' // default rest 90s
            })),
            isSuperset: false,
        };
        setTemplateExercises([...templateExercises, newExercise]);
        setIsAddModalVisible(false);
    };

    const handleUpdateSet = (exerciseIndex, setIndex, field, value) => {
        const updated = [...templateExercises];
        updated[exerciseIndex].sets[setIndex][field] = value;
        setTemplateExercises(updated);
    };

    const handleUpdateEquipment = (exerciseIndex, equipment) => {
        const updated = [...templateExercises];
        updated[exerciseIndex].activeEquipment = equipment;
        setTemplateExercises(updated);
    };

    const handleAddSet = (exerciseIndex) => {
        const updated = [...templateExercises];
        const previousSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
        updated[exerciseIndex].sets.push({
            id: Date.now(),
            weight: previousSet ? previousSet.weight : '',
            reps: previousSet ? previousSet.reps : '',
            rest: previousSet ? previousSet.rest : '90',
        });
        setTemplateExercises(updated);
    };

    const handleRemoveSet = (exerciseIndex, setIndex) => {
        const updated = [...templateExercises];
        updated[exerciseIndex].sets.splice(setIndex, 1);
        setTemplateExercises(updated);
    };

    const handleRemoveExercise = (index) => {
        const updated = [...templateExercises];
        updated.splice(index, 1);
        setTemplateExercises(updated);
    };

    const handleMove = (index, direction) => {
        if (direction === 'up' && index > 0) {
            const updated = [...templateExercises];
            [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
            setTemplateExercises(updated);
        } else if (direction === 'down' && index < templateExercises.length - 1) {
            const updated = [...templateExercises];
            [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
            setTemplateExercises(updated);
        }
    };

    const handleSave = () => {
        if (!name.trim()) return; // Validation
        // Sanitize data (convert strings to numbers where needed)
        const sanitizedExercises = templateExercises.map(ex => ({
            ...ex,
            sets: ex.sets.map(s => ({
                ...s,
                weight: parseFloat(s.weight) || 0,
                reps: parseFloat(s.reps) || 0,
                rest: parseFloat(s.rest) || 0,
            }))
        }));

        onSave({
            id: initialTemplate ? initialTemplate.id : Date.now().toString(),
            name,
            workoutType,
            exercises: sanitizedExercises
        });
    };

    const filteredExercises = exercises
        .filter(e =>
            selectedGroup === 'ALL' || (e.category || 'GENERAL') === selectedGroup
        )
        .sort((a, b) => a.name.localeCompare(b.name));


    const handleToggleSuperset = (index) => {
        if (index >= templateExercises.length - 1) return;

        const updated = [...templateExercises];
        const current = updated[index];
        const next = updated[index + 1];

        if (current.supersetId && current.supersetId === next.supersetId) {
            // Unlink
            current.supersetId = null;
            next.supersetId = null;
        } else {
            // Link
            // Remove from any existing supersets first to enforce pairs (simple approach)
            if (current.supersetId) {
                // Find pair and unlink
                const pairIndex = updated.findIndex(e => e.supersetId === current.supersetId && e !== current);
                if (pairIndex !== -1) updated[pairIndex].supersetId = null;
            }
            if (next.supersetId) {
                const pairIndex = updated.findIndex(e => e.supersetId === next.supersetId && e !== next);
                if (pairIndex !== -1) updated[pairIndex].supersetId = null;
            }

            const newId = Date.now().toString() + '_superset';
            current.supersetId = newId;
            next.supersetId = newId;
        }
        setTemplateExercises(updated);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onCancel}>
                            <X color={COLORS.text} size={24} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{initialTemplate ? 'EDIT_PROTOCOL' : 'PROTOCOL_DESIGN'}</Text>
                        <TouchableOpacity onPress={handleSave}>
                            <Save color={COLORS.primary} size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.metaContainer}>
                        <Text style={styles.label}>PROTOCOL_NAME:</Text>
                        <TextInput
                            style={styles.nameInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Ex: PUSH_HEAVY_A"
                            placeholderTextColor={COLORS.textMuted}
                        />

                        <View style={{ height: SPACING.md }} />

                        <Text style={styles.label}>WORKOUT_TYPE:</Text>
                        <TextInput
                            style={styles.nameInput}
                            value={workoutType}
                            onChangeText={setWorkoutType}
                            placeholder="Ex: Hypertrophy"
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                    >
                        <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalVisible(true)}>
                            <Plus color={COLORS.text} size={20} />
                            <Text style={styles.addButtonText}>APPEND_EXERCISE</Text>
                        </TouchableOpacity>

                        {templateExercises.map((ex, index) => {
                            const isSupersetStart = ex.supersetId && templateExercises[index + 1]?.supersetId === ex.supersetId;
                            const isSupersetEnd = ex.supersetId && templateExercises[index - 1]?.supersetId === ex.supersetId;

                            return (
                                <View key={ex.templateId} style={[
                                    styles.exerciseCard,
                                    (isSupersetStart || isSupersetEnd) && styles.supersetCard,
                                    isSupersetStart && styles.supersetCardTop,
                                    isSupersetEnd && styles.supersetCardBottom
                                ]}>
                                    <View style={styles.cardHeader}>
                                        <View>
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
                                                {(isSupersetStart || isSupersetEnd) && (
                                                    <View style={styles.supersetBadge}>
                                                        <LinkIcon color={COLORS.background} size={10} />
                                                        <Text style={styles.supersetBadgeText}>SUPERSET</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.exerciseSubtitle}>
                                                {ex.category}
                                                {ex.exerciseType === 'bodyweight' ? ' • BODYWEIGHT' : ''}
                                            </Text>
                                        </View>
                                        <View style={styles.cardActions}>
                                            {index < templateExercises.length - 1 && (
                                                <TouchableOpacity
                                                    onPress={() => handleToggleSuperset(index)}
                                                    style={[styles.iconBtn, isSupersetStart && { backgroundColor: COLORS.primary }]}
                                                >
                                                    {isSupersetStart ? (
                                                        <Unlink color={COLORS.background} size={18} />
                                                    ) : (
                                                        <LinkIcon color={COLORS.textMuted} size={18} />
                                                    )}
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity onPress={() => handleMove(index, 'up')} style={styles.iconBtn}>
                                                <ArrowUp color={COLORS.textMuted} size={18} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleMove(index, 'down')} style={styles.iconBtn}>
                                                <ArrowDown color={COLORS.textMuted} size={18} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleRemoveExercise(index)} style={styles.iconBtn}>
                                                <Trash2 color={COLORS.error} size={18} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {ex.exerciseType === 'weighted' && ex.equipmentOptions && ex.equipmentOptions.length > 0 && (
                                        <View style={styles.equipmentSelector}>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                                {ex.equipmentOptions.map(eq => (
                                                    <TouchableOpacity
                                                        key={eq}
                                                        style={[
                                                            styles.eqChip,
                                                            ex.activeEquipment === eq && styles.eqChipSelected
                                                        ]}
                                                        onPress={() => handleUpdateEquipment(index, eq)}
                                                    >
                                                        <Text style={[
                                                            styles.eqChipText,
                                                            ex.activeEquipment === eq && styles.eqChipTextSelected
                                                        ]}>{eq}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}

                                    <View style={styles.setsHeader}>
                                        <Text style={[styles.colLabel, { flex: 0.5 }]}>SET</Text>
                                        <Text style={[styles.colLabel, { flex: 1 }]}>KG</Text>
                                        <Text style={[styles.colLabel, { flex: 1 }]}>REPS</Text>
                                        <Text style={[styles.colLabel, { flex: 1 }]}>REST(s)</Text>
                                        <View style={{ width: 24 }} />
                                    </View>

                                    {ex.sets.map((set, setIndex) => (
                                        <View key={setIndex} style={styles.setRow}>
                                            <Text style={[styles.setNumber, { flex: 0.5 }]}>{setIndex + 1}</Text>
                                            <TextInput
                                                style={[styles.setInput, { flex: 1 }]}
                                                value={set.weight.toString()}
                                                onChangeText={(v) => handleUpdateSet(index, setIndex, 'weight', v)}
                                                keyboardType="numeric"
                                                placeholder="-"
                                                placeholderTextColor={COLORS.textMuted}
                                            />
                                            <TextInput
                                                style={[styles.setInput, { flex: 1 }]}
                                                value={set.reps.toString()}
                                                onChangeText={(v) => handleUpdateSet(index, setIndex, 'reps', v)}
                                                keyboardType="numeric"
                                                placeholder="-"
                                                placeholderTextColor={COLORS.textMuted}
                                            />
                                            <TextInput
                                                style={[styles.setInput, { flex: 1 }]}
                                                value={set.rest.toString()}
                                                onChangeText={(v) => handleUpdateSet(index, setIndex, 'rest', v)}
                                                keyboardType="numeric"
                                                placeholder="90"
                                                placeholderTextColor={COLORS.textMuted}
                                            />
                                            <TouchableOpacity onPress={() => handleRemoveSet(index, setIndex)}>
                                                <X color={COLORS.textMuted} size={16} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}

                                    <TouchableOpacity style={styles.addSetBtn} onPress={() => handleAddSet(index)}>
                                        <Plus color={COLORS.primary} size={14} />
                                        <Text style={styles.addSetText}>ADD_SET</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
                    </ScrollView>

                    <Modal visible={isAddModalVisible} animationType="slide" transparent>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>SELECT_COMPONENT</Text>
                                    <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                        <X color={COLORS.text} size={24} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.filterContainer}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                                        {muscleGroups.map(group => (
                                            <TouchableOpacity
                                                key={group}
                                                style={[
                                                    styles.filterChip,
                                                    selectedGroup === group && styles.filterChipSelected
                                                ]}
                                                onPress={() => setSelectedGroup(group)}
                                            >
                                                <Text style={[
                                                    styles.filterText,
                                                    selectedGroup === group && styles.filterTextSelected
                                                ]}>
                                                    {group}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <ScrollView style={styles.exerciseList}>
                                    {filteredExercises.map(ex => (
                                        <TouchableOpacity
                                            key={ex.id}
                                            style={styles.selectExerciseItem}
                                            onPress={() => handleAddExercise(ex)}
                                        >
                                            <Text style={styles.selectExerciseName}>{ex.name.toUpperCase()}</Text>
                                            <Text style={styles.selectExerciseCategory}>{ex.category}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
    metaContainer: {
        padding: SPACING.md,
        borderBottomWidth: BORDERS.thin,
        borderBottomColor: COLORS.border,
    },
    label: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        marginBottom: 4,
    },
    nameInput: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.xl,
    },
    content: {
        padding: SPACING.md,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.text,
        borderStyle: 'dashed',
        marginBottom: SPACING.lg,
        gap: SPACING.sm,
    },
    addButtonText: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
    },
    exerciseCard: {
        backgroundColor: COLORS.surface,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    exerciseName: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
    },
    exerciseSubtitle: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
    },
    cardActions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    iconBtn: {
        padding: 4,
    },
    setsHeader: {
        flexDirection: 'row',
        marginBottom: SPACING.xs,
        paddingHorizontal: SPACING.xs,
    },
    colLabel: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        textAlign: 'center',
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    setNumber: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        textAlign: 'center',
    },
    setInput: {
        backgroundColor: COLORS.background,
        color: COLORS.text,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        padding: 4,
        textAlign: 'center',
        fontFamily: TYPOGRAPHY.familyMono,
    },
    addSetBtn: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    addSetText: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        backgroundColor: COLORS.surface,
        borderTopWidth: BORDERS.thick,
        borderTopColor: COLORS.primary,
        padding: SPACING.md,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    modalTitle: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
    },
    filterContainer: {
        marginBottom: SPACING.md,
    },
    filterContent: {
        gap: SPACING.sm,
    },
    filterChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        borderRadius: 12,
    },
    filterChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
    },
    filterTextSelected: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
    },
    exerciseList: {
        flex: 1,
    },
    selectExerciseItem: {
        padding: SPACING.md,
        borderBottomWidth: BORDERS.thin,
        borderBottomColor: COLORS.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectExerciseName: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMono,
    },
    selectExerciseCategory: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
    },
    supersetCard: {
        borderColor: COLORS.primary,
        borderLeftWidth: 4,
    },
    supersetCardTop: {
        marginBottom: 0,
        borderBottomWidth: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    supersetCardBottom: {
        marginTop: 0,
        borderTopWidth: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    supersetBadge: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    supersetBadgeText: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: 9,
    },
    equipmentSelector: {
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.xs,
    },
    eqChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        borderRadius: 4,
    },
    eqChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    eqChipText: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 9,
    },
    eqChipTextSelected: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
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
});

export default TemplateEditor;
