import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme/tokens';
import { ChevronLeft, Trash2, Calendar, Clock, Activity } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';

const ActivityLog = ({ logs, onDeleteLog, onClose }) => {
    const sortedLogs = [...logs].sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    const handleDelete = (log) => {
        Alert.alert(
            "DELETE_LOG",
            "Are you sure you want to remove this workout from history?",
            [
                { text: "CANCEL", style: "cancel" },
                {
                    text: "DELETE",
                    onPress: () => onDeleteLog(log.id),
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onClose}>
                    <ChevronLeft color={COLORS.text} size={24} />
                    <Text style={styles.headerTitle}>ACTIVITY_LOG</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {sortedLogs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Activity color={COLORS.textMuted} size={48} />
                        <Text style={styles.emptyText}>NO_LOGS_FOUND_IN_BUFFER</Text>
                    </View>
                ) : (
                    sortedLogs.map((log) => (
                        <View key={log.id} style={styles.logCard}>
                            <View style={styles.logHeader}>
                                <View style={styles.logMainInfo}>
                                    <Text style={styles.logName}>{log.name || 'MANUAL_SESSION'}</Text>
                                    <View style={styles.logMeta}>
                                        <View style={styles.metaItem}>
                                            <Calendar color={COLORS.primary} size={12} />
                                            <Text style={styles.metaText}>{format(parseISO(log.endTime), 'yyyy-MM-dd HH:mm')}</Text>
                                        </View>
                                        <View style={styles.metaItem}>
                                            <Clock color={COLORS.primary} size={12} />
                                            <Text style={styles.metaText}>{log.duration} MIN</Text>
                                        </View>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete(log)}
                                >
                                    <Trash2 color={COLORS.error || '#ff4444'} size={18} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.exerciseSummary}>
                                {log.exercises.map((ex, idx) => (
                                    <View key={ex.instanceId || idx} style={styles.exerciseItem}>
                                        <Text style={styles.exerciseName}>{ex.name}</Text>
                                        <Text style={styles.setCount}>
                                            {ex.sets.filter(s => s.completed).length} SETS
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.logFooter}>
                                <Text style={styles.logFooterText}>
                                    TOTAL_EXERCISES: {log.exercises.length}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
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
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        borderBottomWidth: BORDERS.medium,
        borderBottomColor: COLORS.border,
        paddingBottom: SPACING.sm,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    headerTitle: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.lg,
        letterSpacing: 1.5,
    },
    content: {
        padding: SPACING.md,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xxl,
        marginTop: SPACING.xl,
    },
    emptyText: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
        marginTop: SPACING.md,
    },
    logCard: {
        backgroundColor: COLORS.surface,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: BORDERS.thin,
        borderBottomColor: COLORS.surfaceElevated,
        paddingBottom: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    logMainInfo: {
        flex: 1,
    },
    logName: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
        marginBottom: 4,
    },
    logMeta: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
    },
    deleteButton: {
        padding: SPACING.xs,
    },
    exerciseSummary: {
        gap: 4,
        marginBottom: SPACING.md,
    },
    exerciseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exerciseName: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.xs,
    },
    setCount: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: 10,
    },
    logFooter: {
        borderTopWidth: 1,
        borderTopColor: COLORS.surfaceElevated,
        paddingTop: SPACING.sm,
    },
    logFooterText: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        textAlign: 'right',
    },
});

export default ActivityLog;
