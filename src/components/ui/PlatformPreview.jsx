
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Repeat, Send, ThumbsUp, MoreHorizontal, X } from 'lucide-react';

const PlatformPreview = ({ platform, content, hashtags }) => {
  const renderContent = (text) => {
    return text.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 last:mb-0">{paragraph || '\u00A0'}</p>
    ));
  };

  const renderHashtags = (tags) => (
    <div className="flex flex-wrap gap-x-2 mt-2">
      {tags.map((tag, i) => <span key={i} className="text-blue-600">#{tag}</span>)}
    </div>
  );

  switch (platform) {
    case 'linkedin':
      return (
        <div className="bg-white border border-gray-200 rounded-sm p-4 font-sans text-sm text-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://i.pravatar.cc/150?u=linkedin" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900">Your Name</div>
              <div className="text-xs text-gray-500">Marketing Professional | Content Strategist</div>
            </div>
          </div>
          <div>{renderContent(content)}</div>
          {hashtags && hashtags.length > 0 && renderHashtags(hashtags)}
          <div className="border-t mt-4 pt-2 flex justify-around text-gray-600">
            <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md"><ThumbsUp className="w-5 h-5"/> Like</button>
            <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md"><MessageCircle className="w-5 h-5"/> Comment</button>
            <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md"><Repeat className="w-5 h-5"/> Repost</button>
            <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-md"><Send className="w-5 h-5"/> Send</button>
          </div>
        </div>
      );

    case 'instagram':
      return (
        <div className="bg-white border border-gray-200 rounded-none w-full max-w-md mx-auto">
          <div className="flex items-center p-3 border-b">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://i.pravatar.cc/150?u=instagram" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="font-semibold ml-3">your_username</div>
            <MoreHorizontal className="w-5 h-5 ml-auto" />
          </div>
          <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
            [Your Image/Video Here]
          </div>
          <div className="p-3">
            <div className="flex gap-4 mb-2">
              <Heart className="w-6 h-6"/>
              <MessageCircle className="w-6 h-6"/>
              <Send className="w-6 h-6"/>
            </div>
            <div className="text-sm">
              <span className="font-semibold">your_username</span> {renderContent(content)}
              {hashtags && hashtags.length > 0 && renderHashtags(hashtags)}
            </div>
          </div>
        </div>
      );
      
    case 'x':
       return (
        <div className="bg-white border border-gray-200 rounded-sm p-4 font-sans text-base text-gray-900">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="https://i.pravatar.cc/150?u=x" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="font-bold">Your Name</span>
                <span className="text-gray-500 ml-2">@yourhandle</span>
              </div>
              <div className="mt-1">{renderContent(content)}</div>
               {hashtags && hashtags.length > 0 && renderHashtags(hashtags)}
              <div className="mt-4 flex justify-between text-gray-500 max-w-sm">
                <button className="flex items-center gap-1 hover:text-blue-500"><MessageCircle className="w-5 h-5"/> 12</button>
                <button className="flex items-center gap-1 hover:text-green-500"><Repeat className="w-5 h-5"/> 34</button>
                <button className="flex items-center gap-1 hover:text-pink-500"><Heart className="w-5 h-5"/> 567</button>
                <button className="hover:text-blue-500"><Send className="w-5 h-5"/></button>
              </div>
            </div>
          </div>
        </div>
      );

    default: // Facebook & TikTok (generic)
      return (
         <div className="bg-white border border-gray-200 rounded-sm p-4 font-sans text-base text-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://i.pravatar.cc/150?u=default" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900">Your Name</div>
              <div className="text-xs text-gray-500">Just now · Public</div>
            </div>
          </div>
          <div>{renderContent(content)}</div>
          {hashtags && hashtags.length > 0 && renderHashtags(hashtags)}
        </div>
      );
  }
};

export default PlatformPreview;
