import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme/tokens';
import { Plus, X, Search, Dumbbell, Trash2 } from 'lucide-react-native';

const ExerciseManager = ({ exercises, muscleGroups, onAddExercise, onDeleteExercise, onClose }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [notes, setNotes] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState('ALL');

    const handleSave = () => {
        if (name.trim()) {
            onAddExercise(name, category || 'GENERAL', notes);
            setName('');
            setCategory('');
            setNotes('');
            setIsModalVisible(false);
        }
    };

    const filteredExercises = exercises.filter(e =>
        selectedGroup === 'ALL' || (e.category || 'GENERAL') === selectedGroup
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose}>
                    <X color={COLORS.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>EXERCISE_DATABASE</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                    <Plus color={COLORS.primary} size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            selectedGroup === 'ALL' && styles.filterChipSelected
                        ]}
                        onPress={() => setSelectedGroup('ALL')}
                    >
                        <Text style={[
                            styles.filterText,
                            selectedGroup === 'ALL' && styles.filterTextSelected
                        ]}>
                            ALL
                        </Text>
                    </TouchableOpacity>
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

            <View style={{ flex: 1 }}>
                <View style={styles.searchBar}>
                    <Search color={COLORS.textMuted} size={18} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="SEARCH_BUFFER..."
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                >
                    {filteredExercises.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Dumbbell color={COLORS.border} size={48} />
                            <Text style={styles.emptyText}>DATABASE_EMPTY</Text>
                        </View>
                    ) : (
                        filteredExercises.map((ex) => (
                            <View key={ex.id} style={styles.exerciseItem}>
                                <View style={{ flex: 1, paddingRight: SPACING.md }}>
                                    <Text style={styles.exerciseName}>{ex.name.toUpperCase()}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={styles.exerciseCategory}>{ex.category}</Text>
                                        {ex.notes && <Text style={styles.exerciseNotes}>• {ex.notes}</Text>}
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => onDeleteExercise(ex.id)}>
                                    <Trash2 color={COLORS.error} size={20} />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>

            <Modal visible={isModalVisible} animationType="fade" transparent>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ width: '100%' }}
                        >
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>NEW_ENTRY_REGISTRATION</Text>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>IDENTIFIER:</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={name}
                                            onChangeText={setName}
                                            placeholder="Ex: Bench Press"
                                            placeholderTextColor={COLORS.textMuted}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>MUSCLE_GROUP:</Text>
                                        <View>
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
                                                style={{ marginBottom: 8, flexGrow: 0 }}
                                            >
                                                {muscleGroups.filter(g => g !== 'ALL').map(group => (
                                                    <TouchableOpacity
                                                        key={group}
                                                        style={[styles.filterChip, category === group && styles.filterChipSelected]}
                                                        onPress={() => {
                                                            setCategory(group);
                                                            Keyboard.dismiss();
                                                        }}
                                                    >
                                                        <Text style={[styles.filterText, category === group && styles.filterTextSelected]}>{group}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                                <TouchableOpacity
                                                    style={[styles.filterChip, !muscleGroups.includes(category) && category !== '' && styles.filterChipSelected]}
                                                    onPress={() => setCategory('')}
                                                >
                                                    <Text style={[styles.filterText, !muscleGroups.includes(category) && category !== '' && styles.filterTextSelected]}>+ CUSTOM</Text>
                                                </TouchableOpacity>
                                            </ScrollView>

                                            <TextInput
                                                style={styles.input}
                                                value={category}
                                                onChangeText={setCategory}
                                                placeholder="Select or type new..."
                                                placeholderTextColor={COLORS.textMuted}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>NOTES (OPTIONAL):</Text>
                                        <TextInput
                                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                            value={notes}
                                            onChangeText={setNotes}
                                            placeholder="Technique cues, machine settings..."
                                            placeholderTextColor={COLORS.textMuted}
                                            multiline
                                        />
                                    </View>

                                    <View style={styles.modalActions}>
                                        <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                                            <Text style={styles.cancelText}>ABORT</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                            <Text style={styles.saveText}>COMMIT</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        margin: SPACING.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        gap: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.sm,
    },
    content: {
        paddingHorizontal: SPACING.md,
    },
    exerciseItem: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exerciseName: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
    },
    exerciseCategory: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.xs,
        marginTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: SPACING.xxl,
        opacity: 0.5,
    },
    emptyText: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
        marginTop: SPACING.md,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderWidth: BORDERS.thick,
        borderColor: COLORS.primary,
        padding: SPACING.xl,
    },
    modalTitle: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    label: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        marginBottom: 4,
    },
    input: {
        backgroundColor: COLORS.background,
        color: COLORS.text,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        padding: SPACING.md,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.md,
    },
    modalActions: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.md,
    },
    cancelButton: {
        flex: 1,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: BORDERS.thin,
        borderColor: COLORS.error,
    },
    cancelText: {
        color: COLORS.error,
        fontFamily: TYPOGRAPHY.familyMonoBold,
    },
    saveButton: {
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        alignItems: 'center',
    },
    saveText: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
    },
    filterContainer: {
        marginBottom: SPACING.xs,
    },
    filterContent: {
        paddingHorizontal: SPACING.md,
        gap: SPACING.sm,
    },
    filterChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        borderRadius: 16,
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
    exerciseNotes: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        fontStyle: 'italic',
    },
});

export default ExerciseManager;
