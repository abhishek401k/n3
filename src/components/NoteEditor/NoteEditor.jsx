import { useRef, useState, useEffect } from "react";
import { EditorProvider, EditorContent } from "@tiptap/react";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import EditorToolbar from "./EditorToolbar/EditorToolbar.jsx";
import "./NoteEditor.scss";
import { MdOutlineSave, MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
export default function NoteEditor({
  notes,
  setNotes,
  selectedNote,
  setSelectedNote,
  editMode,
  setEditMode,
  selectedFolder,
  folders,
}) {
  const [assignedFolder, setAssignedFolder] = useState(
    selectedNote?.folder || folders[0]
  );
  const [title, setTitle] = useState("");
  const [isNewNote, setIsNewNote] = useState(false);
  const editorRef = useRef();

  useEffect(() => {
    setAssignedFolder(selectedFolder || selectedNote?.folder || folders[0]);
    setTitle(selectedNote?.title || "");
    setIsNewNote(
      !notes.some((note) => note.createdAt === selectedNote?.createdAt)
    );
  }, [folders, selectedFolder, notes, selectedNote]);

  const extensions = [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({ types: [ListItem.name] }),
    Placeholder.configure({
      placeholder: "Start writing your brilliant thoughts.",
    }),
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
  ];

  function saveNote(userInput) {
    const isNew = !notes.some(
      (note) => note.createdAt === selectedNote?.createdAt
    );
    setIsNewNote(isNew);

    let createdAt = selectedNote ? selectedNote.createdAt : Date.now();

    const newNote = {
      title: title,
      content: userInput,
      createdAt: createdAt,
      folder: assignedFolder || folders[0],
    };

    /* TODO: In the future, wrap anything with setting in local storage
     in a try catch block, and in the catch, display some Toast alert
     notifying a user that their storage limit has been reached. */
    localStorage.setItem(createdAt, JSON.stringify(newNote));
    updateNotesList(newNote, isNew);
    setSelectedNote(newNote);
    setEditMode(false);
  }

  function updateNotesList(newNote, isNew) {
    setNotes((prevNotes) => {
      if (isNew) {
        return [...prevNotes, newNote];
      } else {
        return prevNotes.map((note) =>
          note.createdAt === newNote.createdAt ? newNote : note
        );
      }
    });
  }

  function deleteNote(noteToDelete) {
    if (noteToDelete) {
      localStorage.removeItem(noteToDelete.createdAt);

      setNotes((prevNotes) => {
        return prevNotes.filter(
          (currentNote) => currentNote.createdAt != noteToDelete.createdAt
        );
      });

      setSelectedNote(null);
      setEditMode(true);
    }
  }

  return (
    <div className={`NoteEditor ${editMode ? "editing" : ""}`}>
      <div className="header">
        {editMode ? (
          <input
            type="text"
            placeholder="Start with a title!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <p> {selectedNote?.title}</p>
        )}

        {editMode && (
          <select
            value={assignedFolder}
            onChange={(e) => setAssignedFolder(e.target.value)}
          >
            {folders.map((folder, index) => (
              <option key={index} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        )}

        {editMode && !isNewNote && (
          <MdDeleteOutline
            className="icon"
            size={25}
            onClick={(event) => {
              event.stopPropagation();
              deleteNote(selectedNote);
            }}
          />
        )}

        {editMode && title && (
          <MdOutlineSave
            className="icon"
            size={25}
            onClick={() => {
              saveNote(editorRef.current.getHTML());
            }}
          />
        )}

        {!editMode && (
          <MdOutlineEdit
            className="icon"
            size={25}
            onClick={() => setEditMode(true)}
          />
        )}
      </div>

      {editMode && title && (
        <EditorProvider
          key={selectedNote?.createdAt}
          content={selectedNote?.content || ""}
          editable={editMode}
          extensions={extensions}
          slotBefore={
            editMode && (
              <EditorToolbar
                editMode={editMode}
                setEditMode={setEditMode}
                editorRef={editorRef}
              />
            )
          }
        >
          <EditorContent />
        </EditorProvider>
      )}
    </div>
  );
}
