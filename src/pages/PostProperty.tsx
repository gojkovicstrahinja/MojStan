import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PropertyService } from '../lib/properties'
import type { PropertyFormData } from '../types'
import { PROPERTY_TYPES, AMENITIES } from '../types'
import { 
  Upload, 
  X, 
  MapPin, 
  Euro, 
  Home, 
  FileText, 
  Camera,
  Plus,
  Trash2,
  ArrowLeft,
  Check
} from 'lucide-react'
import { toast } from 'sonner'

export default function PostProperty() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    property_type: 'apartment',
    location: {
      address: '',
      city: '',
      coordinates: {
        lat: 0,
        lng: 0
      }
    },
    price: 0,
    amenities: [],
    images: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof PropertyFormData] as any,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...(prev.amenities || []), amenity]
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 10) {
      toast.error('Možete dodati maksimalno 10 slika')
      return
    }

    const newImages = [...images, ...files]
    setImages(newImages)

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Naslov je obavezan'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Opis je obavezan'
    }
    if (!formData.location.address.trim()) {
      newErrors['location.address'] = 'Adresa je obavezna'
    }
    if (!formData.location.city.trim()) {
      newErrors['location.city'] = 'Grad je obavezan'
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Cena mora biti veća od 0'
    }
    if (images.length === 0) {
      newErrors.images = 'Dodajte najmanje jednu sliku'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Molimo popunite sva obavezna polja')
      return
    }

    if (!user?.id) {
      toast.error('Morate biti ulogovani da biste objavili nekretninu')
      return
    }

    setLoading(true)
    
    try {
      // Create property
      const { data: property, error: propertyError } = await PropertyService.createProperty(
        user.id,
        formData
      )

      if (propertyError || !property) {
        throw new Error(propertyError?.message || 'Greška pri kreiranju nekretnine')
      }

      // Upload images
      if (images.length > 0) {
        const { error: imageError } = await PropertyService.uploadPropertyImages(
          property.id,
          images
        )

        if (imageError) {
          console.warn('Greška pri upload-u slika:', imageError)
          toast.warning('Nekretnina je kreirana, ali slike nisu upload-ovane')
        }
      }

      toast.success('Nekretnina je uspešno objavljena!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error creating property:', error)
      toast.error('Greška pri objavljivanju nekretnine')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Nazad na dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Objavi nekretninu
          </h1>
          <p className="text-gray-600 mt-2">
            Popunite informacije o vašoj nekretnini za izdavanje
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Osnovne informacije</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naslov oglasa *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="npr. Moderan dvosoban stan u centru grada"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tip nekretnine *
                </label>
                <select
                  value={formData.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(PROPERTY_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesečna cena (EUR) *
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="500"
                    min="0"
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Opišite vašu nekretninu - lokaciju, stanje, posebne karakteristike..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Lokacija</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresa *
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange('location.address', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['location.address'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Knez Mihailova 15"
                />
                {errors['location.address'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['location.address']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grad *
                </label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => handleInputChange('location.city', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['location.city'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Beograd"
                />
                {errors['location.city'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['location.city']}</p>
                )}
              </div>


            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Check className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Pogodnosti</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(AMENITIES).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.amenities?.includes(key) || false}
                    onChange={() => handleAmenityToggle(key)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Camera className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Slike *</h2>
            </div>

            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Dodajte slike nekretnine
                  </p>
                  <p className="text-gray-600">
                    Kliknite ovde ili prevucite slike (maksimalno 10)
                  </p>
                </label>
              </div>

              {errors.images && (
                <p className="text-red-500 text-sm">{errors.images}</p>
              )}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Objavljivanje...</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>Objavi nekretninu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}