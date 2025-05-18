'use client';
import React from 'react';
import Board from '@/components/board/Board';

export default function BoardPage({ params }) {
  const { boardId } = React.use(params);

  return (
    <div className="min-h-screen">
      <Board boardId={boardId} />
    </div>
  );
}