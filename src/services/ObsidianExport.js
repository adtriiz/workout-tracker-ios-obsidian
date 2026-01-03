import { Share, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { MarkdownGenerator } from './MarkdownGenerator';
import { StorageService } from './StorageService';

export const ObsidianExport = {
    async exportWorkout(workout) {
        try {
            const settings = await StorageService.getSettings();
            const markdown = MarkdownGenerator.generate(workout, settings);

            const fileName = `Workout_${new Date(workout.startTime).toISOString().split('T')[0]}.md`;
            const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(fileUri, markdown, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            if (Platform.OS === 'ios') {
                const result = await Share.share({
                    url: fileUri,
                    title: fileName,
                });

                if (result.action === Share.sharedAction) {
                    Alert.alert('SUCCESS', 'WORKOUT_DATA_EXPORTED');
                }
            } else {
                // Simple fallback for web/other
                console.log('MARKDOWN_PAYLOAD:', markdown);
                Alert.alert('EXPORT', 'DATA_COPIED_TO_CONSOLE');
            }
        } catch (error) {
            console.error('EXPORT_ERROR:', error);
            Alert.alert('ERROR', 'FAILED_TO_GENERATE_EXPORT');
        }
    }
};
