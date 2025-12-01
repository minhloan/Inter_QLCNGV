import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'app_sidebar_collapsed';

export default function useSidebar(initial = false) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored !== null) return stored === 'true';
        } catch (e) {
            // ignore
        }
        return initial;
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, isCollapsed ? 'true' : 'false');
        } catch (e) {
            // ignore
        }
        // notify other parts of app in same window (optional)
        const ev = new CustomEvent('sidebar:change', { detail: { isCollapsed } });
        window.dispatchEvent(ev);
    }, [isCollapsed]);

    // sync across browser tabs
    useEffect(() => {
        function onStorage(e) {
            if (e.key === STORAGE_KEY) {
                setIsCollapsed(e.newValue === 'true');
            }
        }
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // allow other components to listen if needed
    useEffect(() => {
        function onChange(e) {
            const next = e.detail?.isCollapsed;
            if (typeof next === 'boolean') setIsCollapsed(next);
        }
        window.addEventListener('sidebar:change', onChange);
        return () => window.removeEventListener('sidebar:change', onChange);
    }, []);

    const toggle = useCallback(() => setIsCollapsed(v => !v), []);

    return { isCollapsed, setIsCollapsed, toggle };
}
