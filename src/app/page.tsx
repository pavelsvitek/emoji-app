'use client';

import { Button } from '@/components/ui/button';
import { InputSmart } from '@/components/ui/input-smart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { onCtrlEnter, useMacWinKeyboardShortcut } from '@/lib/keyboard';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Emoji data structure
interface Emoji {
  emoji: string;
  description: string;
  category: string;
  aliases?: string[];
}

// Categories with their display names and icons
const categories = [
  { id: 'all', name: 'All', icon: '🌟' },
  { id: 'smileys', name: 'Smileys & Emotion', icon: '😀' },
  { id: 'people', name: 'People & Body', icon: '👋' },
  { id: 'animals', name: 'Animals & Nature', icon: '🐶' },
  { id: 'food', name: 'Food & Drink', icon: '🍔' },
  { id: 'travel', name: 'Travel & Places', icon: '✈️' },
  { id: 'activities', name: 'Activities', icon: '⚽' },
  { id: 'objects', name: 'Objects', icon: '💡' },
  { id: 'symbols', name: 'Symbols', icon: '❤️' },
  { id: 'flags', name: 'Flags', icon: '🏁' },
];

// Sample emoji data remains the same as before...
const emojiData: Emoji[] = [
  { emoji: '😀', description: 'Grinning Face', category: 'smileys', aliases: ['grinning', 'smile'] },
  { emoji: '😃', description: 'Grinning Face with Big Eyes', category: 'smileys', aliases: ['smiley'] },
  { emoji: '😄', description: 'Grinning Face with Smiling Eyes', category: 'smileys', aliases: ['smile', 'laugh'] },
  { emoji: '😁', description: 'Beaming Face with Smiling Eyes', category: 'smileys', aliases: ['grin'] },
  { emoji: '😆', description: 'Grinning Squinting Face', category: 'smileys', aliases: ['laughing', 'satisfied'] },
  { emoji: '😅', description: 'Grinning Face with Sweat', category: 'smileys', aliases: ['sweat_smile'] },
  { emoji: '🙂', description: 'Slightly Smiling Face', category: 'smileys', aliases: ['slightly_smiling_face'] },
  { emoji: '🙃', description: 'Upside-Down Face', category: 'smileys', aliases: ['upside_down_face', 'upside_down', 'upside', 'silly'] },
  { emoji: '😉', description: 'Winking Face', category: 'smileys', aliases: ['wink'] },
  { emoji: '😊', description: 'Smiling Face with Smiling Eyes', category: 'smileys', aliases: ['blush'] },
  { emoji: '😇', description: 'Smiling Face with Halo', category: 'smileys', aliases: ['angel'] },

  { emoji: '🧠', description: 'Brain', category: 'smileys', aliases: ['brain'] },
  { emoji: '🐒', description: 'Monkey', category: 'smileys', aliases: ['monkey'] },
  { emoji: '🙈', description: 'See No Evil', category: 'smileys', aliases: ['see_no_evil'] },
  { emoji: '🙉', description: 'Hear No Evil', category: 'smileys', aliases: ['hear_no_evil'] },
  { emoji: '🙊', description: 'Speak No Evil', category: 'smileys', aliases: ['speak_no_evil'] },
  { emoji: '😂', description: 'Face with Tears of Joy', category: 'smileys', aliases: ['joy', 'laugh'] },
  { emoji: '😭', description: 'Loudly Crying Face', category: 'smileys', aliases: ['sob', 'cry'] },
  { emoji: '🤣', description: 'Rolling on the Floor Laughing', category: 'smileys', aliases: ['rofl'] },
  { emoji: '😍', description: 'Smiling Face with Heart-Eyes', category: 'smileys', aliases: ['heart_eyes'] },
  { emoji: '🥳', description: 'Partying Face', category: 'smileys', aliases: ['party'] },
  { emoji: '😎', description: 'Smiling Face with Sunglasses', category: 'smileys', aliases: ['sunglasses'] },
  { emoji: '💀', description: 'Skull', category: 'smileys', aliases: ['skull'] },
  { emoji: '🔥', description: 'Fire', category: 'smileys', aliases: ['flame', 'hot'] },

  { emoji: '👋', description: 'Waving Hand', category: 'people', aliases: ['wave'] },
  { emoji: '🤚', description: 'Raised Back of Hand', category: 'people', aliases: ['raised_back_of_hand'] },
  { emoji: '✋', description: 'Raised Hand', category: 'people', aliases: ['raised_hand'] },
  { emoji: '👌', description: 'OK Hand', category: 'people', aliases: ['ok_hand'] },
  { emoji: '👍', description: 'Thumbs Up', category: 'people', aliases: ['thumbsup', '+1'] },
  { emoji: '👎', description: 'Thumbs Down', category: 'people', aliases: ['thumbsdown', '-1'] },
  { emoji: '👏', description: 'Clap', category: 'people', aliases: ['clap'] },
  { emoji: '🙌', description: 'Raising Hand', category: 'people', aliases: ['raising_hand'] },
  { emoji: '🙏', description: 'Folded Hands', category: 'people', aliases: ['pray', 'thanks'] },
  { emoji: '✌️', description: 'Victory Hand', category: 'people', aliases: ['v', 'peace'] },
  { emoji: '💪', description: 'Flexed Biceps', category: 'people', aliases: ['muscle'] },
  { emoji: '👀', description: 'Eyes', category: 'people', aliases: ['eyes'] },

  { emoji: '🐶', description: 'Dog Face', category: 'animals', aliases: ['dog', 'benji'] },
  { emoji: '🐱', description: 'Cat Face', category: 'animals', aliases: ['cat'] },
  { emoji: '🐭', description: 'Mouse Face', category: 'animals', aliases: ['mouse'] },
  { emoji: '🐹', description: 'Hamster Face', category: 'animals', aliases: ['hamster'] },
  { emoji: '🐰', description: 'Rabbit Face', category: 'animals', aliases: ['rabbit'] },
  { emoji: '🐾', description: 'Paws', category: 'animals', aliases: ['paws'] },
  { emoji: '🦁', description: 'Lion', category: 'animals', aliases: ['lion'] },
  { emoji: '🐼', description: 'Panda', category: 'animals', aliases: ['panda'] },
  { emoji: '🐧', description: 'Penguin', category: 'animals', aliases: ['penguin'] },
  { emoji: '🦋', description: 'Butterfly', category: 'animals', aliases: ['butterfly'] },
  { emoji: '🌳', description: 'Deciduous Tree', category: 'animals', aliases: ['tree'] },
  { emoji: '⭐', description: 'Star', category: 'animals', aliases: ['star'] },

  { emoji: '🍎', description: 'Red Apple', category: 'food', aliases: ['apple'] },
  { emoji: '🍐', description: 'Pear', category: 'food', aliases: ['pear'] },
  { emoji: '🍊', description: 'Tangerine', category: 'food', aliases: ['tangerine', 'orange'] },
  { emoji: '🍋', description: 'Lemon', category: 'food', aliases: ['lemon'] },
  { emoji: '🍌', description: 'Banana', category: 'food', aliases: ['banana'] },
  { emoji: '☕', description: 'Coffee', category: 'food', aliases: ['coffee'] },
  { emoji: '🍵', description: 'Tea', category: 'food', aliases: ['tea'] },
  { emoji: '🫐', description: 'Blueberries', category: 'food', aliases: ['blueberries', 'berry'] },
  { emoji: '🍕', description: 'Pizza', category: 'food', aliases: ['pizza'] },
  { emoji: '🍔', description: 'Hamburger', category: 'food', aliases: ['burger', 'hamburger'] },
  { emoji: '🌮', description: 'Taco', category: 'food', aliases: ['taco'] },
  { emoji: '🍣', description: 'Sushi', category: 'food', aliases: ['sushi'] },
  { emoji: '🍜', description: 'Steaming Bowl', category: 'food', aliases: ['ramen', 'noodles'] },
  { emoji: '🧀', description: 'Cheese Wedge', category: 'food', aliases: ['cheese'] },

  { emoji: '🚗', description: 'Automobile', category: 'travel', aliases: ['car', 'red_car'] },
  { emoji: '🚕', description: 'Taxi', category: 'travel', aliases: ['taxi'] },
  { emoji: '🚙', description: 'Sport Utility Vehicle', category: 'travel', aliases: ['blue_car'] },
  { emoji: '🚌', description: 'Bus', category: 'travel', aliases: ['bus'] },
  { emoji: '✈️', description: 'Airplane', category: 'travel', aliases: ['airplane'] },
  { emoji: '🚲', description: 'Bicycle', category: 'travel', aliases: ['bike', 'bicycle'] },
  { emoji: '🛫', description: 'Airplane Departure', category: 'travel', aliases: ['flight', 'departure'] },
  { emoji: '🏠', description: 'House', category: 'travel', aliases: ['home', 'house'] },
  { emoji: '🗺️', description: 'World Map', category: 'travel', aliases: ['map'] },

  { emoji: '⚽', description: 'Soccer Ball', category: 'activities', aliases: ['soccer'] },
  { emoji: '🏀', description: 'Basketball', category: 'activities', aliases: ['basketball'] },
  { emoji: '🏈', description: 'American Football', category: 'activities', aliases: ['football'] },
  { emoji: '⚾', description: 'Baseball', category: 'activities', aliases: ['baseball'] },
  { emoji: '🎾', description: 'Tennis', category: 'activities', aliases: ['tennis'] },
  { emoji: '🎮', description: 'Video Game', category: 'activities', aliases: ['gaming', 'controller'] },
  { emoji: '🎵', description: 'Musical Note', category: 'activities', aliases: ['music', 'note'] },
  { emoji: '🎨', description: 'Artist Palette', category: 'activities', aliases: ['art'] },

  { emoji: '💡', description: 'Light Bulb', category: 'objects', aliases: ['bulb'] },
  { emoji: '📱', description: 'Mobile Phone', category: 'objects', aliases: ['iphone'] },
  { emoji: '💻', description: 'Laptop Computer', category: 'objects', aliases: ['computer'] },
  { emoji: '⌚', description: 'Watch', category: 'objects', aliases: ['watch'] },
  { emoji: '📷', description: 'Camera', category: 'objects', aliases: ['camera'] },
  { emoji: '✉️', description: 'Envelope', category: 'objects', aliases: ['email', 'mail'] },
  { emoji: '🔑', description: 'Key', category: 'objects', aliases: ['key'] },
  { emoji: '🔒', description: 'Locked', category: 'objects', aliases: ['lock'] },
  { emoji: '🎁', description: 'Wrapped Gift', category: 'objects', aliases: ['gift'] },
  { emoji: '📚', description: 'Books', category: 'objects', aliases: ['books'] },

  { emoji: '❤️', description: 'Red Heart', category: 'symbols', aliases: ['heart'] },
  { emoji: '💔', description: 'Broken Heart', category: 'symbols', aliases: ['broken_heart'] },
  { emoji: '💯', description: 'Hundred Points', category: 'symbols', aliases: ['100'] },
  { emoji: '✅', description: 'Check Mark Button', category: 'symbols', aliases: ['white_check_mark'] },
  { emoji: '❌', description: 'Cross Mark', category: 'symbols', aliases: ['x'] },
  { emoji: '✨', description: 'Sparkles', category: 'symbols', aliases: ['sparkles'] },
  { emoji: '❓', description: 'Question Mark', category: 'symbols', aliases: ['question'] },
  { emoji: '❗', description: 'Exclamation Mark', category: 'symbols', aliases: ['exclamation'] },
  { emoji: '⚠️', description: 'Warning', category: 'symbols', aliases: ['warning'] },

  { emoji: '🏁', description: 'Chequered Flag', category: 'flags', aliases: ['checkered_flag'] },
  { emoji: '🚩', description: 'Triangular Flag', category: 'flags', aliases: ['triangular_flag_on_post'] },
  { emoji: '🎌', description: 'Crossed Flags', category: 'flags', aliases: ['crossed_flags'] },
  { emoji: '🏴', description: 'Black Flag', category: 'flags', aliases: ['black_flag'] },
  { emoji: '🏳️', description: 'White Flag', category: 'flags', aliases: ['white_flag'] },
  { emoji: '🇺🇸', description: 'Flag: United States', category: 'flags', aliases: ['us', 'usa', 'america'] },
  { emoji: '🇬🇧', description: 'Flag: United Kingdom', category: 'flags', aliases: ['uk', 'britain', 'gb'] },
  { emoji: '🇨🇦', description: 'Flag: Canada', category: 'flags', aliases: ['canada'] },
  { emoji: '🇩🇪', description: 'Flag: Germany', category: 'flags', aliases: ['germany'] },
  { emoji: '🇫🇷', description: 'Flag: France', category: 'flags', aliases: ['france'] },
  { emoji: '🇯🇵', description: 'Flag: Japan', category: 'flags', aliases: ['japan'] },
  { emoji: '🇧🇷', description: 'Flag: Brazil', category: 'flags', aliases: ['brazil'] },
  { emoji: '🇦🇺', description: 'Flag: Australia', category: 'flags', aliases: ['australia'] },
  { emoji: '🇸🇰', description: 'Flag: Slovakia', category: 'flags', aliases: ['slovakia', 'slovak', 'sk'] },
  { emoji: '🇨🇭', description: 'Flag: Switzerland', category: 'flags', aliases: ['switzerland', 'swiss', 'ch'] },
];

