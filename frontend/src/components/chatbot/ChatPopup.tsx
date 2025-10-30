import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { MessageCircle, X, Send, MoreVertical } from 'lucide-react';
import type { ChatMessage } from '../../types/chatbot';
import { ChatBubble } from './ChatBubble';
import { getAllChatMessages, sendMessageToChatbot } from '@/api';

export function ChatPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await getAllChatMessages();
            if (response && response.success) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || sending) return;

        const messageContent = inputMessage.trim();
        setInputMessage('');
        setSending(true);

        try {
            // Add user message immediately
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: Date.now(), // temporary ID
                    message_content: messageContent,
                    created_at: new Date().toISOString()
                },
            ]);

            const response = await sendMessageToChatbot(messageContent);
            if (response) {
                await fetchMessages();
            } else {
                setInputMessage(messageContent);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setInputMessage(messageContent);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            fetchMessages();
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
                block: 'end',
                behavior: "instant",
            });
        }
    }, [messages]);


    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {isOpen && (
                <Card className="fixed bottom-24 right-6 w-96 h-[600px] max-h-[80vh] shadow-2xl border-gray-200 flex flex-col z-50">
                    <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <img src='/assets/icons/icon_chatbot1.png' className='size-full' />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Trợ lý BRIPATH</h3>
                                <p className="text-xs text-green-600">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={toggleChat}>
                                <X className="w-4 h-4 text-gray-600" />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-4 overflow-hidden" >
                        <div ref={scrollRef} className='overflow-y-auto'>
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500 text-sm">Tải hội thoại...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                    <MessageCircle className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-gray-500 text-sm">Chưa có hội thoại nào</p>
                                    <p className="text-gray-400 text-xs mt-1">Bắt đầu trò chuyện với trợ lý ảo BRIPATH</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {messages.map((msg) => (
                                        <div key={msg.id}>
                                            <ChatBubble
                                                message={msg.message_content}
                                                timestamp={msg.created_at}
                                                isUser={true}
                                                showDelivered={true}
                                            />
                                            {msg.response_content && (
                                                <ChatBubble
                                                    message={msg.response_content}
                                                    timestamp={msg.created_at}
                                                    isUser={false}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    {sending && (
                                        <div className="flex gap-2 items-end mb-4">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs shrink-0">
                                                AI
                                            </div>
                                            <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Type your message..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={sending}
                                className="flex-1 focus-visible:ring-1 focus-visible:ring-blue-500"
                            />
                            <Button
                                size="icon"
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || sending}
                                className="bg-blue-500 hover:bg-blue-600 shrink-0 text-white"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div
                onClick={toggleChat}
                className={`fixed flex justify-center items-center bottom-4 right-4 z-70 rounded-full cursor-pointer group ${isOpen ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg size-16 p-2' : 'bg-none size-24 md:size-28'}`}
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <>
                        <div className="w-full h-full flex items-center justify-center">
                            <img src='/assets/icons/icon_chatbot.png' className='w-full h-full' />
                        </div>
                        {/* Hover bubble */}
                        <div className="absolute -top-7 right-7 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg relative">
                                Bạn cần tớ hỗ trợ gì?
                                {/* Arrow pointing down */}
                                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
