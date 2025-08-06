import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { MessageService } from '../lib/messages'
import type { Message } from '../types'
import { 
  MessageCircle, 
  Send, 
  ArrowLeft, 
  User, 
  Clock,
  CheckCheck,
  Search,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

interface ConversationGroup {
  propertyId: string
  propertyTitle: string
  otherParticipant: {
    id: string
    name: string
    userType: string
  }
  lastMessage: Message
  unreadCount: number
  messages: Message[]
}

export default function Messages() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ConversationGroup[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUnread, setFilterUnread] = useState(false)

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const messages = await MessageService.getConversations(user!.id)
      
      // Group messages by property and other participant
      const conversationMap = new Map<string, ConversationGroup>()
      
      messages.forEach(message => {
        const otherParticipant = message.sender_id === user!.id ? message.recipient : message.sender
        const key = `${message.property_id}-${otherParticipant?.id}`
        
        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            propertyId: message.property_id,
            propertyTitle: message.property?.title || 'Nepoznata nekretnina',
            otherParticipant: {
              id: otherParticipant?.id || '',
              name: otherParticipant?.full_name || 'Nepoznat korisnik',
              userType: otherParticipant?.user_type || 'tenant'
            },
            lastMessage: message,
            unreadCount: 0,
            messages: []
          })
        }
        
        const conversation = conversationMap.get(key)!
        conversation.messages.push(message)
        
        // Update last message if this one is newer
        if (new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
          conversation.lastMessage = message
        }
        
        // Count unread messages
        if (!message.is_read && message.recipient_id === user!.id) {
          conversation.unreadCount++
        }
      })
      
      // Sort conversations by last message date
      const sortedConversations = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime())
      
      setConversations(sortedConversations)
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error('Greška pri učitavanju poruka')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return
    
    try {
      setSendingMessage(true)
      
      await MessageService.sendMessage(
        selectedConversation.propertyId,
        selectedConversation.otherParticipant.id,
        {
          message_content: newMessage,
          contact_info: {
            name: user.full_name,
            email: user.email,
            phone: user.phone
          }
        },
        user.id
      )
      
      setNewMessage('')
      await loadConversations()
      toast.success('Poruka je poslata')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Greška pri slanju poruke')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleSelectConversation = async (conversation: ConversationGroup) => {
    setSelectedConversation(conversation)
    
    // Mark conversation as read
    try {
      await MessageService.markConversationAsRead(conversation.propertyId, user!.id)
      await loadConversations()
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('sr-RS', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' })
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterUnread || conv.unreadCount > 0
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 border-r border-gray-200`}>
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-900 mb-4">Poruke</h1>
                
                {/* Search and Filter */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Pretraži poruke..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    onClick={() => setFilterUnread(!filterUnread)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterUnread 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Samo nepročitane</span>
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto h-full">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nemate poruke</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={`${conversation.propertyId}-${conversation.otherParticipant.id}`}
                        onClick={() => handleSelectConversation(conversation)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedConversation?.propertyId === conversation.propertyId && 
                          selectedConversation?.otherParticipant.id === conversation.otherParticipant.id
                            ? 'bg-blue-50 border-r-2 border-blue-500'
                            : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="bg-gray-200 rounded-full p-2">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conversation.otherParticipant.name}
                              </p>
                              <div className="flex items-center space-x-1">
                                {conversation.unreadCount > 0 && (
                                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatTime(conversation.lastMessage.created_at)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.propertyTitle}
                            </p>
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {conversation.lastMessage.message_content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Message Thread */}
            <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} flex-1 flex flex-col`}>
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div className="bg-gray-200 rounded-full p-2">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="font-medium text-gray-900">
                          {selectedConversation.otherParticipant.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.propertyTitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConversation.messages
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user!.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user!.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.message_content}</p>
                            <div className={`flex items-center justify-end space-x-1 mt-1 ${
                              message.sender_id === user!.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <Clock className="h-3 w-3" />
                              <span className="text-xs">
                                {formatTime(message.created_at)}
                              </span>
                              {message.sender_id === user!.id && (
                                <CheckCheck className={`h-3 w-3 ${
                                  message.is_read ? 'text-blue-200' : 'text-blue-300'
                                }`} />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Napišite poruku..."
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={sendingMessage}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="hidden lg:flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Izaberite razgovor da vidite poruke</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}