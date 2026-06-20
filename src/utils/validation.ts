/**
 * Validation Utility Module
 * 
 * Centralized validation functions for form inputs.
 * Reusable across signup, profile editing, etc.
 */

// ─── Password Validation ────────────────────────────────────────────────────

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordValidation {
    valid: boolean;
    errors: string[];
    strength: PasswordStrength;
}

/**
 * Validates password strength and returns detailed feedback.
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number.
 */
export function validatePassword(password: string): PasswordValidation {
    const errors: string[] = [];

    if (!password) {
        return { valid: false, errors: ['Password is required'], strength: 'weak' };
    }

    if (password.length < 8) {
        errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('At least 1 uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('At least 1 lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('At least 1 number');
    }

    // Strength calculation
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++; // special chars bonus

    let strength: PasswordStrength = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 2) strength = 'medium';

    return { valid: errors.length === 0, errors, strength };
}

// ─── Handle Validation ───────────────────────────────────────────────────────

export interface HandleValidation {
    valid: boolean;
    error?: string;
}

/**
 * Validates a user handle.
 * Rules: 3-20 chars, alphanumeric + underscores only, no spaces.
 */
export function validateHandle(handle: string): HandleValidation {
    if (!handle) {
        return { valid: false, error: 'Handle is required' };
    }
    if (handle.length < 3) {
        return { valid: false, error: 'Handle must be at least 3 characters' };
    }
    if (handle.length > 20) {
        return { valid: false, error: 'Handle must be 20 characters or fewer' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
        return { valid: false, error: 'Only letters, numbers, and underscores allowed' };
    }
    if (/^\d/.test(handle)) {
        return { valid: false, error: 'Handle cannot start with a number' };
    }
    return { valid: true };
}

// ─── Name Validation ─────────────────────────────────────────────────────────

export interface NameValidation {
    valid: boolean;
    error?: string;
}

/**
 * Validates a display name.
 * Rules: 2-50 chars, no special characters except spaces, hyphens, apostrophes.
 */
export function validateName(name: string): NameValidation {
    if (!name || !name.trim()) {
        return { valid: false, error: 'Name is required' };
    }
    const trimmed = name.trim();
    if (trimmed.length < 2) {
        return { valid: false, error: 'Name must be at least 2 characters' };
    }
    if (trimmed.length > 50) {
        return { valid: false, error: 'Name must be 50 characters or fewer' };
    }
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
        return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    return { valid: true };
}

// ─── Email Validation (enhanced) ─────────────────────────────────────────────

export interface EmailValidation {
    valid: boolean;
    error?: string;
}

/**
 * Enhanced email validation beyond the basic regex in utils/index.ts.
 * Checks for disposable email domains as well.
 */
export function validateEmail(email: string): EmailValidation {
    if (!email || !email.trim()) {
        return { valid: false, error: 'Email is required' };
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(trimmed)) {
        return { valid: false, error: 'Please enter a valid email address' };
    }

    // Block common disposable/temporary email providers
    const disposableDomains = [
        'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'guerrillamail.net',
        'sharklasers.com', 'grr.la', 'guerrillamail.info', 'guerrillamail.biz',
        'guerrillamail.de', 'guerrillamail.org', 'mailinator.com', 'maildrop.cc',
        'dispostable.com', 'yopmail.com', 'yopmail.fr', 'trashmail.com',
        'trashmail.me', 'trashmail.net', '10minutemail.com', 'tempail.com',
        'fakeinbox.com', 'temp-mail.org', 'tmpmail.net', 'tmpmail.org',
    ];

    const domain = trimmed.split('@')[1];
    if (disposableDomains.includes(domain)) {
        return { valid: false, error: 'Disposable email addresses are not allowed' };
    }

    return { valid: true };
}

// ─── Input Sanitization ──────────────────────────────────────────────────────

/**
 * Sanitizes user input by stripping HTML tags, trimming whitespace,
 * and limiting string length.
 */
export function sanitizeInput(input: string, maxLength: number = 200): string {
    if (!input) return '';
    return input
        .replace(/<[^>]*>/g, '')   // Strip HTML tags
        .replace(/[<>]/g, '')      // Remove any remaining angle brackets
        .trim()
        .slice(0, maxLength);
}

// ─── Full Signup Form Validation ─────────────────────────────────────────────

export interface SignupFormErrors {
    name?: string;
    handle?: string;
    email?: string;
    password?: string;
}

/**
 * Validates the entire signup form and returns field-level errors.
 * Returns null if everything is valid.
 */
export function validateSignupForm(data: {
    name: string;
    handle: string;
    email: string;
    password: string;
}): SignupFormErrors | null {
    const errors: SignupFormErrors = {};

    const nameResult = validateName(data.name);
    if (!nameResult.valid) errors.name = nameResult.error;

    const handleResult = validateHandle(data.handle);
    if (!handleResult.valid) errors.handle = handleResult.error;

    const emailResult = validateEmail(data.email);
    if (!emailResult.valid) errors.email = emailResult.error;

    const passwordResult = validatePassword(data.password);
    if (!passwordResult.valid) errors.password = passwordResult.errors[0]; // Show first error

    if (Object.keys(errors).length > 0) return errors;
    return null;
}
