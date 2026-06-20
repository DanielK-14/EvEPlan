import { MapPin, Trash2 } from 'lucide-react';
import type { EventDoc } from '../../types';

interface Props {
  event: EventDoc;
  onClick: () => void;
  onDelete?: () => void;
  isAdmin: boolean;
}

export default function EventCard({ event, onClick, onDelete, isAdmin }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group relative"
    >
      {isAdmin && onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-4 left-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={16} />
        </button>
      )}
      <div className="text-3xl mb-3">🎊</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{event.title}</h3>
      {event.description && (
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{event.description}</p>
      )}
      {event.location && (
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
          <MapPin size={12} />
          <span>{event.location}</span>
        </div>
      )}
    </div>
  );
}
