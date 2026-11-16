import { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Compass,
  Flag,
  Flame,
  Heart,
  Landmark,
  Mic,
  Moon,
  Sparkles,
  Users,
  Utensils,
} from 'lucide-react';

export const AVAILABLE_CATEGORY_ICONS = [
  { id: 'mic', label: 'Majlis / Speaker' },
  { id: 'flag', label: 'Juloos / Banner' },
  { id: 'compass', label: 'Namaz / Qibla' },
  { id: 'book', label: 'Amaal / Quran' },
  { id: 'moon', label: 'Shabbedari / Sehri / Night' },
  { id: 'utensils', label: 'Iftar / Niyaz' },
  { id: 'heart', label: 'Intaqal / Charity' },
  { id: 'landmark', label: 'Imambargah / Mosque' },
  { id: 'users', label: 'Youth / Community' },
  { id: 'flame', label: 'Ashura / Vigil' },
  { id: 'sparkles', label: 'Eid / Celebration' },
  { id: 'calendar', label: 'General Gathering' },
];

export function CategoryIcon({
  iconName,
  className = 'w-4 h-4',
}: {
  iconName: string;
  className?: string;
}) {
  switch (iconName) {
    case 'mic':
      return <Mic className={className} />;
    case 'flag':
      return <Flag className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'book':
      return <BookOpen className={className} />;
    case 'moon':
      return <Moon className={className} />;
    case 'utensils':
      return <Utensils className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'landmark':
      return <Landmark className={className} />;
    case 'users':
      return <Users className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    default:
      return <Calendar className={className} />;
  }
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#064E3B] via-[#0F172A] to-[#064E3B] islamic-lattice-bg flex flex-col items-center justify-center p-4 text-center">
        <Landmark className="w-7 h-7 text-[#C59B38] mb-1.5" />
        {fallbackTitle && (
          <span className="text-xs font-medium text-white/90 line-clamp-2 max-w-[200px]">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
