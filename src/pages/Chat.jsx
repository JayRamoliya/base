
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@/api/entities';
import { Company } from '@/api/entities';
import { Conversation } from '@/api/entities';
import { Message } from '@/api/entities';
import { ChatPresence } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Plus, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Info,
  Archive,
  Pin,
  VolumeX,
  Check,
  CheckCheck,
  Reply,
  Star,
  Trash2,
  Edit3,
  Users,
  MessageSquare,
  Image as ImageIcon,
  File,
  Mic,
  X
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { format, isToday, isYesterday } from 'date-fns';
import { useToast } from '@/components/ui/toast';
import { apiThrottler } from "@/components/utils/apiThrottle";

// Simplified Conversation list component
const ConversationList = ({ conversations, selectedConversation, onSelectConversation, currentUser, teamMembers, onNewChat }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNewChat(null)} // Placeholder for general new chat, though direct is main use here.
            className="text-purple-600 hover:bg-purple-50"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Show all team members */}
        <div className="space-y-1 p-2">
          {teamMembers.filter(member => member.email !== currentUser?.email).map((member) => {
            // Find existing conversation with this member
            const existingConversation = conversations.find(conv => 
              conv.type === 'direct' && 
              conv.participants.includes(member.email) && 
              conv.participants.includes(currentUser?.email)
            );
            
            const isSelected = selectedConversation?.id === existingConversation?.id;
            
            return (
              <div
                key={member.id}
                onClick={() => {
                  if (existingConversation) {
                    onSelectConversation(existingConversation);
                  } else {
                    // Create new conversation with this member
                    onNewChat(member);
                  }
                }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        {member.full_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {member.full_name || member.email}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {existingConversation ? 'Click to chat' : 'Start conversation'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Message bubble component
const MessageBubble = ({ message, isOwn, sender, onReply, onStar, onDelete }) => {
  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const getReadStatus = () => {
    if (!isOwn) return null;
    
    const readCount = message.read_by?.length || 0;
    if (readCount === 0) {
      return <Check className="w-4 h-4 text-gray-400" />;
    } else if (readCount > 0) {
      return <CheckCheck className="w-4 h-4 text-purple-600" />;
    }
    return <CheckCheck className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className={`flex items-end gap-2 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
            {sender?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <span className="text-xs text-gray-500 mb-1 ml-3">{sender?.full_name}</span>
        )}
        
        <div className="group relative">
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-900'
            } break-words`}
          >
            {message.reply_to && (
              <div className="border-l-2 border-purple-400 pl-2 mb-2 opacity-70">
                <p className="text-xs">Reply to message</p>
              </div>
            )}
            
            {message.message_type === 'text' ? (
              <p className="text-sm">{message.content}</p>
            ) : (
              <div className="flex items-center gap-2">
                <File className="w-4 h-4" />
                <span className="text-sm">{message.file_name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-gray-500">{formatTime(message.created_date)}</span>
            {getReadStatus()}
            {message.is_edited && (
              <span className="text-xs text-gray-400">edited</span>
            )}
          </div>
          
          {/* Message actions */}
          <div className="absolute top-0 right-0 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => onReply(message)}
              >
                <Reply className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6"
                onClick={() => onStar(message)}
              >
                <Star className="w-3 h-3" />
              </Button>
              {isOwn && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-red-500"
                  onClick={() => onDelete(message)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Message composer component
const MessageComposer = ({ onSendMessage, onFileUpload, disabled }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    
    onSendMessage({
      content: message.trim(),
      message_type: 'text'
    });
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      onSendMessage({
        content: `Sent a file: ${file.name}`,
        message_type: 'file',
        file_url,
        file_name: file.name,
        file_size: file.size
      });
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end gap-3">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="text-gray-500 hover:text-purple-600"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="min-h-[44px] max-h-32 resize-none pr-12 border border-gray-200 rounded-2xl"
            disabled={disabled}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 w-8 h-8 text-gray-500 hover:text-purple-600"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isUploading}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-11 h-11"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

// Main chat window component (simplified)
const ChatWindow = ({ conversation, messages, currentUser, teamMembers, onSendMessage, onDeleteMessage }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-500">Choose a team member from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.type === 'direct' 
    ? teamMembers.find(m => m.email === conversation.participants.find(p => p !== currentUser?.email))
    : null;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Simplified Chat header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-purple-100 text-purple-600">
                {conversation.type === 'group' 
                  ? conversation.name?.[0] || 'G'
                  : otherParticipant?.full_name?.[0] || 'U'
                }
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {conversation.type === 'group' ? conversation.name : otherParticipant?.full_name}
              </h3>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500"
            >
              <Info className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const sender = teamMembers.find(m => m.email === message.sender_email);
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_email === currentUser?.email}
                  sender={sender}
                  onReply={() => {}}
                  onStar={() => {}}
                  onDelete={onDeleteMessage}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message composer */}
      <MessageComposer
        onSendMessage={onSendMessage}
        disabled={false}
      />
    </div>
  );
};

// Main Chat component
export default function Chat() {
  const [user, setUser] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { success, error: toastError } = useToast();

  const loadConversations = useCallback(async (companyId) => {
    try {
      const conversationsData = await apiThrottler.throttledRequest(() => 
        Conversation.filter({ company_id: companyId }, '-last_message_at')
      );
      setConversations(conversationsData);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, []);

  const markMessagesAsRead = useCallback(async (conversationId) => {
    // Simplified - no complex read tracking for now
    // The previous implementation used `messages` and `user` state, but the outline
    // implies this function is simplified or removed. Retaining a stub to avoid breaking calls.
  }, []);

  const loadMessages = useCallback(async (conversationId) => {
    try {
      const messagesData = await apiThrottler.throttledRequest(() => 
        Message.filter({ conversation_id: conversationId }, 'created_date')
      );
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, []);

  const initializeChat = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await apiThrottler.throttledRequest(() => User.me());
      setUser(userData);

      if (userData.company_id) {
        const company = await apiThrottler.throttledRequest(() => Company.get(userData.company_id));
        const members = await apiThrottler.throttledRequest(() => User.filter({ company_id: userData.company_id }));
        
        setCurrentCompany(company);
        setTeamMembers(members);
        
        await loadConversations(userData.company_id);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      toastError('Failed to load chat', 'Please refresh the page to try again.');
    } finally {
      setIsLoading(false);
    }
  }, [loadConversations, toastError]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // No auto-refresh - removed polling

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  };

  const handleSendMessage = async (messageData) => {
    if (!selectedConversation || !user || !currentCompany) return;

    try {
      const newMessage = {
        conversation_id: selectedConversation.id,
        sender_email: user.email,
        company_id: currentCompany.id,
        delivered_to: selectedConversation.participants.filter(p => p !== user.email),
        ...messageData
      };

      await apiThrottler.throttledRequest(() => Message.create(newMessage));
      await loadMessages(selectedConversation.id);
      
      // Update conversation last message time
      await apiThrottler.throttledRequest(() => 
        Conversation.update(selectedConversation.id, {
          last_message_at: new Date().toISOString()
        })
      );
      
      success('Message sent!');
    } catch (error) {
      console.error('Failed to send message:', error);
      toastError('Failed to send message', 'Please try again.');
    }
  };

  const handleCreateChat = async (teamMember) => {
    if (!currentCompany || !user) return;

    try {
      // Check if a direct conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.type === 'direct' && 
        conv.participants.includes(user.email) && 
        conv.participants.includes(teamMember.email)
      );

      if (existingConversation) {
        setSelectedConversation(existingConversation);
        success('Existing chat opened!');
        return;
      }

      // If not, create a new direct conversation
      const newConversation = {
        type: 'direct',
        participants: [user.email, teamMember.email],
        company_id: currentCompany.id,
        last_message_at: new Date().toISOString()
      };

      const conversation = await apiThrottler.throttledRequest(() => Conversation.create(newConversation));
      await loadConversations(currentCompany.id); // Reload conversations to include the new one
      setSelectedConversation(conversation);
      
      success('Chat created successfully!');
    } catch (error) {
      console.error('Failed to create chat:', error);
      toastError('Failed to create chat', 'Please try again.');
    }
  };

  const handleDeleteMessage = async (message) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await apiThrottler.throttledRequest(() => 
        Message.update(message.id, {
          is_deleted: true,
          deleted_for: 'everyone'
        })
      );
      await loadMessages(selectedConversation.id);
      success('Message deleted');
    } catch (error) {
      console.error('Failed to delete message:', error);
      toastError('Failed to delete message', 'Please try again.');
    }
  };

  if (isLoading) {
    return <Loader message="Loading chat..." />;
  }

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <MessageSquare className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Chat Not Available</h2>
          <p className="text-gray-500">You need to be part of a company to use chat features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Conversation List */}
      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        currentUser={user}
        teamMembers={teamMembers}
        onNewChat={handleCreateChat}
      />

      {/* Chat Window */}
      <ChatWindow
        conversation={selectedConversation}
        messages={messages}
        currentUser={user}
        teamMembers={teamMembers}
        onSendMessage={handleSendMessage}
        onDeleteMessage={handleDeleteMessage}
      />
    </div>
  );
}
