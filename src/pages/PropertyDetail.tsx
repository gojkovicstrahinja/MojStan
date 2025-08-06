import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PropertyService } from '../lib/properties'
import { MessageService } from '../lib/messages'
import { useAuth } from '../hooks/useAuth'
import type { Property } from '../types'
import { 
  MapPin, 
  Euro, 
  User, 
  Phone, 
  Mail, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  Share2,
  Calendar,
  Home as HomeIcon,
  MessageCircle,
  X
} from 'lucide-react'
import { PROPERTY_TYPES } from '../types'
import { toast } from 'sonner'

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return
      
      setLoading(true)
      const { data, error } = await PropertyService.getProperty(id)
      
      if (error) {
        setError('Nekretnina nije pronađena')
      } else {
        setProperty(data)
      }
      
      setLoading(false)
    }

    loadProperty()
  }, [id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sr-RS').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS')
  }

  const nextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      )
    }
  }

  const handleContactOwner = () => {
    if (!user) {
      navigate('/login')
      return
    }
    setShowContactInfo(true)
  }

  const handleSendMessage = () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    // Pre-fill contact info if user is logged in
    setContactName(user.full_name || '')
    setContactEmail(user.email || '')
    setContactPhone(user.phone || '')
    setShowMessageModal(true)
  }

  const submitMessage = async () => {
    if (!messageContent.trim() || !contactName.trim() || !contactEmail.trim()) {
      toast.error('Molimo unesite sve obavezne informacije')
      return
    }

    if (!property || !user) return

    try {
      setSendingMessage(true)
      
      await MessageService.sendMessage(
        property.id,
        property.owner_id,
        {
          message_content: messageContent,
          contact_info: {
            name: contactName,
            email: contactEmail,
            phone: contactPhone
          }
        },
        user.id
      )
      
      toast.success('Poruka je uspešno poslata!')
      setShowMessageModal(false)
      setMessageContent('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Greška pri slanju poruke')
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-96 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Nekretnina nije pronađena'}
            </h1>
            <button
              onClick={() => navigate('/search')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Vrati se na pretragu
            </button>
          </div>
        </div>
      </div>
    )
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : [{ image_url: `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('modern apartment interior, clean and bright, real estate photo')}&image_size=landscape_16_9` }]

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Nazad</span>
        </button>

        {/* Image Gallery */}
        <div className="relative bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="relative h-96 lg:h-[500px]">
            <img
              src={images[currentImageIndex].image_url}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('modern apartment interior, clean and bright, real estate photo')}&image_size=landscape_16_9`
              }}
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all">
                <Heart className="h-5 w-5 text-gray-600" />
              </button>
              <button className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md transition-all">
                <Share2 className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex space-x-2 p-4 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`${property.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>
                      {property.location.address}, {property.location.city}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-blue-600 font-bold text-2xl">
                      <Euro className="h-6 w-6 mr-1" />
                      <span>{formatPrice(property.price)}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {PROPERTY_TYPES[property.property_type as keyof typeof PROPERTY_TYPES]}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Opis</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pogodnosti</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informacije o nekretnini</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <HomeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Tip nekretnine</span>
                    <p className="font-medium">
                      {PROPERTY_TYPES[property.property_type as keyof typeof PROPERTY_TYPES]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Objavljeno</span>
                    <p className="font-medium">{formatDate(property.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Owner Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontakt</h3>
              
              {property.owner && (
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{property.owner.full_name}</p>
                    <p className="text-sm text-gray-500">Vlasnik</p>
                  </div>
                </div>
              )}
              
              {!showContactInfo ? (
                <button
                  onClick={handleContactOwner}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                >
                  Prikaži kontakt informacije
                </button>
              ) : (
                <div className="space-y-3">
                  {property.owner?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{property.owner.phone}</span>
                    </div>
                  )}
                  {property.owner?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{property.owner.email}</span>
                    </div>
                  )}
                  <button
                    onClick={handleSendMessage}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Pošalji poruku</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Brze akcije</h3>
              <div className="space-y-3">
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition-colors">
                  Sačuvaj u omiljene
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition-colors">
                  Podeli oglas
                </button>
                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition-colors">
                  Prijavi problem
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pošaljite poruku vlasniku
                </h3>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {property && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">{property.title}</p>
                  <p className="text-sm text-gray-600">{property.location.address}, {property.location.city}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vaše ime *
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Unesite vaše ime"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email adresa *
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Unesite email adresu"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Broj telefona
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Unesite broj telefona"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poruka *
                  </label>
                  <textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Napišite vašu poruku..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Otkaži
                </button>
                <button
                  onClick={submitMessage}
                  disabled={sendingMessage || !messageContent.trim() || !contactName.trim() || !contactEmail.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-md transition-colors"
                >
                  {sendingMessage ? 'Šalje se...' : 'Pošalji poruku'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}