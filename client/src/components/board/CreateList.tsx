'use client';

import { useState } from 'react';

export default function CreateList({ boardId }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createList = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            title: title,
            boardId: boardId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create list');

      const newList = await response.json();
      setTitle('');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-4 min-w-[300px]">
      <form onSubmit={createList} className="bg-gray-100 p-2 rounded-lg">
        <input
          type="text"
          placeholder="Add another list"
          className="w-full p-2 rounded border border-gray-300 mb-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add List'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setError('');
            }}
            className="p-1.5 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      </form>
    </div>
  );
}