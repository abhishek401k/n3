import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import { MdNotes, MdCreate, MdCheck, MdOutlineArrowBack } from "react-icons/md";
import "./FoldersList.scss";

export default function FoldersList({
  folders,
  setFolders,
  createNote,
  createNoteWithFolder,
  selectedFolder,
  notes,
  setNotes,
}) {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const unassignedFolder = folders[0];

  function createNewFolder() {
    folderName.toLowerCase();
    if (folderName && !folders.includes(folderName)) {
      const updatedFolders = [...folders, folderName];
      localStorage.setItem("folders", JSON.stringify(updatedFolders));
      setFolders(updatedFolders);
      setIsCreatingFolder(false);
      setFolderName("");
    } else {
      // TODO: Use toast alert.
      alert("Folder name is empty or already exists!");
    }
  }

  function deleteFolder(folderToDelete) {
    const updatedFolders = [...folders];
    const index = updatedFolders.findIndex(
      (folder) => folder === folderToDelete
    );
    if (index !== -1) {
      updatedFolders.splice(index, 1);
    }
    localStorage.setItem("folders", JSON.stringify(updatedFolders));
    setFolders(updatedFolders);

    const updatedNotes = notes.map((note) => {
      if (note.folder === folderToDelete) {
        const updatedNote = { ...note, folder: "Unassigned" };
        localStorage.setItem(note.createdAt, JSON.stringify(updatedNote));
        return updatedNote;
      }
      return note;
    });
    setNotes(updatedNotes);
  }

  function getFolderClassName(folder) {
    if (selectedFolder === folder) return "folder active";
    return "folder";
  }

  return (
    <div className="FoldersList">
      {isCreatingFolder ? (
        <div className="enter-folder-name">
          <div className="icon" onClick={() => setIsCreatingFolder(false)}>
            <MdOutlineArrowBack />
          </div>
          <input
            type="text"
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
          <div className="icon" onClick={createNewFolder}>
            <MdCheck />
          </div>
        </div>
      ) : (
        <>
          <div className="create-new-note" onClick={createNote}>
            <MdCreate />
            <p>Create New Note</p>
          </div>
          <div
            className="create-new-folder"
            onClick={() => setIsCreatingFolder(true)}
          >
            <MdNotes />
            <p>Create New Folder</p>
          </div>
        </>
      )}
      <div className="folders">
        <div
          className={selectedFolder === null ? "folder active" : "folder"}
          onClick={() => createNote()}
        >
          <p>All Notes</p>
        </div>
        <div
          className={
            selectedFolder === "Unassigned" ? "folder active" : "folder"
          }
          onClick={() => createNoteWithFolder("Unassigned")}
        >
          <p>{unassignedFolder}</p>
        </div>
        {folders
          .slice(1)
          .sort()
          .map((folder, index) => (
            <div
              className={getFolderClassName(folder)}
              key={index}
              onClick={() => createNoteWithFolder(folder)}
            >
              <p>{folder}</p>
              <div
                className="trash-icon"
                onClick={(event) => {
                  event.stopPropagation();
                  deleteFolder(folder);
                }}
              >
                <LuTrash2 />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
