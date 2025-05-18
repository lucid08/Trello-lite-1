'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreateBoardModal from '@/components/CreateBoardModal';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editBoard, setEditBoard] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/boards', {
          credentials: 'include',
          cache: 'no-store'
        });

        if (!response.ok) {
          if (response.status === 401) router.push('/login');
          throw new Error('Failed to fetch boards');
        }

        const data = await response.json();
        setBoards(data);
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [router]);

  const handleDeleteBoard = async (boardId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/boards/${boardId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete board');
      
      setBoards(boards.filter(board => board._id !== boardId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message);
    }
  };

  const handleUpdateBoard = async (boardId, newTitle) => {
    try {
      const response = await fetch(`http://localhost:5000/api/boards/${boardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle })
      });

      if (!response.ok) throw new Error('Failed to update board');

      const updatedBoard = await response.json();
      
      setBoards(boards.map(board => 
        board._id === boardId ? { ...board, title: updatedBoard.title } : board
      ));
      setEditBoard(null);
    } catch (error) {
      console.error('Update error:', error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Boards</h1>
          <CreateBoardModal 
            onSuccess={(newBoard) => setBoards([...boards, newBoard])}
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 md:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          />
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="text-gray-500 mb-6 text-lg">No boards found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {boards.map((board) => (
              <div
                key={board._id}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:-translate-y-1"
              >
                <Link
                  href={`/boards/${board._id}`}
                  className="block p-4 md:p-6 pb-12 md:pb-14 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 truncate">
                    {board.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500">
                    {board.lists?.length || 0} lists • {board.tasks?.length || 0} tasks
                  </p>
                </Link>
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditBoard(board);
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Edit board"
                  >
                    <PencilIcon className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteConfirm(board._id);
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Delete board"
                  >
                    <TrashIcon className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {editBoard && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Edit Board</h2>
                <button
                  onClick={() => setEditBoard(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="Board Title"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm md:text-base"
                defaultValue={editBoard.title}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateBoard(editBoard._id, e.target.value)}
                autoFocus
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEditBoard(null)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const newTitle = document.querySelector('.modal input').value;
                    handleUpdateBoard(editBoard._id, newTitle);
                  }}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 md:p-8 w-full max-w-md shadow-2xl">
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <TrashIcon className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
                  Delete Board?
                </h2>
                <p className="text-gray-600 text-center text-sm md:text-base">
                  This action cannot be undone. All lists and tasks will be permanently removed.
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteBoard(deleteConfirm)}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}