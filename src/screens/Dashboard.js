import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme/tokens';
import { Activity, Plus, Settings as SettingsIcon, ClipboardList, Dumbbell, Calendar } from 'lucide-react-native';
import { useLogs } from '../hooks/useWorkout';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

const FrequencyGraph = ({ logs }) => {
    // Generate last 10 weeks of activity
    const weeks = 10;
    const days = weeks * 7;
    const today = new Date();
    const frequencyData = Array.from({ length: days }).map((_, i) => {
        const date = subDays(today, days - 1 - i);
        const count = logs.filter(log => isSameDay(parseISO(log.endTime), date)).length;
        return { date, count };
    });

    return (
        <View style={styles.graphContainer}>
            <View style={styles.graphHeader}>
                <Calendar color={COLORS.primary} size={16} />
                <Text style={styles.graphTitle}>CONSISTENCY_MATRIX</Text>
            </View>
            <View style={styles.heatmapGrid}>
                {frequencyData.map((day, i) => (
                    <View
                        key={i}
                        style={[
                            styles.heatmapCell,
                            {
                                backgroundColor: day.count > 0 ? COLORS.primary : COLORS.surfaceElevated,
                                opacity: day.count > 0 ? Math.min(0.4 + (day.count * 0.2), 1) : 1
                            }
                        ]}
                    />
                ))}
            </View>
            <Text style={styles.graphFooter}>{logs.length} TOTAL_SESSIONS_LOGGED</Text>
        </View>
    );
};

const Dashboard = ({ onStart, onOpenExercises, onOpenTemplates, onOpenSettings }) => {
    const { logs } = useLogs();
    const recentLogs = [...logs].sort((a, b) => new Date(b.endTime) - new Date(a.endTime)).slice(0, 3);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>LOG_CORE</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={onOpenExercises}>
                        <Dumbbell color={COLORS.text} size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={onOpenSettings}>
                        <SettingsIcon color={COLORS.text} size={24} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <FrequencyGraph logs={logs} />

                <View style={styles.sectionHeader}>
                    <Activity color={COLORS.primary} size={18} />
                    <Text style={styles.sectionTitle}>RECENT_ACTIVITY</Text>
                </View>

                {recentLogs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>NO_LOGS_FOUND_IN_BUFFER</Text>
                        <Text style={styles.emptySubtext}>INITIATE_WORKOUT_TO_START_DATA_FLOW</Text>
                    </View>
                ) : (
                    recentLogs.map(log => (
                        <View key={log.id} style={styles.logCard}>
                            <View>
                                <Text style={styles.logDate}>{format(parseISO(log.endTime), 'yyyy-MM-dd HH:mm')}</Text>
                                <Text style={styles.logDuration}>{log.duration} MIN • {log.exercises.length} EXERCISES</Text>
                            </View>
                            <View style={styles.logBadge}>
                                <Text style={styles.logBadgeText}>LOGGED</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.primaryButton} onPress={onOpenTemplates}>
                    <ClipboardList color={COLORS.background} size={24} />
                    <Text style={styles.primaryButtonText}>WORKOUT</Text>
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
        letterSpacing: 1.5,
    },
    headerActions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    iconButton: {
        padding: SPACING.xs,
        borderWidth: BORDERS.thin,
        borderColor: 'transparent',
    },
    content: {
        padding: SPACING.md,
    },
    graphContainer: {
        backgroundColor: COLORS.surface,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        padding: SPACING.md,
        marginBottom: SPACING.xl,
    },
    graphHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    graphTitle: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.xs,
    },
    heatmapGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        justifyContent: 'flex-start',
    },
    heatmapCell: {
        width: 14,
        height: 14,
        borderRadius: 2,
    },
    graphFooter: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        marginTop: SPACING.md,
        textAlign: 'right',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
    },
    emptyState: {
        backgroundColor: COLORS.surface,
        padding: SPACING.xxl,
        alignItems: 'center',
        borderWidth: BORDERS.thin,
        borderStyle: 'dashed',
        borderColor: COLORS.border,
        marginTop: SPACING.xs,
    },
    emptyText: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.sm,
        textAlign: 'center',
    },
    emptySubtext: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.xs,
        textAlign: 'center',
        marginTop: SPACING.sm,
    },
    logCard: {
        backgroundColor: COLORS.surface,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logDate: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.sm,
    },
    logDuration: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        marginTop: 4,
    },
    logBadge: {
        backgroundColor: COLORS.surfaceElevated,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.primary,
    },
    logBadgeText: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
    },
    bottomActions: {
        padding: SPACING.md,
        flexDirection: 'row',
        gap: SPACING.md,
        borderTopWidth: BORDERS.medium,
        borderTopColor: COLORS.border,
    },
    primaryButton: {
        flex: 2,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        gap: SPACING.sm,
    },
    primaryButtonText: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: COLORS.surfaceElevated,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        gap: SPACING.sm,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
    },
    secondaryButtonText: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.sm,
    },
});

export default Dashboard;
