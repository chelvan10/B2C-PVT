/**
 * EVEREST-STANDARD SECURE LOGGING UTILITY
 * Prevents log injection attacks (CWE-117)
 * Enterprise-grade input sanitization
 */

export class SecureLogger {
  private static sanitizeInput(input: any): string {
    if (typeof input !== 'string') {
      input = JSON.stringify(input);
    }
    
    // Remove potential log injection characters
    return input
      .replace(/[\r\n]/g, ' ')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .replace(/[<>'"&]/g, (char) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[char] || char;
      });
  }

  static info(message: string, data?: any): void {
    const sanitizedMessage = this.sanitizeInput(message);
    const sanitizedData = data ? this.sanitizeInput(data) : '';
    console.log(`[INFO] ${sanitizedMessage}${sanitizedData ? ` - ${sanitizedData}` : ''}`);
  }

  static error(message: string, error?: any): void {
    const sanitizedMessage = this.sanitizeInput(message);
    const sanitizedError = error ? this.sanitizeInput(error.message || error) : '';
    console.error(`[ERROR] ${sanitizedMessage}${sanitizedError ? ` - ${sanitizedError}` : ''}`);
  }

  static warn(message: string, data?: any): void {
    const sanitizedMessage = this.sanitizeInput(message);
    const sanitizedData = data ? this.sanitizeInput(data) : '';
    console.warn(`[WARN] ${sanitizedMessage}${sanitizedData ? ` - ${sanitizedData}` : ''}`);
  }
}