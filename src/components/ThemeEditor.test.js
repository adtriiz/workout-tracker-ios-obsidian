import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ColorPicker, FontSelector, ThemePreview } from './ThemeEditor';

// Mock theme modules for testing
jest.mock('../../theme/tokens', () => ({
    SPACING: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
    TYPOGRAPHY: { familyMono: 'monospace', familyMonoBold: 'monospace', size: { sm: 12, md: 14 } },
    useColors: () => ({
        background: '#000000',
        surface: '#121212',
        primary: '#FFB100',
        text: '#FFFFFF',
        textMuted: '#A0A0A0',
        border: '#333333',
        success: '#44FF44',
    }),
}));

jest.mock('../../config/ThemePresets', () => ({
    FONT_OPTIONS: [
        { value: 'JetBrainsMono_400Regular', label: 'JetBrains Mono', style: 'monospace' },
        { value: 'System', label: 'System Default', style: 'system' }
    ],
    THEME_PRESETS: {
        'Hazard Yellow': {
            name: 'Hazard Yellow',
            colors: { primary: '#FFB100' }
        }
    }
}));

describe('ThemeEditor Components', () => {
    describe('ColorPicker', () => {
        it('should render with default props', () => {
            const { getByPlaceholderText, getByDisplayValue } = render(
                <ColorPicker 
                    label="Test Color" 
                    value="#FF0000"
                    onChange={jest.fn()}
                />
            );

            expect(getByText('TEST COLOR')).toBeTruthy();
            expect(getByDisplayValue('#FF0000')).toBeTruthy();
        });

        it('should call onChange when input changes', () => {
            const mockOnChange = jest.fn();
            const { getByDisplayValue } = render(
                <ColorPicker 
                    label="Test Color" 
                    value="#FF0000"
                    onChange={mockOnChange}
                />
            );

            const input = getByDisplayValue('#FF0000');
            fireEvent.changeText(input, '#00FF00');

            expect(mockOnChange).toHaveBeenCalledWith('#00FF00');
        });
    });

    describe('FontSelector', () => {
        it('should render font options', () => {
            const { getByText } = render(
                <FontSelector 
                    selected="JetBrainsMono_400Regular"
                    onChange={jest.fn()}
                />
            );

            expect(getByText('FONT FAMILY')).toBeTruthy();
            expect(getByText('JetBrains Mono')).toBeTruthy();
            expect(getByText('System Default')).toBeTruthy();
        });
    });

    describe('ThemePreview', () => {
        it('should render preview with theme config', () => {
            const themeConfig = {
                colors: {
                    primary: '#FFB100',
                    surface: '#121212',
                    text: '#FFFFFF',
                    textMuted: '#A0A0A0',
                    success: '#44FF44'
                }
            };

            const { getByText } = render(
                <ThemePreview themeConfig={themeConfig} />
            );

            expect(getByText('LIVE PREVIEW')).toBeTruthy();
            expect(getByText('WORKOUT TRACKER')).toBeTruthy();
            expect(getByText('Dashboard Screen')).toBeTruthy();
            expect(getByText('✓ Good contrast')).toBeTruthy();
        });
    });
});