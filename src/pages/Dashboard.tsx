import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PropertyService } from '../lib/properties'
import type { Property } from '../types'
import { 
  Plus, 
  Home, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Euro, 
  Calendar,
  TrendingUp,
  MessageCircle,
  Settings,
  User,
  BarChart3
} from 'lucide-react'
import { PROPERTY_TYPES } from '../types'

export default function Dashboard() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    totalViews: 0,
    totalMessages: 0
  })

  useEffect(() => {
    const loadUserProperties = async () => {
      if (!user?.id) return
      
      setLoading(true)
      const { data, error } = await PropertyService.getPropertiesByOwner(user.id)
      
      if (!error && data) {
        setProperties(data)
        setStats({
          totalProperties: data.length,
          activeProperties: data.filter(p => p.is_active).length,
          totalViews: data.length * 15, // Mock view count
          totalMessages: 0 // This would come from a messages service
        })
      }
      
      setLoading(false)
    }

    loadUserProperties()
  }, [user?.id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sr-RS').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS')
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovu nekretninu?')) {
      const { error } = await PropertyService.deleteProperty(propertyId)
      if (!error) {
        setProperties(properties.filter(p => p.id !== propertyId))
        setStats(prev => ({
          ...prev,
          totalProperties: prev.totalProperties - 1,
          activeProperties: prev.activeProperties - 1
        }))
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-300 h-32 rounded-lg"></div>
              ))}
            </div>
            <div className="bg-gray-300 h-96 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dobrodošli, {user?.full_name}!
              </h1>
              <p className="text-gray-600 mt-1">
                {user?.user_type === 'owner' ? 'Vlasnik nekretnina' : 'Stanar'}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/post-property"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Dodaj nekretninu</span>
              </Link>
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Podešavanja</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ukupno nekretnina</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivne nekretnine</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeProperties}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ukupni pregledi</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalViews}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Poruke</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalMessages}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <MessageCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Moje nekretnine</h2>
              <div className="flex items-center space-x-2">
                <button className="text-gray-500 hover:text-gray-700">
                  <BarChart3 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nemate objavljene nekretnine
              </h3>
              <p className="text-gray-600 mb-6">
                Počnite sa objavljivanjem vaših nekretnina i privucite potencijalne stanare.
              </p>
              <Link
                to="/post-property"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Dodaj prvu nekretninu</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nekretnina
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokacija
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cena
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Objavljeno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={
                                property.images && property.images.length > 0
                                  ? property.images[0].image_url
                                  : `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('modern apartment interior')}&image_size=square`
                              }
                              alt={property.title}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('modern apartment interior')}&image_size=square`
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {PROPERTY_TYPES[property.property_type as keyof typeof PROPERTY_TYPES]}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {property.location.city}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.location.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <Euro className="h-4 w-4 mr-1 text-gray-400" />
                          {formatPrice(property.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          property.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {property.is_active ? 'Aktivna' : 'Neaktivna'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(property.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/property/${property.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Prikaži"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors"
                            title="Uredi"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Obriši"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Poruke</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Proverite nova pitanja i zahteve od potencijalnih stanara.
            </p>
            <Link
              to="/messages"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Prikaži poruke →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Analitika</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Pratite performanse vaših oglasa i preglede nekretnina.
            </p>
            <button className="text-green-600 hover:text-green-700 font-medium">
              Prikaži izveštaje →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Profil</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Ažurirajte svoje lične informacije i kontakt podatke.
            </p>
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              Uredi profil →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}