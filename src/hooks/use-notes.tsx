
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  userId?: string; // Owner of the note
};

// ข้อมูลตัวอย่าง
const initialNotes: Note[] = [
  {
    id: '1',
    title: 'ข้อกฎหมายที่เกี่ยวข้อง',
    content: 'มาตรา 420 แห่ง ปพพ. กรณีละเมิด...',
    createdAt: new Date(2025, 4, 15),
    updatedAt: new Date(2025, 4, 15),
    tags: ['กฎหมาย', 'ละเมิด'],
    userId: 'admin'
  },
  {
    id: '2',
    title: 'ประเด็นสำคัญในคดี',
    content: '1. การพิสูจน์ความเสียหาย\n2. การคำนวณค่าเสียหาย...',
    createdAt: new Date(2025, 4, 10),
    updatedAt: new Date(2025, 4, 12),
    tags: ['คดี', 'หลักฐาน'],
    userId: 'user'
  }
];

export const useNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  
  // Get only notes for the current user
  const userNotes = user ? notes.filter(note => 
    // If no userId is specified, it's visible to everyone
    !note.userId || note.userId === user.id
  ) : [];
  
  // เพิ่มโน้ตใหม่
  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return null;
    
    const now = new Date();
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
      userId: user.id
    };
    
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };
  
  // อัปเดตโน้ต
  const updateNote = (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>) => {
    if (!user) return;
    
    setNotes(notes.map(note => 
      note.id === id && (note.userId === user.id || !note.userId)
        ? { 
            ...note, 
            ...updates, 
            updatedAt: new Date() 
          } 
        : note
    ));
  };
  
  // ลบโน้ต
  const deleteNote = (id: string) => {
    if (!user) return;
    
    setNotes(notes.filter(note => 
      !(note.id === id && (note.userId === user.id || !note.userId))
    ));
  };
  
  // ค้นหาโน้ต
  const searchNotes = (query: string) => {
    if (!user) return [];
    
    const lowerQuery = query.toLowerCase();
    return userNotes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) || 
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };
  
  return {
    notes: userNotes,
    addNote,
    updateNote,
    deleteNote,
    searchNotes
  };
};
