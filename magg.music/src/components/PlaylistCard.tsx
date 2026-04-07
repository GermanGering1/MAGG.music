// components/PlaylistCard.tsx
import { Link } from 'react-router-dom';
import type { Playlist } from '../types';
import { ListMusic } from 'lucide-react';

interface Props {
  playlist: Playlist;
}

export const PlaylistCard = ({ playlist }: Props) => {
  return (
    <Link
      to={`/playlist/${playlist.id}`}
      className="group bg-white rounded-2xl border border-[#D9D9D9]/30 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-[#7443FF]/20"
    >
      <div className="aspect-square bg-gradient-to-br from-[#7443FF]/5 to-[#7443FF]/10 relative overflow-hidden">
        {playlist.cover_url ? (
          <img
            src={playlist.cover_url}
            alt={playlist.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ListMusic className="h-12 w-12 text-[#7443FF]/40" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-[#000000] truncate group-hover:text-[#7443FF] transition-colors">
          {playlist.title}
        </h3>
        <p className="text-xs text-[#000000]/50 mt-1">
          {playlist.user_id ? 'Пользовательский плейлист' : 'Плейлист'}
        </p>
      </div>
    </Link>
  );
};