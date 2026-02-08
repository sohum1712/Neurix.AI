/**
 * HIPAA-Compliant Encryption Utility
 * AES-256-GCM encryption for sensitive health data
 */

const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Get encryption key from environment (must be 32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

if (!process.env.ENCRYPTION_KEY) {
    console.warn('⚠️  WARNING: ENCRYPTION_KEY not set in environment. Using temporary key. Set ENCRYPTION_KEY for production!');
}

/**
 * Encrypt sensitive data
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted data with IV and auth tag
 */
function encrypt(text) {
    if (!text) return text;

    try {
        // Generate random IV
        const iv = crypto.randomBytes(IV_LENGTH);

        // Create cipher
        const cipher = crypto.createCipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY, 'hex'),
            iv
        );

        // Encrypt
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Get auth tag
        const authTag = cipher.getAuthTag();

        // Combine IV + encrypted data + auth tag
        const result = iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');

        return result;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted data with IV and auth tag
 * @returns {string} - Decrypted plain text
 */
function decrypt(encryptedData) {
    if (!encryptedData) return encryptedData;

    try {
        // Split IV, encrypted data, and auth tag
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const authTag = Buffer.from(parts[2], 'hex');

        // Create decipher
        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY, 'hex'),
            iv
        );

        // Set auth tag
        decipher.setAuthTag(authTag);

        // Decrypt
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Hash sensitive data (one-way, for comparison)
 * @param {string} text - Text to hash
 * @returns {string} - Hashed value
 */
function hash(text) {
    if (!text) return text;

    try {
        const salt = crypto.randomBytes(SALT_LENGTH);
        const hashedBuffer = crypto.pbkdf2Sync(
            text,
            salt,
            ITERATIONS,
            KEY_LENGTH,
            'sha512'
        );

        return salt.toString('hex') + ':' + hashedBuffer.toString('hex');
    } catch (error) {
        console.error('Hashing error:', error);
        throw new Error('Failed to hash data');
    }
}

/**
 * Verify hashed data
 * @param {string} text - Plain text to verify
 * @param {string} hashedText - Hashed text to compare against
 * @returns {boolean} - True if match
 */
function verifyHash(text, hashedText) {
    if (!text || !hashedText) return false;

    try {
        const parts = hashedText.split(':');
        if (parts.length !== 2) return false;

        const salt = Buffer.from(parts[0], 'hex');
        const originalHash = parts[1];

        const hashedBuffer = crypto.pbkdf2Sync(
            text,
            salt,
            ITERATIONS,
            KEY_LENGTH,
            'sha512'
        );

        return originalHash === hashedBuffer.toString('hex');
    } catch (error) {
        console.error('Hash verification error:', error);
        return false;
    }
}

/**
 * Encrypt object fields
 * @param {object} obj - Object with fields to encrypt
 * @param {string[]} fields - Array of field names to encrypt
 * @returns {object} - Object with encrypted fields
 */
function encryptFields(obj, fields) {
    const encrypted = { ...obj };
    fields.forEach(field => {
        if (encrypted[field]) {
            encrypted[field] = encrypt(encrypted[field]);
        }
    });
    return encrypted;
}

/**
 * Decrypt object fields
 * @param {object} obj - Object with encrypted fields
 * @param {string[]} fields - Array of field names to decrypt
 * @returns {object} - Object with decrypted fields
 */
function decryptFields(obj, fields) {
    const decrypted = { ...obj };
    fields.forEach(field => {
        if (decrypted[field]) {
            try {
                decrypted[field] = decrypt(decrypted[field]);
            } catch (error) {
                console.error(`Failed to decrypt field ${field}:`, error);
                // Keep encrypted value if decryption fails
            }
        }
    });
    return decrypted;
}

/**
 * Generate audit log entry
 * @param {string} action - Action performed
 * @param {string} userId - User ID
 * @param {string} resource - Resource accessed
 * @param {object} metadata - Additional metadata
 * @returns {object} - Audit log entry
 */
function createAuditLog(action, userId, resource, metadata = {}) {
    return {
        timestamp: new Date(),
        action,
        userId,
        resource,
        metadata,
        ipAddress: metadata.ipAddress || 'unknown',
        userAgent: metadata.userAgent || 'unknown'
    };
}

module.exports = {
    encrypt,
    decrypt,
    hash,
    verifyHash,
    encryptFields,
    decryptFields,
    createAuditLog
};
