// User types
export interface User {
  id: string
  email: string
  full_name: string
  user_type: 'owner' | 'tenant'
  phone?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  user_type: 'owner' | 'tenant'
  phone?: string
}

// Property types
export interface Property {
  id: string
  owner_id: string
  title: string
  description: string
  property_type: string
  location: PropertyLocation
  price: number
  amenities: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  images?: PropertyImage[]
  owner?: UserProfile
}

export interface PropertyLocation {
  address: string
  city: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  alt_text?: string
  sort_order: number
  created_at: string
}

// Message types
export interface Message {
  id: string
  property_id: string
  sender_id: string
  recipient_id: string
  message_content: string
  contact_info?: ContactInfo
  is_read: boolean
  created_at: string
  property?: Property
  sender?: UserProfile
  recipient?: UserProfile
}

export interface ContactInfo {
  name: string
  email: string
  phone?: string
}

// Favorite types
export interface Favorite {
  id: string
  user_id: string
  property_id: string
  created_at: string
  property?: Property
}

// Search and filter types
export interface PropertySearchParams {
  location?: string
  property_type?: string
  min_price?: number
  max_price?: number
  amenities?: string[]
  page?: number
  limit?: number
}

export interface PropertySearchResult {
  properties: Property[]
  total_count: number
  page: number
  total_pages: number
}

// Form types
export interface PropertyFormData {
  title: string
  description: string
  property_type: string
  location: PropertyLocation
  price: number
  amenities: string[]
  images: File[]
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  full_name: string
  user_type: 'owner' | 'tenant'
  phone?: string
}

export interface MessageFormData {
  message_content: string
  contact_info: ContactInfo
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Property types enum
export const PROPERTY_TYPES = {
  apartment: 'Apartman',
  house: 'Kuća',
  studio: 'Studio',
  room: 'Soba',
  office: 'Kancelarija'
} as const

export type PropertyType = keyof typeof PROPERTY_TYPES

// Amenities enum
export const AMENITIES = {
  wifi: 'WiFi',
  parking: 'Parking',
  elevator: 'Lift',
  air_conditioning: 'Klima',
  heating: 'Grejanje',
  garden: 'Bašta',
  balcony: 'Balkon',
  furnished: 'Namešteno',
  pets_allowed: 'Dozvoljeni ljubimci',
  smoking_allowed: 'Dozvoljeno pušenje'
} as const

export type Amenity = keyof typeof AMENITIES

// Serbian cities
export const SERBIAN_CITIES = [
  'Beograd',
  'Novi Sad',
  'Niš',
  'Kragujevac',
  'Subotica',
  'Pančevo',
  'Čačak',
  'Novi Pazar',
  'Zrenjanin',
  'Leskovac'
] as const

export type SerbianCity = typeof SERBIAN_CITIES[number]