// Calculate items per row based on viewport width
const useItemsPerRow = () => {
  const [itemsPerRow, setItemsPerRow] = useState(8);

  useEffect(() => {
    const updateItemsPerRow = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerRow(4); // mobile
      else if (width < 768) setItemsPerRow(6); // tablet
      else if (width < 1024) setItemsPerRow(8); // laptop
      else setItemsPerRow(10); // desktop
    };

    updateItemsPerRow();
    window.addEventListener('resize', updateItemsPerRow);
    return () => window.removeEventListener('resize', updateItemsPerRow);
  }, []);

  return itemsPerRow;
};

export default function EmojiBrowser() {
  // const [searchQuery, setSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useQueryState('q', parseAsString.withDefault(''));
  const debouncedSearchQuery = useDebounce(searchQuery, 150);
  const [activeCategory, setActiveCategory] = useState('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemsPerRow = useItemsPerRow();
  const searchKeyboardHint = useMacWinKeyboardShortcut('+K');
  const copyFirstKeyboardHint = useMacWinKeyboardShortcut('+Enter');

  const filteredEmojis = useMemo(() => {
    let filtered = emojiData;

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = emojiData.filter(
        (emoji) =>
          emoji.description.toLowerCase().includes(query) ||
          emoji.emoji.includes(query) ||
          emoji.aliases?.some((alias) => alias.toLowerCase().includes(query)),
      );
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter((emoji) => emoji.category === activeCategory);
    }

    return filtered;
  }, [debouncedSearchQuery, activeCategory]);

  // Focus search input on load and when CMD/CTRL+K is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredEmojis]);

  // Group emojis into rows for virtualization
  const rows = useMemo(() => {
    const rowCount = Math.ceil(filteredEmojis.length / itemsPerRow);
    return Array.from({ length: rowCount }, (_, i) => filteredEmojis.slice(i * itemsPerRow, (i + 1) * itemsPerRow));
  }, [filteredEmojis, itemsPerRow]);

  const copyToClipboard = useCallback((emoji: string) => {
    navigator.clipboard.writeText(emoji);
    toast(`Copied ${emoji} to clipboard!`);
  }, []);

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // Reduced row height
    overscan: 5,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-5" />
        <InputSmart
          ref={searchInputRef}
          delay={150}
          type="text"
          placeholder={`Search emojis by name or keyword..`}
          className="pl-10"
          value={searchQuery}
          onKeyDown={onCtrlEnter(() => {
            if (filteredEmojis.length > 0) {
              copyToClipboard(filteredEmojis[0].emoji);
            }
          })}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setSearchQuery('')}
          >
            ×
          </Button>
        )}
      </div>
      <div className="ml-1  mt-0.5 text-xs text-muted-foreground">
        {!searchQuery && `Press ${searchKeyboardHint} to search`}
        {searchQuery && `Press ${copyFirstKeyboardHint} to copy first emoji`}
      </div>

      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="mt-4">
        <TabsList className="mb-4 hidden lg:flex">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="cursor-pointer">
              <span className="mr-2">{category.icon}</span>
              <span>{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div ref={parentRef}>
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => (
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex gap-2"
              >
                {rows[virtualRow.index].map((emoji) => (
                  <Button
                    key={emoji.emoji}
                    variant="ghost"
                    className="flex-1 text-2xl hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    onClick={() => copyToClipboard(emoji.emoji)}
                  >
                    {emoji.emoji}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Tabs>

      {filteredEmojis.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl mb-2">No emojis found</p>
          <p className="text-muted-foreground">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
