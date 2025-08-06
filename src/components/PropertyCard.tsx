import React from 'react'
import { Link } from 'react-router-dom'
import type { Property } from '../types'
import { MapPin, Euro, Heart, User } from 'lucide-react'
import { PROPERTY_TYPES } from '../types'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images && property.images.length > 0 
    ? property.images[0].image_url 
    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDE4NVYxMzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTE2NSAxMzVIMTk1VjE0NUgxNjVWMTM1WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTU1IDE0NUgyMDVWMTU1SDE1NVYxNDVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xNDUgMTU1SDIxNVYxNjVIMTQ1VjE1NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTE0NSAxNjVIMjE1VjE3NUgxNDVWMTY1WiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjE5NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3Mjg0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OZW1hIHNsaWtlPC90ZXh0Pgo8L3N2Zz4K'

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sr-RS').format(price)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/property/${property.id}`}>
        <div className="relative">
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDE4NVYxMzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTE2NSAxMzVIMTk1VjE0NUgxNjVWMTM1WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTU1IDE0NUgyMDVWMTU1SDE1NVYxNDVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xNDUgMTU1SDIxNVYxNjVIMTQ1VjE1NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTE0NSAxNjVIMjE1VjE3NUgxNDVWMTY1WiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjE5NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNkI3Mjg0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OZW1hIHNsaWtlPC90ZXh0Pgo8L3N2Zz4K'
            }}
          />
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
              {PROPERTY_TYPES[property.property_type as keyof typeof PROPERTY_TYPES] || property.property_type}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <button className="bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full transition-all duration-200">
              <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
            </button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/property/${property.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {property.location.city}, {property.location.address}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-blue-600 font-semibold">
            <Euro className="h-4 w-4 mr-1" />
            <span>{formatPrice(property.price)}</span>
            <span className="text-gray-500 text-sm ml-1">/mesečno</span>
          </div>
        </div>

        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                  +{property.amenities.length - 3} više
                </span>
              )}
            </div>
          </div>
        )}

        {property.owner && (
          <div className="flex items-center text-gray-500 text-sm pt-3 border-t border-gray-100">
            <User className="h-4 w-4 mr-1" />
            <span>{property.owner.full_name}</span>
          </div>
        )}
      </div>
    </div>
  )
}