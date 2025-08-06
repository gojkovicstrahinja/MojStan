import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { RegisterFormData } from '../types'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    full_name: '',
    user_type: 'tenant',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('Registration form submitted with data:', {
      email: formData.email,
      full_name: formData.full_name,
      user_type: formData.user_type,
      phone: formData.phone
    })

    if (formData.password.length < 6) {
      setError('Lozinka mora imati najmanje 6 karaktera.')
      setLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Molimo unesite validnu email adresu.')
      setLoading(false)
      return
    }

    // Check for common invalid domains
    const invalidDomains = ['example.com', 'test.com', 'invalid.com']
    const emailDomain = formData.email.split('@')[1]?.toLowerCase()
    if (invalidDomains.includes(emailDomain)) {
      setError('Molimo koristite validnu email adresu sa pravim domenom.')
      setLoading(false)
      return
    }

    const { error } = await signUp(formData)
    
    if (error) {
      console.error('Registration error in component:', error)
      // Auth service now provides translated error messages
      setError(error.message || 'Došlo je do greške prilikom registracije.')
    } else {
      console.log('Registration successful, navigating to login')
      navigate('/login', { 
        state: { message: 'Registracija uspešna! Poslali smo vam email za potvrdu. Molimo proverite poštu i potvrdite nalog pre prijave.' }
      })
    }
    
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">MojStan</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Registrujte se
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ili{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              prijavite se na postojeći nalog
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Puno ime
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Unesite vaše puno ime"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email adresa
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Unesite vašu email adresu"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefon (opciono)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Unesite vaš broj telefona"
                />
              </div>
            </div>

            <div>
              <label htmlFor="user_type" className="block text-sm font-medium text-gray-700">
                Tip korisnika
              </label>
              <div className="mt-1">
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="tenant">Stanar (tražim stan)</option>
                  <option value="owner">Vlasnik (izdajem stan)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Lozinka
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Unesite lozinku (min. 6 karaktera)"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registracija...' : 'Registrujte se'}
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Registracijom se slažete sa našim uslovima korišćenja i politikom privatnosti.
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}