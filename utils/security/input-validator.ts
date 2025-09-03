/**
 * EVEREST-STANDARD INPUT VALIDATION UTILITY
 * Prevents code injection attacks (CWE-94)
 * Enterprise-grade input sanitization and validation
 */

export class InputValidator {
  
  /**
   * Sanitizes string input to prevent injection attacks
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    return input
      .replace(/[<>'"&]/g, (char) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[char] || char;
      })
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .trim();
  }

  /**
   * Validates URL to prevent malicious redirects
   */
  static validateUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const allowedProtocols = ['http:', 'https:'];
      const blockedProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
      
      if (blockedProtocols.some(protocol => url.toLowerCase().includes(protocol))) {
        return false;
      }
      
      return allowedProtocols.includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Validates and sanitizes test data
   */
  static validateTestData(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.validateTestData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[this.sanitizeString(key)] = this.validateTestData(value);
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * Prevents command injection in shell commands
   */
  static sanitizeCommand(command: string): string {
    // Remove dangerous characters that could be used for command injection
    return command
      .replace(/[;&|`$(){}[\]\\]/g, '')
      .replace(/\.\./g, '')
      .trim();
  }
}