'use client';
import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'; 
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import List from './List';
import Task from './Task';
import CreateList from './CreateList';
import ActivityLog from './ActivityLog';
import { TrashIcon, PencilIcon } from "@heroicons/react/24/solid";

export default function Board({ boardId }) {
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [editList, setEditList] = useState(null);
  const [deleteListId, setDeleteListId] = useState(null);
  const [name, setName] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/boards/${boardId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch board');
        
        const data = await response.json();
        setBoard(data);
        setLists(data.lists);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);
const handleTaskEdit = async (taskId, updatedData) => {
  try {
    console.log(updatedData);
    
    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updatedData)
    });
    console.log(response);
    

    if (!response.ok) throw new Error('Failed to update task');
    
    const updatedTask = await response.json();
    
    setLists(prev => prev.map(list => ({
      ...list,
      tasks: list.tasks.map(task => 
        task._id === taskId ? { ...task, ...updatedTask } : task
      )
    })));
  } catch (error) {
    console.error('Task update error:', error);
    alert(error.message);
  }
};

const handleTaskDelete = async (taskId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to delete task');
    
    setLists(prev => prev.map(list => ({
      ...list,
      tasks: list.tasks.filter(task => task._id !== taskId)
    })));
  } catch (error) {
    console.error('Task delete error:', error);
    alert(error.message);
  }
};

    const handleTaskCreated = (newTask, listId) => {
    setLists(prevLists => prevLists.map(list => {
      if (list._id === listId) {
        return {
          ...list,
          tasks: [...list.tasks, newTask]
        };
      }
      return list;
    }));
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeListIndex = lists.findIndex(list => 
      list.tasks.some(task => task._id === active.id)
    );
    const overListIndex = lists.findIndex(list => 
      list.tasks.some(task => task._id === over.id)
    );

    if (activeListIndex === -1 || overListIndex === -1) return;

    const activeList = lists[activeListIndex];
    const overList = lists[overListIndex];

    const activeTaskIndex = activeList.tasks.findIndex(t => t._id === active.id);
    const overTaskIndex = overList.tasks.findIndex(t => t._id === over.id);

    let newLists = [...lists];
    
    if (activeListIndex === overListIndex) {
      newLists[activeListIndex] = {
        ...activeList,
        tasks: arrayMove(activeList.tasks, activeTaskIndex, overTaskIndex),
      };
    } else {
      const [removedTask] = newLists[activeListIndex].tasks.splice(activeTaskIndex, 1);
      newLists[overListIndex].tasks.splice(overTaskIndex, 0, removedTask);
    }

    setLists(newLists);
    try {
      await fetch(`http://localhost:5000/api/tasks/${active.id}/position`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          listId: overList._id,
          position: overTaskIndex
        })
      });
    } catch (error) {
      console.error('Position update failed:', error);
    }
  };
const handleListUpdate = async (listId, newTitle) => {
    try {
      const response = await fetch(`http://localhost:5000/api/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle })
      });

      if (!response.ok) throw new Error('Failed to update list');
      
      setLists(lists.map(list => 
        list._id === listId ? { ...list, title: newTitle } : list
      ));
      setEditList(null);
    } catch (error) {
      console.error('List update error:', error);
      alert(error.message);
    }
  };

  const handleListDelete = async (listId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/lists/${listId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete list');
      
      setLists(lists.filter(list => list._id !== listId));
      setDeleteListId(null);
    } catch (error) {
      console.error('List delete error:', error);
      alert(error.message);
    }
  };

 if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-red-500 bg-red-50 p-4 rounded-lg max-w-md text-center">
        ⚠️ Error: {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4 lg:p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => {
          const task = lists
            .flatMap(list => list.tasks)
            .find(task => task._id === active.id);
          setActiveTask(task);
        }}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start overflow-x-auto pb-4 gap-4 pr-4">
          <SortableContext items={lists} strategy={verticalListSortingStrategy}>
            {lists.map(list => (
              <List 
                key={list._id} 
                list={list}
                onTaskCreated={(task) => handleTaskCreated(task, list._id)}
                onEdit={() => setEditList(list)}
                onDelete={() => setDeleteListId(list._id)}
                onTaskEdit={handleTaskEdit}
                onTaskDelete={handleTaskDelete}
              />
            ))}
          </SortableContext>

          <CreateList 
            boardId={boardId} 
            onCreate={(newList) => setLists([...lists, newList])}
          />
        </div>
        {editList && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit List</h2>
                <button
                  onClick={() => setEditList(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="List Title"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                defaultValue={editList.title}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleListUpdate(editList._id, e.target.value)}
                autoFocus
              />
              <div className="mt-6 flex flex-col md:flex-row gap-3">
                <button
                  onClick={() => setEditList(null)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors w-full md:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleListUpdate(editList._id, name)}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        {deleteListId && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <TrashIcon className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 text-center">Delete List?</h2>
                <p className="text-gray-600 text-center mt-2 text-sm">
                  All tasks will be permanently removed.
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <button
                  onClick={() => setDeleteListId(null)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors w-full"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleListDelete(deleteListId)}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <DragOverlay>
          {activeTask && <Task task={activeTask} />}
        </DragOverlay>
      </DndContext>
      
      <div className="w-full lg:w-96 mt-6 lg:mt-0 lg:absolute lg:right-6 lg:top-6">
        <ActivityLog boardId={boardId} />
      </div>
    </div>
  ); 
}