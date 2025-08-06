import { supabase } from './supabase'
import type { Property, PropertyFormData, PropertySearchParams, PropertySearchResult } from '../types'

export class PropertyService {
  // Get all properties with optional search/filter
  static async getProperties(params: PropertySearchParams = {}): Promise<PropertySearchResult> {
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images(*),
          users!properties_owner_id_fkey(id, full_name, email, phone)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      // Apply filters
      if (params.location) {
        query = query.or(`location->>city.ilike.%${params.location}%,location->>address.ilike.%${params.location}%`)
      }

      if (params.property_type) {
        query = query.eq('property_type', params.property_type)
      }

      if (params.min_price) {
        query = query.gte('price', params.min_price)
      }

      if (params.max_price) {
        query = query.lte('price', params.max_price)
      }

      if (params.amenities && params.amenities.length > 0) {
        query = query.contains('amenities', params.amenities)
      }

      // Pagination
      const page = params.page || 1
      const limit = params.limit || 12
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await query
        .range(from, to)

      if (error) throw error

      const properties = (data || []).map(property => ({
        ...property,
        owner: property.users,
        images: property.property_images || []
      }))

      return {
        properties,
        total_count: count || 0,
        page,
        total_pages: Math.ceil((count || 0) / limit)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
      return {
        properties: [],
        total_count: 0,
        page: 1,
        total_pages: 0
      }
    }
  }

  // Get single property by ID
  static async getProperty(id: string) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(*),
          users!properties_owner_id_fkey(id, full_name, email, phone)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error

      const property = {
        ...data,
        owner: data.users,
        images: data.property_images || []
      }

      return { data: property as Property, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get properties by owner
  static async getPropertiesByOwner(ownerId: string) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(*)
        `)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const properties = (data || []).map(property => ({
        ...property,
        images: property.property_images || []
      }))

      return { data: properties as Property[], error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  }

  // Create new property
  static async createProperty(ownerId: string, propertyData: PropertyFormData) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          owner_id: ownerId,
          title: propertyData.title,
          description: propertyData.description,
          property_type: propertyData.property_type,
          location: propertyData.location,
          price: propertyData.price,
          amenities: propertyData.amenities,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      return { data: data as Property, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Update property
  static async updateProperty(propertyId: string, updates: Partial<PropertyFormData>) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', propertyId)
        .select()
        .single()

      if (error) throw error

      return { data: data as Property, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Delete property (soft delete)
  static async deleteProperty(propertyId: string) {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_active: false })
        .eq('id', propertyId)

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Upload property images
  static async uploadPropertyImages(propertyId: string, images: File[]) {
    try {
      const uploadPromises = images.map(async (image, index) => {
        const fileExt = image.name.split('.').pop()
        const fileName = `${propertyId}/${Date.now()}-${index}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, image)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)

        // Save image record to database
        const { data: imageData, error: imageError } = await supabase
          .from('property_images')
          .insert({
            property_id: propertyId,
            image_url: publicUrl,
            alt_text: `Property image ${index + 1}`,
            sort_order: index
          })
          .select()
          .single()

        if (imageError) throw imageError

        return imageData
      })

      const results = await Promise.all(uploadPromises)
      return { data: results, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  }

  // Get featured properties (latest 6)
  static async getFeaturedProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(*),
          users!properties_owner_id_fkey(id, full_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error

      const properties = (data || []).map(property => ({
        ...property,
        owner: property.users,
        images: property.property_images || []
      }))

      return { data: properties as Property[], error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  }
}