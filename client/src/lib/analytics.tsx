import { useEffect } from 'react';
import { useLocation } from 'wouter';
import ReactGA from 'react-ga4';

// Initialize Google Analytics
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let isInitialized = false;

export function initializeAnalytics() {
    if (!GA_MEASUREMENT_ID) {
        console.warn('Google Analytics Measurement ID not found. Analytics will not be tracked.');
        return;
    }

    if (!isInitialized) {
        ReactGA.initialize(GA_MEASUREMENT_ID);
        isInitialized = true;
        console.log('Google Analytics initialized:', GA_MEASUREMENT_ID);
    }
}

/**
 * Analytics component that tracks page views automatically
 * Place this component in your App to enable analytics
 */
export function Analytics() {
    const [location] = useLocation();

    useEffect(() => {
        if (!GA_MEASUREMENT_ID) return;

        // Initialize on first render
        initializeAnalytics();
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        // Track page view on route change
        ReactGA.send({
            hitType: "pageview",
            page: location,
            title: document.title
        });

        console.log('GA pageview tracked:', location);
    }, [location]);

    return null;
}

/**
 * Track custom events
 * @example
 * trackEvent('Export', 'Download CSV', 'Taxas Export');
 */
export function trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number
) {
    if (!isInitialized) return;

    ReactGA.event({
        category,
        action,
        label,
        value,
    });

    console.log('GA event tracked:', { category, action, label, value });
}
