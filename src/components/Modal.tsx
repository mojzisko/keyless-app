// components/Modal.tsx
import React, { useEffect, useRef, useState } from 'react';

interface Note {
  id: string;
  title: string;
  text: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, text: string, id?: string) => void;
  note?: Note;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, note }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [animationClass, setAnimationClass] = useState('scale-0');
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && text.trim()) {  // Check if title and text are not empty
      onSubmit(title, text, note?.id);
      setTitle('');
      setText('');
      onClose();
    }
  };

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setText(note.text);
    }
  }, [note]);

  useEffect(() => {
    if (isOpen) {
      setAnimationClass('scale-100 opacity-100');
    } else {
      setAnimationClass('scale-95 opacity-0');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, onClose]);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div ref={modalRef} className={`bg-white p-6 rounded-md transform transition-all duration-500 ease-in-out ${animationClass}`}>
        <h2 className="text-lg font-semibold mb-4 text-purple-700">Add Note</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="mb-2 p-2 border rounded-md w-64 block text-gray-700"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Body"
          className="mb-2 p-2 border rounded-md w-64 h-32 block text-gray-700"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md border bg-gray-200 hover:bg-gray-300 transition-colors duration-300 text-gray-700">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={!title.trim() || !text.trim()}  // Disable button if title or text are empty
            className={`px-4 py-2 rounded-md border ${!title.trim() || !text.trim() ? 'bg-gray-300' : 'bg-purple-500 hover:bg-purple-600'} transition-colors duration-300 ${!title.trim() || !text.trim() ? 'text-gray-500' : 'text-white'}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
