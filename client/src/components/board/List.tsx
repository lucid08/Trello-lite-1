'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Task from './Task';
import { useState } from 'react';
import { 
  SortableContext, 
  verticalListSortingStrategy // Add this import
} from '@dnd-kit/sortable';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function List({ list, onTaskCreated, onEdit, onDelete, onTaskEdit, onTaskDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: list._id });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: newTaskTitle,
          listId: list._id
        }),
      });
      console.log(list._id, "uesss");
      
      if (!response.ok) throw new Error('Failed to create task');

      const newTask = await response.json();

      onTaskCreated(newTask);
      setNewTaskTitle('');
    } catch (err) {
      setError(err.message);
      console.log(err.message)
    } finally {
      setLoading(false);
    }
  };
  console.log('List tasks:', list.tasks.map(t => t._id));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="w-72 bg-white rounded-lg shadow-sm mr-4"
    >
      <div className="p-4 bg-gray-50 rounded-t-xl" {...listeners}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            {list.title}
          </h3>
          <div className="flex gap-2 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-200"
            >
              <PencilIcon className="w-4 h-4 " />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-gray-500 hover:text-red-600 p-1 rounded-md hover:bg-gray-200"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-2 min-h-[100px] bg-gray-50 rounded-b-lg">
        <SortableContext 
        items={list.tasks.map(task => task._id)}
        strategy={verticalListSortingStrategy}
      >
        {list.tasks.map(task => (
          <Task key={task._id} task={task}  onEdit={onTaskEdit}  // Add these
    onDelete={onTaskDelete} />
        ))}
      </SortableContext>

        <form onSubmit={handleAddTask} className="mt-2">
          <input
            type="text"
            placeholder="Add a task"
            className="w-full p-2 text-sm border rounded"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            disabled={loading}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </div>
    </div>
  );
}