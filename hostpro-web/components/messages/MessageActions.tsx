'use client';

import { useState } from 'react';
import { MoreVertical, Archive, Trash2, Bell } from 'lucide-react';

interface MessageActionsProps {
  threadId: string;
  isArchived?: boolean;
}

export function MessageActions({ threadId, isArchived = false }: MessageActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleArchive = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement archive action
      console.log('Archive thread:', threadId);
      setIsOpen(false);
    } catch (error) {
      console.error('Archive failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Etes-vous sur de vouloir supprimer cette conversation ?')) {
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement delete action
      console.log('Delete thread:', threadId);
      setIsOpen(false);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMute = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement mute action
      console.log('Mute thread:', threadId);
      setIsOpen(false);
    } catch (error) {
      console.error('Mute failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        title="Plus d'actions"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            onClick={handleMute}
            disabled={isLoading}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 border-b border-gray-100"
          >
            <Bell size={16} />
            <span>Activer notifications</span>
          </button>

          <button
            onClick={handleArchive}
            disabled={isLoading}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 border-b border-gray-100"
          >
            <Archive size={16} />
            <span>{isArchived ? 'Desarchiver' : 'Archiver'}</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 disabled:opacity-50"
          >
            <Trash2 size={16} />
            <span>Supprimer</span>
          </button>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
