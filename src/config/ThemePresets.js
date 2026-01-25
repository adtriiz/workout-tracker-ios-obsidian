export const THEME_PRESETS = {
    'Hazard Yellow': {
        colors: {
            background: '#000000',
            surface: '#121212',
            surfaceElevated: '#1E1E1E',
            primary: '#FFB100',
            text: '#FFFFFF',
            textMuted: '#A0A0A0',
            border: '#333333',
            borderActive: '#FFB100',
            error: '#FF4444',
            success: '#44FF44',
        },
        name: 'Hazard Yellow',
        description: 'Current default theme'
    },
    'Ocean Blue': {
        colors: {
            background: '#0A0E27',
            surface: '#1E2542',
            surfaceElevated: '#2A3455',
            primary: '#3B82F6',
            text: '#F8FAFC',
            textMuted: '#94A3B8',
            border: '#334155',
            borderActive: '#3B82F6',
            error: '#EF4444',
            success: '#10B981',
        },
        name: 'Ocean Blue',
        description: 'Calm blue theme'
    },
    'Forest Green': {
        colors: {
            background: '#052E16',
            surface: '#0D3D22',
            surfaceElevated: '#145A32',
            primary: '#10B981',
            text: '#F0FDF4',
            textMuted: '#86EFAC',
            border: '#166534',
            borderActive: '#10B981',
            error: '#DC2626',
            success: '#059669',
        },
        name: 'Forest Green',
        description: 'Nature-inspired green theme'
    },
    'High Contrast': {
        colors: {
            background: '#000000',
            surface: '#FFFFFF',
            surfaceElevated: '#F3F4F6',
            primary: '#FFFFFF',
            text: '#000000',
            textMuted: '#374151',
            border: '#000000',
            borderActive: '#FFFFFF',
            error: '#FF0000',
            success: '#00FF00',
        },
        name: 'High Contrast',
        description: 'Maximum accessibility contrast'
    },
    'Minimal Light': {
        colors: {
            background: '#FFFFFF',
            surface: '#F9FAFB',
            surfaceElevated: '#F3F4F6',
            primary: '#1F2937',
            text: '#111827',
            textMuted: '#6B7280',
            border: '#E5E7EB',
            borderActive: '#1F2937',
            error: '#DC2626',
            success: '#059669',
        },
        name: 'Minimal Light',
        description: 'Clean light theme'
    }
};

export const FONT_OPTIONS = [
    { value: 'JetBrainsMono_400Regular', label: 'JetBrains Mono', style: 'monospace' },
    { value: 'System', label: 'System Default', style: 'system' },
    { value: 'Menlo_400Regular', label: 'Menlo', style: 'monospace' },
    { value: 'SFMono_400Regular', label: 'SF Mono', style: 'monospace' },
    { value: 'RobotoMono_400Regular', label: 'Roboto Mono', style: 'monospace' },
    { value: 'CourierNew_400Regular', label: 'Courier New', style: 'monospace' }
];

export const validateThemeConfig = (themeConfig) => {
    const errors = [];
    
    if (!themeConfig.colors) {
        errors.push('Theme must have colors object');
        return { valid: false, errors };
    }
    
    const requiredColors = [
        'background', 'surface', 'surfaceElevated', 'primary',
        'text', 'textMuted', 'border', 'borderActive', 'error', 'success'
    ];
    
    requiredColors.forEach(colorKey => {
        if (!themeConfig.colors[colorKey]) {
            errors.push(`Missing required color: ${colorKey}`);
        } else if (!/^#[0-9A-Fa-f]{6}$/.test(themeConfig.colors[colorKey])) {
            errors.push(`Invalid hex format for ${colorKey}: ${themeConfig.colors[colorKey]}`);
        }
    });
    
    return { valid: errors.length === 0, errors };
};