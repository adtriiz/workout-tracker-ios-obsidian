import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDERS } from '../theme/tokens';
import { X, Save, Hash } from 'lucide-react-native';

const PropertyConfig = ({ settings, onSave, onClose }) => {
    const [config, setConfig] = useState(settings.yamlMapping);
    const [tags, setTags] = useState(settings.tags.join(', '));

    const handleSave = () => {
        onSave({
            yamlMapping: config,
            tags: tags.split(',').map(t => t.trim()).filter(t => t.startsWith('#')),
        });
        onClose();
    };

    const updateKey = (key, val) => {
        setConfig({ ...config, [key]: val });
    };

    return (
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

            <ScrollView contentContainerStyle={styles.content}>
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
});

export default PropertyConfig;
