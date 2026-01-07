import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme/tokens';
import { X, Save, Hash } from 'lucide-react-native';

const PropertyConfig = ({ settings, onSave, onClose }) => {
    const [config, setConfig] = useState(settings.yamlMapping);
    const [tags, setTags] = useState(settings.tags.join(', '));
    const [userBodyweight, setUserBodyweight] = useState(settings.userBodyweight?.toString() || '');

    const handleSave = () => {
        onSave({
            yamlMapping: config,
            tags: tags.split(',').map(t => t.trim()).filter(t => t.startsWith('#')),
            userBodyweight: parseFloat(userBodyweight) || null,
        });
        onClose();
    };

    const updateKey = (key, val) => {
        setConfig({ ...config, [key]: val });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose}>
                            <X color={COLORS.text} size={24} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>METADATA_PROTO_MAPPING</Text>
                        <TouchableOpacity onPress={handleSave}>
                            <Save color={COLORS.primary} size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardDismissMode="on-drag"
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.sectionTitle}>YAML_PROPERTY_KEYS</Text>

                        {Object.entries(config).map(([key, value]) => (
                            <View key={key} style={styles.inputGroup}>
                                <Text style={styles.label}>{key.toUpperCase()}:</Text>
                                <TextInput
                                    style={styles.input}
                                    value={value}
                                    onChangeText={(v) => updateKey(key, v)}
                                />
                            </View>
                        ))}

                        <Text style={styles.sectionTitle}>GLOBAL_TAGS</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>COMMA_SEPARATED (#tag1, #tag2):</Text>
                            <TextInput
                                style={styles.input}
                                value={tags}
                                onChangeText={setTags}
                                multiline
                            />
                        </View>

                        <Text style={styles.sectionTitle}>BIOMETRICS</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>USER_BODYWEIGHT (KG):</Text>
                            <TextInput
                                style={styles.input}
                                value={userBodyweight}
                                onChangeText={setUserBodyweight}
                                keyboardType="numeric"
                                placeholder="Ex: 75"
                                placeholderTextColor={COLORS.textMuted}
                            />
                            <Text style={styles.hintText}>Used for bodyweight exercise volume calculation.</Text>
                        </View>
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
    sectionTitle: {
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.familyMonoBold,
        fontSize: TYPOGRAPHY.size.sm,
        marginBottom: SPACING.md,
        marginTop: SPACING.lg,
        letterSpacing: 1,
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 10,
        marginBottom: 4,
    },
    input: {
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        borderWidth: BORDERS.thin,
        borderColor: COLORS.border,
        padding: SPACING.md,
        fontFamily: TYPOGRAPHY.familyMono,
    },
    hintText: {
        color: COLORS.textMuted,
        fontFamily: TYPOGRAPHY.familyMono,
        fontSize: 9,
        marginTop: 4,
        fontStyle: 'italic',
    },
});

export default PropertyConfig;
