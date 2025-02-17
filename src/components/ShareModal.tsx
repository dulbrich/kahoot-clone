import React, { useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, Mail, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Quiz } from '../types';

interface ShareModalProps {
  quiz: Quiz;
  onClose: () => void;
}

export default function ShareModal({ quiz, onClose }: ShareModalProps) {
  const shareUrl = `${window.location.origin}/join/${quiz.shareCode}`;

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const shareViaEmail = useCallback(() => {
    const subject = encodeURIComponent(`Join my quiz: ${quiz.title}`);
    const body = encodeURIComponent(`Join my quiz "${quiz.title}" using this link: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [quiz, shareUrl]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Share Quiz</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-2 touch-manipulation"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg">
            <QRCodeSVG value={shareUrl} size={200} />
            <p className="text-sm text-gray-500">Scan QR code to join</p>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <code className="flex-1 text-sm sm:text-base font-mono bg-white px-3 py-2 rounded border overflow-x-auto">
              {quiz.shareCode}
            </code>
            <button
              onClick={() => copyToClipboard(quiz.shareCode!)}
              className="p-3 text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
              aria-label="Copy code"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 text-sm sm:text-base bg-white px-3 py-2 rounded border overflow-x-auto"
            />
            <button
              onClick={() => copyToClipboard(shareUrl)}
              className="p-3 text-gray-500 hover:text-gray-700 transition-colors touch-manipulation"
              aria-label="Copy link"
            >
              <Link className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={shareViaEmail}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors touch-manipulation"
            >
              <Mail className="w-5 h-5" />
              <span>Email</span>
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Join quiz: ${quiz.title}`,
                    text: `Join my quiz "${quiz.title}"`,
                    url: shareUrl,
                  });
                } else {
                  copyToClipboard(shareUrl);
                }
              }}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors touch-manipulation"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}