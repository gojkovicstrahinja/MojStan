import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PropertyService } from '../lib/properties'
import type { Property, PropertySearchParams } from '../types'
import { Search, Filter, MapPin, Euro } from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import { PROPERTY_TYPES, SERBIAN_CITIES } from '../types'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState<PropertySearchParams>({
    location: searchParams.get('location') || '',
    property_type: searchParams.get('property_type') || '',
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    page: 1,
    limit: 12
  })

  useEffect(() => {
    loadProperties()
  }, [filters, currentPage])

  const loadProperties = async () => {
    setLoading(true)
    const searchFilters = { ...filters, page: currentPage }
    const result = await PropertyService.getProperties(searchFilters)
    setProperties(result.properties)
    setTotalCount(result.total_count)
    setLoading(false)
  }

  const handleFilterChange = (key: keyof PropertySearchParams, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setCurrentPage(1)
    
    // Update URL params
    const newSearchParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) {
        newSearchParams.set(k, String(v))
      }
    })
    setSearchParams(newSearchParams)
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      property_type: '',
      min_price: undefined,
      max_price: undefined,
      page: 1,
      limit: 12
    })
    setCurrentPage(1)
    setSearchParams({})
  }

  const totalPages = Math.ceil(totalCount / (filters.limit || 12))

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Pretraži po gradu ili adresi..."
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filteri</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Property Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tip nekretnine
                  </label>
                  <select
                    value={filters.property_type || ''}
                    onChange={(e) => handleFilterChange('property_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Svi tipovi</option>
                    {Object.entries(PROPERTY_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. cena (€)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.min_price || ''}
                    onChange={(e) => handleFilterChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max. cena (€)
                  </label>
                  <input
                    type="number"
                    placeholder="Bez limita"
                    value={filters.max_price || ''}
                    onChange={(e) => handleFilterChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Obriši filtere
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {loading ? 'Učitavanje...' : `Pronađeno ${totalCount} stanova`}
          </h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Prethodna
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sledeća
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              Nema rezultata za vašu pretragu.
            </div>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Obriši filtere i pokušaj ponovo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}