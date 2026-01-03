import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme/tokens';
import { Plus, X, List, ChevronRight, Trash2, Play, Edit2 } from 'lucide-react-native';

const TemplateManager = ({ templates, exercises, onSaveTemplate, onDeleteTemplate, onSelectTemplate, onEditTemplate, onCreateTemplate, onClose }) => {
    // No local state needed for creation anymore
    // const [isModalVisible, setIsModalVisible] = useState(false);
    // ... removed legacy modal state

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose}>
                    <X color={COLORS.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>WORKOUT_TEMPLATES</Text>
                <TouchableOpacity onPress={onCreateTemplate}>
                    <Plus color={COLORS.primary} size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {templates.map(t => (
                    <View key={t.id} style={styles.templateCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.templateName}>{t.name.toUpperCase()}</Text>
                            <Text style={styles.templateInfo}>{t.exercises.length} EXERCISES</Text>
                        </View>
                        <View style={styles.cardActions}>
                            <TouchableOpacity onPress={() => onSelectTemplate(t)} style={styles.actionButton}>
                                <Play color={COLORS.primary} size={20} fill={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onEditTemplate(t)} style={styles.actionButton}>
                                <Edit2 color={COLORS.text} size={20} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onDeleteTemplate(t.id)} style={styles.actionButton}>
                                <Trash2 color={COLORS.error} size={20} />
                            </TouchableOpacity>
                        </View>
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
    templateCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
    },
    templateName: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
    },
    templateInfo: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        marginTop: 4,
    },
    cardActions: {
        flexDirection: 'row',
        gap: SPACING.sm,
        alignItems: 'center',
    },
    actionButton: {
        padding: 4,
    },
});

export default TemplateManager;
