// pages/index.tsx
import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { PrismaClient } from "@prisma/client";
import dayjs from 'dayjs';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';

interface Note {
  id: number;
  title: string;
  text: string;
  updatedAt: Date;
}

interface HomeProps {
  notesProp: Note[];
}

async function fetchNotes() {
  const res = await fetch('/api/notes');
  const data: Note[] = await res.json();

  if (!Array.isArray(data)) {
    throw new Error('Data fetched is not in expected format');
  }
  return data;
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const prisma = new PrismaClient();
  let notesProp: Note[] = [];

  try {
    notesProp = await prisma.note.findMany();
  } catch (error) {
    console.error("Error fetching notes: ", error);
  } finally {
    await prisma.$disconnect();
  }

  // Convert Date objects to strings
  const serializedNotes = notesProp.map(note => ({
    ...note,
    id: note.id,
    updatedAt: note.updatedAt.toISOString(),
  }));

  return {
    props: {
      notesProp: serializedNotes,
    },
  };
};

export default function Home({ notesProp }: HomeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState(notesProp)
  const [colors, setColors] = useState<string[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  useEffect(() => {
    // Generate a color for each note
    setColors(notes.map(() => getRandomColor()));
  }, [notes]);

  function getRandomColor() {
    const letters = 'BCDEF'.split('');
    let color = '#';
    for (let i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
  } 

  const handleAddOrUpdateNote = async (title: string, text: string, id?: number) => {
    // Logic to add or update note 
    try {
      const url = id ? `/api/notes/update/${id}` : '/api/notes/create';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, text }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok' + response.statusText);
      }
  
      const data = await response.json();

      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error creating or updating note:', error);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = async (id: number) => {
    try {
      const response = await fetch(`/api/notes/delete/${id}`);
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      // Remove the note from local state so the UI updates immediately
      setNotes((prevNotes: any) => prevNotes.filter((note: Note) => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };
  
  return (
    <div style={{ backgroundColor: '#261f48' }} className="min-h-screen flex flex-col text-white">
     <header className="p-4 flex flex-wrap justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-0">Ultra cool notes app</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-white text-purple-900 rounded-full p-3 md:p-4 text-xl md:text-2xl shadow-lg hover:bg-purple-100 active:bg-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Add note +
        </button>
      </header>
      <section className="px-4 pt-2 pb-4 flex-grow">
        <main className="space-y-6">
        {notes.length === 0 ? (
            <p>No notes available. Create one!</p>
          ) : (
            notes.map((note, index) => (
              <article key={note.id} className="p-6 bg-yellow-100 relative rounded-lg text-gray-800" style={{ backgroundColor: colors[index] }}>
                <button 
                  onClick={() => handleEditNote(note)} 
                  className="absolute top-4 right-16 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  aria-label="Edit note"
                  style={{ width: '36px', height: '36px' }}
                >
                  <FaPencilAlt className="h-5 w-5 mx-auto"/>
                </button>
                 <button 
                  onClick={() => handleDeleteNote(note.id)} 
                  className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  aria-label="Delete note"
                  style={{ width: '36px', height: '36px' }}
                >
                  <FaTimes className="h-5 w-5 mx-auto" />
                </button>
                <h2 className="text-2xl font-semibold mb-2">{note.title}</h2>
                <p className="mb-2">{note.text}</p>
                <time className="text-sm">Last updated: {dayjs(note.updatedAt).format('MMMM D, YYYY h:mm A')}</time>
              </article>
            ))
          )}
        </main>
      </section>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingNote(null);
          }}
          onSubmit={handleAddOrUpdateNote}
          note={editingNote}
        />
      )}
    </div>
  )
};

