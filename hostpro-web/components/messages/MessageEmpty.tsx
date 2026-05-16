'use client';

import { MessageSquare, Inbox } from 'lucide-react';

interface MessageEmptyProps {
  type?: 'no-threads' | 'no-selection';
  onSync?: () => void | Promise<void>;
}

export function MessageEmpty({ type = 'no-selection', onSync }: MessageEmptyProps) {
  if (type === 'no-threads') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-50 to-gray-100 p-6">
        <div className="text-center max-w-md">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <Inbox className="w-8 h-8 text-blue-600" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Pas de messages
          </h3>

          <p className="text-gray-600 mb-6">
            Vos conversations de Airbnb, Booking et Abritel s'afficheront ici.
            Synchronisez vos plateformes pour commencer.
          </p>

          {onSync && (
            <button
              onClick={onSync}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Inbox size={18} />
              Synchroniser maintenant
            </button>
          )}
        </div>
      </div>
    );
  }

  // no-selection state
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white p-6">
      <div className="text-center max-w-md">
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Selectionnez une conversation
        </h3>

        <p className="text-gray-600">
          Choisissez une conversation dans la liste pour commencer a discuter.
        </p>
      </div>
    </div>
  );
}
