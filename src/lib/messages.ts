import { supabase } from './supabase'
import type { Message, MessageFormData } from '../types'

export class MessageService {
  // Get all conversations for a user
  static async getConversations(userId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          property:properties(*),
          sender:users!messages_sender_id_fkey(*),
          recipient:users!messages_recipient_id_fkey(*)
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching conversations:', error)
      throw error
    }
  }

  // Get messages for a specific property conversation
  static async getPropertyMessages(propertyId: string, userId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          property:properties(*),
          sender:users!messages_sender_id_fkey(*),
          recipient:users!messages_recipient_id_fkey(*)
        `)
        .eq('property_id', propertyId)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching property messages:', error)
      throw error
    }
  }

  // Send a new message
  static async sendMessage(
    propertyId: string,
    recipientId: string,
    messageData: MessageFormData,
    senderId: string
  ): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          property_id: propertyId,
          sender_id: senderId,
          recipient_id: recipientId,
          message_content: messageData.message_content,
          contact_info: messageData.contact_info,
          is_read: false
        })
        .select(`
          *,
          property:properties(*),
          sender:users!messages_sender_id_fkey(*),
          recipient:users!messages_recipient_id_fkey(*)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  // Mark message as read
  static async markAsRead(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw error
    }
  }

  // Mark all messages in a conversation as read
  static async markConversationAsRead(propertyId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('property_id', propertyId)
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (error) throw error
    } catch (error) {
      console.error('Error marking conversation as read:', error)
      throw error
    }
  }

  // Get unread message count for a user
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  // Delete a message
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  }

  // Get conversation participants
  static async getConversationParticipants(propertyId: string): Promise<{ senderId: string, recipientId: string }[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('sender_id, recipient_id')
        .eq('property_id', propertyId)

      if (error) throw error
      
      // Get unique participant pairs
      const participants = new Set<string>()
      data?.forEach(msg => {
        participants.add(`${msg.sender_id}-${msg.recipient_id}`)
        participants.add(`${msg.recipient_id}-${msg.sender_id}`)
      })

      return Array.from(participants).map(pair => {
        const [senderId, recipientId] = pair.split('-')
        return { senderId, recipientId }
      })
    } catch (error) {
      console.error('Error getting conversation participants:', error)
      return []
    }
  }
}