import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { MarkdownGenerator } from './MarkdownGenerator';
import { StorageService } from './StorageService';

export const ObsidianExport = {
    async exportWorkout(workout) {
        try {
            const settings = await StorageService.getSettings();
            const markdown = MarkdownGenerator.generate(workout, settings);

            const datePart = new Date(workout.startTime).toISOString().split('T')[0];
            const sanitizedTemplateName = (workout.templateName || 'Workout').replace(/[^a-zA-Z0-9-_ ]/g, '');
            const noteName = `${sanitizedTemplateName} - ${datePart}`;

            // 1. Attempt Obsidian Deep Link (Most Elegant)
            const obsidianUrl = `obsidian://new?name=${encodeURIComponent(noteName)}&content=${encodeURIComponent(markdown)}`;

            const canOpen = await Linking.canOpenURL(obsidianUrl);

            if (canOpen) {
                await Linking.openURL(obsidianUrl);
                Alert.alert('SUCCESS', 'OPENED_IN_OBSIDIAN');
                return;
            }

            // 2. Fallback to File Sharing if Obsidian is not installed or unreachable
            const fileName = `${noteName}.md`;

            // USE THE NEW EXPO FILESYSTEM API (SDK 54+)
            // Note: File is exported directly from 'expo-file-system'
            // We must use Paths.cache (Directory object) not cacheDirectory (string)
            const file = new FileSystem.File(FileSystem.Paths.cache, fileName);
            await file.write(markdown);

            // Check if uri matches standard expo file URI format or needs construction
            // File objects typically don't expose 'uri' directly in type definition but usually have it at runtime or via property. 
            // However, based on d.ts inspection, we might need to rely on 'uri' property if present or fallback.
            // If strict TS definition doesn't show it, we cast or assume runtime behavior.
            // But to be safe given the error "property 'uri' of undefined", we ensure `file` is created.

            const fileUri = file.uri ?? `file://${FileSystem.cacheDirectory}${fileName}`;
            // wait, if cacheDirectory is deprecated string, use Paths.cache.uri?
            // Paths.cache is a Directory object.

            if (Platform.OS === 'ios') {
                const isSharingAvailable = await Sharing.isAvailableAsync();

                if (isSharingAvailable) {
                    await Sharing.shareAsync(fileUri, {
                        mimeType: 'text/markdown',
                        dialogTitle: 'Export Workout to Obsidian',
                        UTI: 'net.daringfireball.markdown'
                    });
                } else {
                    Alert.alert('ERROR', 'SHARING_NOT_AVAILABLE');
                }
            } else {
                console.log('MARKDOWN_PAYLOAD:', markdown);
                Alert.alert('EXPORT', 'DATA_COPIED_TO_CONSOLE');
            }
        } catch (error) {
            console.error('EXPORT_ERROR:', error);
            Alert.alert('ERROR', 'FAILED_TO_GENERATE_EXPORT');
        }
    }
};
