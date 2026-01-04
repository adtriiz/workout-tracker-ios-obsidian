import { useState, useEffect } from 'react';
import { StorageService } from '../services/StorageService';

export const useExercises = () => {
    const [exercises, setExercises] = useState([]);
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        const [exData, groupData] = await Promise.all([
            StorageService.getExercises(),
            StorageService.getMuscleGroups()
        ]);
        setExercises(exData);
        setMuscleGroups(groupData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const addExercise = async (name, category, notes = '') => {
        const newExercise = {
            id: Date.now().toString(),
            name,
            category: category.toUpperCase(),
            notes,
            createdAt: new Date().toISOString(),
        };

        // If category is new, add to muscle groups
        if (category && !muscleGroups.includes(category.toUpperCase())) {
            const newGroups = [...muscleGroups, category.toUpperCase()].sort();
            await StorageService.saveMuscleGroups(newGroups);
            setMuscleGroups(newGroups);
        }

        await StorageService.saveExercise(newExercise);
        // Optimize: just append to local state instead of full reload if speed is an issue, 
        // but loadData ensures consistency.
        await loadData();
        return newExercise;
    };

    const deleteExercise = async (id) => {
        await StorageService.deleteExercise(id);
        await loadData();
    };

    return { exercises, muscleGroups, loading, addExercise, deleteExercise, refresh: loadData };
};

import { WorkoutFactory } from '../logic/WorkoutFactory';

export const useWorkout = () => {
    const [activeWorkout, setActiveWorkout] = useState(null);

    const startWorkout = (config = null) => {
        // If config has templateId, use createFromTemplate, otherwise createEmpty
        // Or if config is a full workout object (from Setup screen), use it directly
        // primarily we expect 'template' or 'null' for now, but upgrading to support the factory.

        let workout;
        if (config && config.exercises) {
            // It's a pre-configured workout object
            workout = config;
        } else {
            workout = WorkoutFactory.createFromTemplate(config);
        }

        setActiveWorkout(workout);
    };

    const addExerciseToWorkout = (exercise, supersetId = null) => {
        if (!activeWorkout) return;
        setActiveWorkout(prev => ({
            ...prev,
            exercises: [...prev.exercises, {
                ...exercise,
                instanceId: Math.random().toString(36).substr(2, 9),
                supersetId: supersetId,
                sets: [{ id: '1', weight: 0, reps: 0, completed: false }]
            }]
        }));
    };

    const createSuperset = (instanceIds) => {
        const supersetId = Date.now().toString();
        setActiveWorkout(prev => ({
            ...prev,
            exercises: prev.exercises.map(ex =>
                instanceIds.includes(ex.instanceId) ? { ...ex, supersetId } : ex
            )
        }));
    };

    const updateSet = (exerciseInstanceId, setId, updates) => {
        setActiveWorkout(prev => ({
            ...prev,
            exercises: prev.exercises.map(ex =>
                ex.instanceId === exerciseInstanceId
                    ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s) }
                    : ex
            )
        }));
    };

    const addSet = (exerciseInstanceId) => {
        setActiveWorkout(prev => ({
            ...prev,
            exercises: prev.exercises.map(ex =>
                ex.instanceId === exerciseInstanceId
                    ? {
                        ...ex,
                        sets: [...ex.sets, {
                            id: Date.now().toString(),
                            weight: ex.sets[ex.sets.length - 1]?.weight || 0,
                            reps: ex.sets[ex.sets.length - 1]?.reps || 0,
                            completed: false
                        }]
                    }
                    : ex
            )
        }));
    };

    const finishWorkout = async () => {
        if (!activeWorkout) return null;
        const completedWorkout = {
            ...activeWorkout,
            endTime: new Date().toISOString(),
            duration: Math.round((new Date() - new Date(activeWorkout.startTime)) / 1000 / 60), // minutes
        };
        await StorageService.saveLog(completedWorkout);
        setActiveWorkout(null);
        return completedWorkout;
    };

    const cancelWorkout = () => {
        setActiveWorkout(null);
    };

    return {
        activeWorkout,
        startWorkout,
        addExerciseToWorkout,
        updateSet,
        addSet,
        finishWorkout,
        cancelWorkout
    };
};

export const useTemplates = () => {
    const [templates, setTemplates] = useState([]);

    const loadTemplates = async () => {
        const data = await StorageService.getTemplates();
        setTemplates(data || []);
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const addTemplate = async (template) => {
        await StorageService.saveTemplate(template);
        await loadTemplates();
    };

    const deleteTemplate = async (id) => {
        await StorageService.deleteTemplate(id);
        await loadTemplates();
    };

    return { templates, addTemplate, deleteTemplate, refresh: loadTemplates };
};

export const useSettings = () => {
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const load = async () => {
            const data = await StorageService.getSettings();
            setSettings(data);
        };
        load();
    }, []);

    const saveSettings = async (newSettings) => {
        await StorageService.saveSettings(newSettings);
        setSettings(newSettings);
    };

    return { settings, saveSettings };
};

export const useLogs = () => {
    const [logs, setLogs] = useState([]);

    const loadLogs = async () => {
        const data = await StorageService.getLogs();
        setLogs(data || []);
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const deleteLog = async (id) => {
        await StorageService.deleteLog(id);
        await loadLogs();
    };

    return { logs, deleteLog, refresh: loadLogs };
};
