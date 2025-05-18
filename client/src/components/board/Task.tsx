'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Task({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { type: 'Task', task },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onEdit(task._id, {
      title: editedTitle
    });
    setIsEditing(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="group relative mb-2 p-3 bg-white rounded shadow-sm hover:shadow-md transition-all"
      >
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-gray-800 font-medium">{task.title}</p>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task._id);
                }}
                className="text-gray-500 hover:text-red-600 p-1 rounded-md hover:bg-gray-100"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {isEditing && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Task</h2>
            <input
              type="text"
              placeholder="Task Title"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}