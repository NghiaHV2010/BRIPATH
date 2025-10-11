import { formatDistanceToNow } from '@/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Check } from 'lucide-react';

interface ChatBubbleProps {
    message: string;
    timestamp?: string;
    isUser: boolean;
    showDelivered?: boolean;
}

export function ChatBubble({ message, timestamp, isUser, showDelivered }: ChatBubbleProps) {
    const time = formatDistanceToNow(new Date(timestamp || ''), { addSuffix: false });

    return (
        <div className={`flex gap-2 items-end mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {!isUser && (
                <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">AI</AvatarFallback>
                </Avatar>
            )}

            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
                <div
                    className={`px-4 py-2 rounded-2xl ${isUser
                        ? 'bg-black text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                >
                    <p className="text-sm leading-relaxed">{message}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-xs text-gray-500">{time}</span>
                    {isUser && showDelivered && (
                        <Check className="w-3 h-3 text-gray-500" />
                    )}
                </div>
            </div>

        </div>
    );
}
