/**
 * Woodpecker Training Configuration
 * Centralized configuration for all magic numbers and constants
 */

export const WOODPECKER_CONFIG = {
    // Training Cycle Configuration
    DEFAULT_TARGET_ROUNDS: 7,

    // Timing Configuration (in milliseconds)
    REST_PERIOD_MS: 24 * 60 * 60 * 1000, // 24 hours
    AUTO_ADVANCE_DELAY_MS: 300, // 300ms delay after correct answer

    // Timing Configuration (in seconds)
    REST_PERIOD_SECONDS: 24 * 60 * 60, // 24 hours in seconds

    // Target Time Configuration
    MIN_TARGET_TIME_SECONDS: 1, // Minimum target time for a round
    TARGET_TIME_HALVING_FACTOR: 2, // Divide previous time by this factor

    // Mastery Thresholds
    MASTERY_TARGET_TIME_SECONDS: 5, // Target time for "Woodpecker Mastery"
    PERFECT_ACCURACY_THRESHOLD: 100, // Required accuracy percentage to pass

    // UI Timing Thresholds (for color coding)
    QUESTION_TIME_FAST_THRESHOLD: 2, // Green if under 2 seconds
    QUESTION_TIME_MEDIUM_THRESHOLD: 5, // Yellow if under 5 seconds, red otherwise

    // Analytics Configuration
    MAX_RECENT_SESSIONS: 5, // Number of recent sessions to show in analytics
    MAX_RECENT_ROUNDS: 20, // Number of recent rounds to show in analytics
    MAX_DIFFICULT_QUESTIONS: 10, // Number of difficult questions to show

    // Knowledge Gap Threshold
    KNOWLEDGE_GAP_TIME_THRESHOLD: 10, // Questions taking >10s are flagged as gaps
} as const;

// Type for the config (useful for type safety)
export type WoodpeckerConfig = typeof WOODPECKER_CONFIG;
