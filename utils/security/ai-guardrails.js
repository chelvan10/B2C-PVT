/**
 * AI CODER AGENT SECURITY GUARDRAILS
 * Prevents vulnerabilities in auto-generated code
 */

class AISecurityGuardrails {
  static SECURITY_PATTERNS = {
    // Hardcoded credentials
    credentials: /(password|secret|key|token)\s*[:=]\s*["'][^"']{3,}["']/i,
    
    // Code injection risks
    codeInjection: /(eval|Function|setTimeout|setInterval)\s*\(/i,
    
    // SQL injection patterns
    sqlInjection: /(SELECT|INSERT|UPDATE|DELETE).*\+.*["']/i,
    
    // XSS patterns
    xss: /innerHTML\s*=|document\.write\(/i
  };

  static validateGeneratedCode(code) {
    const issues = [];
    
    for (const [type, pattern] of Object.entries(this.SECURITY_PATTERNS)) {
      if (pattern.test(code)) {
        issues.push({
          type,
          severity: 'high',
          message: `Potential ${type} vulnerability detected`
        });
      }
    }
    
    return {
      isSecure: issues.length === 0,
      issues
    };
  }

  static secureTemplate(template, data) {
    // Replace credentials with environment variables
    template = template.replace(
      /(password|secret|key)\s*:\s*["'][^"']+["']/gi,
      (match, key) => `${key}: process.env.${key.toUpperCase()} || 'CHANGE_ME'`
    );
    
    // Add input validation
    template = template.replace(
      /console\.log\(([^)]+)\)/g,
      'SecureLogger.info($1)'
    );
    
    return template;
  }

  static enforceSecurityRules() {
    return {
      // Rule 1: No hardcoded credentials
      noHardcodedCredentials: true,
      
      // Rule 2: Always use secure logging
      useSecureLogging: true,
      
      // Rule 3: Validate all inputs
      validateInputs: true,
      
      // Rule 4: Use environment variables
      useEnvironmentVariables: true
    };
  }
}

module.exports = AISecurityGuardrails;