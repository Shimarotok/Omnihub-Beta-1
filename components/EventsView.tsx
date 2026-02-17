
import React, { useState } from 'react';
import { useStore } from './StoreContext';
import { Calendar, Clock, ArrowUpDown, MapPin, Trash2 } from 'lucide-react';

const EventsView: React.FC = () => {
  const { state, deleteEvent } = useStore();
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const upcomingEvents = state.events.filter(e => new Date(e.start).getTime() >= new Date().setHours(0,0,0,0));

  const sortedEvents = [...upcomingEvents].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.start).getTime();
      const dateB = new Date(b.start).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
    }
  });

  const toggleSort = (type: 'date' | 'title') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
          <p className="text-sm text-gray-500">{upcomingEvents.length} events found</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => toggleSort('date')}
            className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${sortBy === 'date' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-100 text-gray-400'}`}
          >
            <Clock className="w-4 h-4" />
            Date
          </button>
          <button 
            onClick={() => toggleSort('title')}
            className={`p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${sortBy === 'title' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-100 text-gray-400'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
            A-Z
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {sortedEvents.length > 0 ? sortedEvents.map(event => (
          <div key={event.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative group overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500" />
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-gray-900">{event.title}</h4>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    {formatDate(event.start)}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span className="w-3.5" /> 
                    to {formatDate(event.end)}
                  </div>
                </div>
                {event.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{event.description}</p>
                )}
                {event.location && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold bg-blue-50 w-fit px-3 py-1 rounded-full">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </div>
                )}
              </div>
              <button 
                onClick={() => deleteEvent(event.id)}
                className="p-2 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )) : (
          <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p className="font-medium">Clear schedule</p>
            <p className="text-xs">No upcoming events found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsView;
