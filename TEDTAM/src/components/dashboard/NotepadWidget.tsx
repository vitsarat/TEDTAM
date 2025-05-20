
import React, { useState } from 'react';
import { Edit, Plus, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNotes, Note } from '@/hooks/use-notes';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export const NotepadWidget = () => {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note> | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(notes.length > 0 ? notes[0].id : null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const handleNewNote = () => {
    setCurrentNote({
      title: '',
      content: '',
      tags: []
    });
    setIsDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (currentNote && currentNote.title && currentNote.content) {
      if (currentNote.id) {
        // อัปเดตโน้ตที่มีอยู่
        updateNote(currentNote.id, {
          title: currentNote.title,
          content: currentNote.content,
          tags: currentNote.tags
        });
      } else {
        // เพิ่มโน้ตใหม่
        addNote({
          title: currentNote.title,
          content: currentNote.content,
          tags: currentNote.tags
        });
      }
      setIsDialogOpen(false);
      setCurrentNote(null);
    }
  };

  const handleEditClick = () => {
    if (activeNote) {
      const note = notes.find(n => n.id === activeNote);
      if (note) {
        setEditContent(note.content);
        setIsEditing(true);
      }
    }
  };

  const handleSaveEdit = () => {
    if (activeNote && editContent.trim()) {
      updateNote(activeNote, { content: editContent });
      setIsEditing(false);
    }
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    if (activeNote === id) {
      setActiveNote(notes.length > 1 ? notes.find(n => n.id !== id)?.id || null : null);
    }
  };

  const activeNoteData = activeNote ? notes.find(n => n.id === activeNote) : null;

  return (
    <>
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-tedtam-blue flex items-center">
            <Edit className="h-5 w-5 mr-2" />
            สมุดจดบันทึก
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto h-8 text-xs"
              onClick={handleNewNote}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              สร้างใหม่
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex h-64">
            {/* รายการโน้ต */}
            <div className="w-1/3 border-r pr-2">
              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {notes.map((note) => (
                    <div 
                      key={note.id}
                      className={`p-2 rounded text-sm cursor-pointer ${activeNote === note.id ? 'bg-blue-50 text-tedtam-blue' : 'hover:bg-gray-50'}`}
                      onClick={() => {
                        setActiveNote(note.id);
                        setIsEditing(false);
                      }}
                    >
                      <div className="font-medium truncate">{note.title}</div>
                      <div className="text-xs text-gray-500">{format(note.updatedAt, 'dd MMM', { locale: th })}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            
            {/* แสดงเนื้อหาโน้ต */}
            <div className="w-2/3 pl-2">
              {activeNoteData ? (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{activeNoteData.title}</h4>
                    <div className="space-x-1">
                      {!isEditing ? (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEditClick}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveEdit}>
                          <Save className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-rose-500 hover:text-rose-600" 
                        onClick={() => handleDeleteNote(activeNoteData.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-1">
                    อัปเดตเมื่อ: {format(activeNoteData.updatedAt, 'dd MMM yyyy HH:mm', { locale: th })}
                  </div>
                  
                  <ScrollArea className="flex-1">
                    {isEditing ? (
                      <Textarea 
                        className="h-full min-h-[6rem]" 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm">
                        {activeNoteData.content}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  เลือกโน้ตเพื่อดูรายละเอียด
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog สำหรับเพิ่ม/แก้ไขโน้ต */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentNote?.id ? 'แก้ไขโน้ต' : 'สร้างโน้ตใหม่'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">ชื่อโน้ต</label>
              <Input
                value={currentNote?.title || ''}
                onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                placeholder="ป้อนชื่อโน้ต"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">เนื้อหา</label>
              <Textarea
                value={currentNote?.content || ''}
                onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                placeholder="ป้อนเนื้อหา"
                className="min-h-[10rem]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSaveNote}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
