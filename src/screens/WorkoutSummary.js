import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme/tokens';
import { Check, Star, Activity, Clock, Dumbbell, Calendar, Save } from 'lucide-react-native';
import { format } from 'date-fns';

const WorkoutSummary = ({ workout, onConfirm }) => {
    const [rpe, setRpe] = useState(5);
    const [rating, setRating] = useState(5);
    const [comments, setComments] = useState('');

    const handleSave = () => {
        onConfirm({
            rpe,
            rating,
            comments
        });
    };

    const renderRatingSelector = (value, setValue, max = 10, icon = false) => {
        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ratingContainer}>
                {[...Array(max)].map((_, i) => {
                    const itemValue = i + 1;
                    const isActive = itemValue <= value;
                    return (
                        <TouchableOpacity
                            key={i}
                            style={[
                                styles.ratingButton,
                                isActive && styles.ratingButtonActive,
                                icon && styles.ratingButtonIcon // Style for star rating
                            ]}
                            onPress={() => setValue(itemValue)}
                        >
                            {icon ? (
                                <Star
                                    size={20}
                                    color={isActive ? COLORS.primary : COLORS.textMuted}
                                    fill={isActive ? COLORS.primary : 'transparent'}
                                />
                            ) : (
                                <Text style={[styles.ratingText, isActive && styles.ratingTextActive]}>
                                    {itemValue}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.content}>
                        <View style={styles.header}>
                            <View style={styles.iconContainer}>
                                <Check color={COLORS.success} size={40} />
                            </View>
                            <Text style={styles.title}>WORKOUT_COMPLETE</Text>
                            <Text style={styles.subtitle}>{format(new Date(), 'EEEE, MMMM do')}</Text>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Clock color={COLORS.primary} size={20} />
                                <Text style={styles.statValue}>{workout.duration}m</Text>
                                <Text style={styles.statLabel}>DURATION</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Activity color={COLORS.primary} size={20} />
                                <Text style={styles.statValue}>{workout.exercises?.length || 0}</Text>
                                <Text style={styles.statLabel}>EXERCISES</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Dumbbell color={COLORS.primary} size={20} />
                                <Text style={styles.statValue}>
                                    {workout.exercises?.reduce((acc, ex) => acc + (ex.sets?.filter(s => s.completed)?.length || 0), 0)}
                                </Text>
                                <Text style={styles.statLabel}>SETS</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>RPE (PERCEIVED EXERTION)</Text>
                            <Text style={styles.sectionSubtitle}>1 = Easy, 10 = Maximum Effort</Text>
                            {renderRatingSelector(rpe, setRpe, 10)}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>WORKOUT_RATING</Text>
                            <Text style={styles.sectionSubtitle}>How did it feel?</Text>
                            {renderRatingSelector(rating, setRating, 10, true)}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>NOTES / COMMENTS</Text>
                            <TextInput
                                style={styles.input}
                                multiline
                                numberOfLines={4}
                                placeholder="How was the session? Any pain or PRs?"
                                placeholderTextColor={COLORS.textMuted}
                                value={comments}
                                onChangeText={setComments}
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Save color={COLORS.background} size={20} />
                            <Text style={styles.saveButtonText}>SAVE_AND_FINISH</Text>
                        </TouchableOpacity>
                    </View>
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
    content: {
        padding: SPACING.md,
        paddingTop: 60,
        paddingBottom: 100,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(68, 255, 68, 0.1)', // Success with opacity
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        borderWidth: 2,
        borderColor: COLORS.success,
    },
    title: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.xl,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.md,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.xl,
        marginVertical: 4,
    },
    statLabel: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
        marginBottom: 4,
    },
    sectionSubtitle: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.xs,
        marginBottom: SPACING.md,
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    ratingButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    ratingButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    ratingButtonIcon: {
        // Special styling for icon buttons if needed
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        // Logic for active state handling is done in render
    },
    ratingText: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
    },
    ratingTextActive: {
        color: COLORS.background,
    },
    input: {
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.md,
        padding: SPACING.md,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        height: 120,
        textAlignVertical: 'top',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.md,
        backgroundColor: COLORS.background,
        borderTopWidth: BORDERS.thin,
        borderTopColor: COLORS.border,
    },
    saveButton: {
        backgroundColor: COLORS.success,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        gap: SPACING.sm,
    },
    saveButtonText: {
        color: COLORS.background,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
    },
});

export default WorkoutSummary;
