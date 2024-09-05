// Перевірка, чи документ готовий
document.addEventListener('DOMContentLoaded', () => {
    const notesContainer = document.getElementById('notes');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentInput = document.getElementById('noteContent');
    let editingNoteId = null;

    // Функція для збереження нотаток у локальне сховище
    function saveNotes(notes) {
        localStorage.setItem('notes', JSON.stringify(notes));
    }
    
    // Функція для завантаження нотаток з локального сховища
    function loadNotes() {
        return JSON.parse(localStorage.getItem('notes')) || [];
    }
    
    // Функція для створення нової нотатки або редагування існуючої
    function saveNote() {
        const title = noteTitleInput.value;
        const content = noteContentInput.value;
        
        if (title && content) {
            const notes = loadNotes();
            
            if (editingNoteId) {
                // Редагування існуючої нотатки
                const note = notes.find(note => note.id === editingNoteId);
                note.title = title;
                note.content = content;
            } else {
                // Додавання нової нотатки
                const newNote = {
                    id: Date.now(),
                    title: title,
                    content: content
                };
                notes.push(newNote);
            }
            
            saveNotes(notes);
            displayNotes();
            closeModal.click(); // Закрити модальне вікно
        }
    }
    
    // Функція для відображення нотаток на сторінці
    function displayNotes() {
        const notes = loadNotes();
        notesContainer.innerHTML = '';
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.innerHTML = `
                <h2>${note.title}</h2>
                <p>${note.content}</p>
                <button onclick="editNote(${note.id})">✏️</button>
                <button onclick="deleteNote(${note.id})">❌</button>
                <button onclick="downloadNote(${note.id})">📥</button>
            `;
            notesContainer.appendChild(noteElement);
        });
    }
    
    // Функція для редагування нотатки
    window.editNote = function(id) {
        const notes = loadNotes();
        const note = notes.find(note => note.id === id);
        if (note) {
            noteTitleInput.value = note.title;
            noteContentInput.value = note.content;
            editingNoteId = id;
            document.getElementById('modalTitle').textContent = 'Редагувати нотатку';
            modal.style.display = 'block';
        }
    };
    
    // Функція для видалення нотатки
    window.deleteNote = function(id) {
        let notes = loadNotes();
        notes = notes.filter(note => note.id !== id);
        saveNotes(notes);
        displayNotes();
    };
    
    // Функція для завантаження нотатки
    window.downloadNote = function(id) {
        const notes = loadNotes();
        const note = notes.find(note => note.id === id);
        if (note) {
            const blob = new Blob([`${note.title}\n\n${note.content}`], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${note.title}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };
    
    // Додаємо подію для відкриття модального вікна
    addNoteBtn.addEventListener('click', () => {
        noteTitleInput.value = '';
        noteContentInput.value = '';
        editingNoteId = null;
        document.getElementById('modalTitle').textContent = 'Додати нотатку';
        modal.style.display = 'block';
    });

    // Додаємо подію для збереження нотатки
    saveNoteBtn.addEventListener('click', saveNote);

    // Додаємо подію для закриття модального вікна
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Закриття модального вікна при натисканні за межами модального вікна
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Відображення нотаток при завантаженні сторінки
    displayNotes();
});
