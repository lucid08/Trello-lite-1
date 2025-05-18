'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ClockIcon, PlusIcon, PencilIcon, TrashIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

const ActivityLog = ({ boardId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getIcon = (type) => {
    const iconClass = 'h-5 w-5 mr-2';
    switch(type) {
      case 'CREATE':
        return <PlusIcon className={`${iconClass} text-green-500`} />;
      case 'UPDATE':
        return <PencilIcon className={`${iconClass} text-blue-500`} />;
      case 'DELETE':
        return <TrashIcon className={`${iconClass} text-red-500`} />;
      case 'MOVE':
        return <ArrowsUpDownIcon className={`${iconClass} text-purple-500`} />;
      default:
        return <ClockIcon className={`${iconClass} text-gray-500`} />;
    }
  };

  const fetchActivities = async () => {
    try {
        console.log(boardId);
        
      const res = await fetch(`http://localhost:5000/api/activities/boards/${boardId}`,  {
          credentials: 'include'
        });
      if (!res.ok) throw new Error('Failed to fetch activities');
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) fetchActivities();
  }, [boardId]);

 if (loading) return (
    <div className="p-4 flex items-center justify-center gap-2 text-gray-500">
      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      Loading activities...
    </div>
  );

  if (error) return (
    <div className="p-4 flex items-center gap-2 bg-red-50 text-red-600 rounded-lg mx-4">
      <TrashIcon className="w-5 h-5" />
      Error: {error}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Activity Log</h2>
        <button 
          onClick={fetchActivities}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
        >
          <ArrowsUpDownIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400 gap-2">
            <ClockIcon className="w-8 h-8" />
            <span className="text-sm">No activities yet</span>
          </div>
        ) : (
          activities.map(activity => (
            <div 
              key={activity._id} 
              className="flex items-start p-3 md:p-4 bg-gray-50/50 hover:bg-gray-100/30 rounded-lg transition-colors group"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  {getIcon(activity.type)}
                </div>
              </div>
              <div className="flex-1 ml-3 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {activity.description}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                  <span className="flex-shrink-0">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activity.task && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full max-w-[160px] truncate">
                        <span className="truncate">📋 {activity.task.title}</span>
                      </span>
                    )}
                    {activity.list && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full max-w-[160px] truncate">
                        <span className="truncate">📋 {activity.list.title}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;