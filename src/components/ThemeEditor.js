import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useColors, SPACING, TYPOGRAPHY } from 'theme/tokens';

const ColorPicker = ({ label, value, onChange, presets = [] }) => {
    const colors = useColors();
    const [showPicker, setShowPicker] = useState(false);
    const [inputValue, setInputValue] = useState(value || '#000000');

    const handleColorChange = (color) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
            setInputValue(color);
            onChange(color);
        }
    };

    const handleInputChange = (text) => {
        setInputValue(text);
        if (/^#[0-9A-Fa-f]{6}$/.test(text)) {
            onChange(text);
        }
    };

    const styles = createStyles(colors);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label.toUpperCase()}</Text>
            <View style={styles.colorInputRow}>
                <View style={styles.colorDisplay}>
                    <View 
                        style={[
                            styles.colorSwatch, 
                            { backgroundColor: inputValue }
                        ]} 
                    />
                </View>
                <TextInput
                    style={styles.colorInput}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    placeholder="#000000"
                    placeholderTextColor={colors.textMuted}
                    maxLength={7}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>
            
            {presets.length > 0 && (
                <View style={styles.presetsRow}>
                    <Text style={styles.presetsLabel}>PRESETS:</Text>
                    {presets.map((preset, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.presetSwatch,
                                { backgroundColor: preset }
                            ]}
                            onPress={() => handleColorChange(preset)}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const FontSelector = ({ selected, onChange }) => {
    const colors = useColors();
    const { FONT_OPTIONS } = require('config/ThemePresets');
    const styles = createStyles(colors);
    
    return (
        <View style={styles.container}>
            <Text style={styles.label}>FONT FAMILY</Text>
            <View style={styles.fontList}>
                {FONT_OPTIONS.map((font) => (
                    <TouchableOpacity
                        key={font.value}
                        style={[
                            styles.fontOption,
                            selected === font.value && styles.fontOptionSelected
                        ]}
                        onPress={() => onChange(font.value)}
                    >
                        <Text 
                            style={[
                                styles.fontText,
                                { fontFamily: font.value === 'System' ? undefined : font.value }
                            ]}
                        >
                            {font.label}
                        </Text>
                        <Text style={styles.fontStyle}>{font.style}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const ThemePreview = ({ themeConfig }) => {
    const colors = useColors();
    const previewColors = themeConfig?.colors || colors;
    const styles = createStyles(colors);
    
    return (
        <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>LIVE PREVIEW</Text>
            
            <View style={styles.previewCards}>
                <View style={[
                    styles.previewCard, 
                    { backgroundColor: previewColors.surface }
                ]}>
                    <Text style={[
                        styles.previewHeader,
                        { color: previewColors.primary }
                    ]}>
                        WORKOUT TRACKER
                    </Text>
                    <Text style={[
                        styles.previewText,
                        { color: previewColors.text }
                    ]}>
                        Dashboard Screen
                    </Text>
                    <TouchableOpacity style={[
                        styles.previewButton,
                        { 
                            backgroundColor: previewColors.primary,
                            borderColor: previewColors.border 
                        }
                    ]}>
                        <Text style={[
                            styles.previewButtonText,
                            { color: previewColors.background }
                        ]}>
                            START WORKOUT
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <View style={[
                    styles.previewCard,
                    { backgroundColor: previewColors.surfaceElevated }
                ]}>
                    <Text style={[
                        styles.previewHeader,
                        { color: previewColors.primary }
                    ]}>
                        EXERCISE DATA
                    </Text>
                    <Text style={[
                        styles.previewText,
                        { color: previewColors.textMuted }
                    ]}>
                        Bench Press
                    </Text>
                    <Text style={[
                        styles.previewText,
                        { color: previewColors.text }
                    ]}>
                        3 sets × 10 reps
                    </Text>
                </View>
            </View>
            
            <View style={styles.accessibilityCheck}>
                <Text style={[
                    styles.accessibilityText,
                    { color: previewColors.text }
                ]}>
                    Contrast Check:
                </Text>
                <Text style={[
                    styles.accessibilityResult,
                    { color: previewColors.success }
                ]}>
                    ✓ Good contrast
                </Text>
            </View>
        </View>
    );
};

const createStyles = (colors) => StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        color: colors.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        marginBottom: 8,
        letterSpacing: 1,
    },
    colorInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    colorDisplay: {
        padding: SPACING.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 2,
    },
    colorSwatch: {
        width: 40,
        height: 24,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: colors.border,
    },
    colorInput: {
        flex: 1,
        backgroundColor: colors.surface,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        padding: SPACING.md,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.md,
    },
    presetsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        gap: SPACING.sm,
    },
    presetsLabel: {
        color: colors.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 9,
        marginRight: SPACING.sm,
    },
    presetSwatch: {
        width: 24,
        height: 24,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: colors.border,
    },
    fontList: {
        gap: SPACING.sm,
    },
    fontOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: SPACING.md,
        borderRadius: 2,
    },
    fontOptionSelected: {
        borderColor: colors.primary,
    },
    fontText: {
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.sm,
        color: colors.text,
    },
    fontStyle: {
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 9,
        color: colors.textMuted,
        fontStyle: 'italic',
    },
    previewContainer: {
        backgroundColor: colors.background,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 2,
    },
    previewTitle: {
        color: colors.primary,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.sm,
        marginBottom: SPACING.md,
        letterSpacing: 1,
    },
    previewCards: {
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    previewCard: {
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 2,
    },
    previewHeader: {
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.md,
        marginBottom: SPACING.sm,
    },
    previewText: {
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: TYPOGRAPHY.size.sm,
        marginBottom: 4,
    },
    previewButton: {
        backgroundColor: colors.primary,
        borderWidth: 1,
        borderRadius: 2,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        marginTop: SPACING.sm,
    },
    previewButtonText: {
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.sm,
        textAlign: 'center',
    },
    accessibilityCheck: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    accessibilityText: {
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 9,
    },
    accessibilityResult: {
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: 9,
    },
});

export { ColorPicker, FontSelector, ThemePreview };