import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PropertyService } from '../lib/properties'
import { useAuth } from '../hooks/useAuth'
import type { Property } from '../types'
import { Search, MapPin, Euro, Heart, ArrowRight } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    const loadFeaturedProperties = async () => {
      const { data } = await PropertyService.getFeaturedProperties()
      setFeaturedProperties(data)
      setLoading(false)
    }

    loadFeaturedProperties()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?location=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Pronađite svoj
              <span className="block text-white">idealan stan</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Najveća baza stanova za izdavanje u Srbiji. Brzo, jednostavno i pouzdano.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg p-2 shadow-xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Unesite grad ili lokaciju..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>Pretraži</span>
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1000+</div>
                <div className="text-blue-100">Aktivnih oglasa</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-blue-100">Gradova</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-blue-100">Podrška</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Izdvojeni stanovi
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pogledajte najnovije i najpopularnije stanove za izdavanje
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                Trenutno nema dostupnih stanova.
              </div>
              {user?.user_type === 'owner' && (
                <Link
                  to="/post-property"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  <span>Objavite prvi stan</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}

          {featuredProperties.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/search"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
              >
                <span>Pogledaj sve stanove</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kako funkcioniše?
            </h2>
            <p className="text-lg text-gray-600">
              Jednostavan proces u tri koraka
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Pretražite
              </h3>
              <p className="text-gray-600">
                Koristite našu naprednu pretragu da pronađete stan koji odgovara vašim potrebama
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. Kontaktirajte
              </h3>
              <p className="text-gray-600">
                Direktno kontaktirajte vlasnika kroz našu sigurnu platformu za razmenu poruka
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Uselite se
              </h3>
              <p className="text-gray-600">
                Dogovorite detalje i uselite se u svoj novi dom
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="py-16 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Spremni ste da pronađete svoj novi dom?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Registrujte se danas i dobijte pristup svim funkcijama
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium transition-colors"
              >
                Registruj se besplatno
              </Link>
              <Link
                to="/search"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-md font-medium transition-colors"
              >
                Pretraži stanove
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}