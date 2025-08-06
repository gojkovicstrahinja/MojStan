// Error translation utility for converting Supabase errors to Serbian

interface ErrorTranslation {
  [key: string]: string
}

// Common Supabase authentication error messages and their Serbian translations
const ERROR_TRANSLATIONS: ErrorTranslation = {
  // Login/Authentication errors
  'Invalid login credentials': 'Neispravna email adresa ili lozinka.',
  'Email not confirmed': 'Email adresa nije potvrđena. Molimo proverite vašu email poštu.',
  'Invalid email': 'Email adresa nije validna.',
  'Password should be at least 6 characters': 'Lozinka mora imati najmanje 6 karaktera.',
  'User not found': 'Korisnik nije pronađen.',
  'Email address not authorized': 'Email adresa nije autorizovana.',
  'Too many requests': 'Previše zahteva. Molimo pokušajte ponovo kasnije.',
  'Signup disabled': 'Registracija je trenutno onemogućena.',
  'Email rate limit exceeded': 'Prekoračen je limit slanja email-ova. Pokušajte ponovo kasnije.',
  
  // Registration errors
  'User already registered': 'Korisnik je već registrovan.',
  'Email already registered': 'Email adresa je već registrovana.',
  'Weak password': 'Lozinka je previše slaba. Koristite kombinaciju slova, brojeva i simbola.',
  'Password too short': 'Lozinka je prekratka. Minimum je 6 karaktera.',
  'Invalid password': 'Neispravna lozinka.',
  
  // Email confirmation errors
  'Email link is invalid or has expired': 'Email link je neispravan ili je istekao.',
  'Token has expired or is invalid': 'Token je istekao ili je neispravan.',
  'Confirmation token not found': 'Token za potvrdu nije pronađen.',
  
  // Password reset errors
  'Unable to validate email address: invalid format': 'Nije moguće validirati email adresu: neispravan format.',
  'Password reset not allowed': 'Resetovanje lozinke nije dozvoljeno.',
  
  // Network/Server errors
  'Network error': 'Greška mreže. Molimo proverite internetsku konekciju.',
  'Internal server error': 'Interna greška servera. Molimo pokušajte ponovo.',
  'Service temporarily unavailable': 'Servis je privremeno nedostupan.',
  'Database error': 'Greška baze podataka.',
  
  // Generic errors
  'An error occurred': 'Došlo je do greške.',
  'Something went wrong': 'Nešto je pošlo po zlu.',
  'Unexpected error': 'Neočekivana greška.',
  'Request failed': 'Zahtev nije uspeo.',
  
  // Session/Token errors
  'Session expired': 'Sesija je istekla. Molimo prijavite se ponovo.',
  'Invalid session': 'Neispravna sesija.',
  'Access token expired': 'Pristupni token je istekao.',
  'Refresh token expired': 'Token za osvežavanje je istekao.',
  
  // Permission errors
  'Insufficient permissions': 'Nemate dovoljno dozvola.',
  'Access denied': 'Pristup odbijen.',
  'Unauthorized': 'Neautorizovan pristup.',
  
  // Rate limiting
  'Rate limit exceeded': 'Prekoračen je limit zahteva.',
  'Too many login attempts': 'Previše pokušaja prijave. Pokušajte ponovo kasnije.',
  
  // Account status
  'Account suspended': 'Nalog je suspendovan.',
  'Account disabled': 'Nalog je onemogućen.',
  'Account locked': 'Nalog je zaključan.'
}

/**
 * Translates English error messages to Serbian
 * @param errorMessage - The original error message (usually in English)
 * @returns Translated error message in Serbian
 */
export function translateError(errorMessage: string): string {
  if (!errorMessage) {
    return 'Došlo je do neočekivane greške.'
  }

  // Direct translation lookup
  if (ERROR_TRANSLATIONS[errorMessage]) {
    return ERROR_TRANSLATIONS[errorMessage]
  }

  // Check for partial matches (case-insensitive)
  const lowerMessage = errorMessage.toLowerCase()
  
  for (const [englishError, serbianError] of Object.entries(ERROR_TRANSLATIONS)) {
    if (lowerMessage.includes(englishError.toLowerCase())) {
      return serbianError
    }
  }

  // Check for common patterns
  if (lowerMessage.includes('email') && lowerMessage.includes('confirm')) {
    return 'Molimo potvrdite vašu email adresu.'
  }
  
  if (lowerMessage.includes('password') && lowerMessage.includes('weak')) {
    return 'Lozinka je previše slaba. Koristite kombinaciju slova, brojeva i simbola.'
  }
  
  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return 'Greška mreže. Molimo proverite internetsku konekciju.'
  }
  
  if (lowerMessage.includes('server') || lowerMessage.includes('internal')) {
    return 'Interna greška servera. Molimo pokušajte ponovo.'
  }
  
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
    return 'Previše zahteva. Molimo pokušajte ponovo kasnije.'
  }

  // If no translation found, return a generic Serbian error message
  return 'Došlo je do greške. Molimo pokušajte ponovo.'
}

/**
 * Translates Supabase auth errors specifically
 * @param error - Supabase error object
 * @returns Translated error message in Serbian
 */
export function translateAuthError(error: any): string {
  if (!error) {
    return 'Došlo je do greške prilikom autentifikacije.'
  }

  // Handle different error formats
  let errorMessage = ''
  
  if (typeof error === 'string') {
    errorMessage = error
  } else if (error.message) {
    errorMessage = error.message
  } else if (error.error_description) {
    errorMessage = error.error_description
  } else if (error.msg) {
    errorMessage = error.msg
  } else {
    errorMessage = 'Unknown error'
  }

  return translateError(errorMessage)
}

/**
 * Get a user-friendly error message for common authentication scenarios
 * @param errorCode - Error code or type
 * @returns User-friendly Serbian error message
 */
export function getAuthErrorMessage(errorCode: string): string {
  const authErrorMessages: ErrorTranslation = {
    'invalid_credentials': 'Neispravna email adresa ili lozinka.',
    'email_not_confirmed': 'Molimo potvrdite vašu email adresu pre prijave.',
    'user_not_found': 'Korisnik sa ovom email adresom nije pronađen.',
    'weak_password': 'Lozinka mora biti jača. Koristite kombinaciju slova, brojeva i simbola.',
    'email_taken': 'Ova email adresa je već registrovana.',
    'signup_disabled': 'Registracija je trenutno onemogućena.',
    'rate_limit': 'Previše pokušaja. Molimo sačekajte pre ponovnog pokušaja.',
    'network_error': 'Greška mreže. Proverite internetsku konekciju.',
    'server_error': 'Greška servera. Molimo pokušajte ponovo.'
  }

  return authErrorMessages[errorCode] || 'Došlo je do neočekivane greške.'
}

export default {
  translateError,
  translateAuthError,
  getAuthErrorMessage
}