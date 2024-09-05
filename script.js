function addNote() {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;
    const tags = document.getElementById('note-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (title.trim() === '' || content.trim() === '') {
        alert('Назва та вміст нотатки не можуть бути порожніми!');
        return;
    }

    const notesList = document.getElementById('notes-list');
    const noteItem = document.createElement('li');
    noteItem.innerHTML = `
        <strong>${title}</strong>
        <p>${content}</p>
        <div class="tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
        <button class="edit-button" onclick="editNote(this)">Редагувати</button>
        <button class="delete-button" onclick="deleteNote(this)">Видалити</button>
        <button class="download-button" onclick="downloadNote('${title}', '${content}'); event.stopPropagation();">Завантажити</button>
    `;

    noteItem.onclick = function() {
        noteItem.classList.toggle('selected');
    };

    notesList.appendChild(noteItem);
    saveNotes();

    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    document.getElementById('note-tags').value = '';
}

function saveNotes() {
    const notesList = document.getElementById('notes-list');
    const notes = [];
    for (const noteItem of notesList.children) {
        const title = noteItem.querySelector('strong').textContent;
        const content = noteItem.querySelector('p').textContent;
        const tags = Array.from(noteItem.querySelectorAll('.tag')).map(tag => tag.textContent);
        notes.push({ title, content, tags });
    }
    localStorage.setItem('notes', JSON.stringify(notes));
}

function loadNotes() {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        const notesList = document.getElementById('notes-list');
        for (const note of notes) {
            const noteItem = document.createElement('li');
            noteItem.innerHTML = `
                <strong>${note.title}</strong>
                <p>${note.content}</p>
                <div class="tags">${note.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
                <button class="edit-button" onclick="editNote(this)">Редагувати</button>
                <button class="delete-button" onclick="deleteNote(this)">Видалити</button>
                <button class="download-button" onclick="downloadNote('${note.title}', '${note.content}'); event.stopPropagation();">Завантажити</button>
            `;

            noteItem.onclick = function() {
                noteItem.classList.toggle('selected');
            };

            notesList.appendChild(noteItem);
        }
    }
}

function loadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Будь ласка, виберіть файл!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const content = event.target.result;
        const lines = content.split('\n');
        const title = lines[0].trim();
        const noteContent = lines.slice(1).join('\n').trim();
        if (title && noteContent) {
            addNoteFromFile(title, noteContent);
        } else {
            alert('Файл має неправильний формат!');
        }
    };

    reader.readAsText(file);
}

function addNoteFromFile(title, content) {
    const notesList = document.getElementById('notes-list');
    const noteItem = document.createElement('li');
    noteItem.innerHTML = `
        <strong>${title}</strong>
        <p>${content}</p>
        <button class="edit-button" onclick="editNote(this)">Редагувати</button>
        <button class="delete-button" onclick="deleteNote(this)">Видалити</button>
        <button class="download-button" onclick="downloadNote('${title}', '${content}'); event.stopPropagation();">Завантажити</button>
    `;

    noteItem.onclick = function() {
        noteItem.classList.toggle('selected');
    };

    notesList.appendChild(noteItem);
    saveNotes();
}

function searchNotes() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const notesList = document.getElementById('notes-list');
    for (const noteItem of notesList.children) {
        const title = noteItem.querySelector('strong').textContent.toLowerCase();
        const content = noteItem.querySelector('p').textContent.toLowerCase();
        const isVisible = title.includes(searchTerm) || content.includes(searchTerm);
        noteItem.style.display = isVisible ? '' : 'none';
    }
}

function exportSelectedNotes() {
    const selectedNotes = Array.from(document.querySelectorAll('#notes-list .selected'));
    if (selectedNotes.length === 0) {
        alert('Виберіть нотатки для експорту!');
        return;
    }

    const notes = selectedNotes.map(noteItem => {
        const title = noteItem.querySelector('strong').textContent;
        const content = noteItem.querySelector('p').textContent;
        return `${title}\n${content}`;
    });

    const blob = new Blob([notes.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected_notes_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up after download
}

function exportAllNotes() {
    const notesList = document.getElementById('notes-list');
    const notes = [];
    for (const noteItem of notesList.children) {
        const title = noteItem.querySelector('strong').textContent;
        const content = noteItem.querySelector('p').textContent;
        notes.push(`${title}\n${content}`);
    }

    const blob = new Blob([notes.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_notes_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up after download
}

function downloadNote(title, content) {
    const blob = new Blob([`${title}\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up after download
}

function editNote(button) {
    const noteItem = button.parentElement;
    const title = noteItem.querySelector('strong').textContent;
    const content = noteItem.querySelector('p').textContent;

    const newTitle = prompt('Редагуйте назву нотатки:', title);
    const newContent = prompt('Редагуйте вміст нотатки:', content);

    if (newTitle !== null && newContent !== null) {
        noteItem.querySelector('strong').textContent = newTitle;
        noteItem.querySelector('p').textContent = newContent;
        saveNotes();
    }
}

function deleteNote(button) {
    const noteItem = button.parentElement;
    noteItem.parentElement.removeChild(noteItem);
    saveNotes();
}

document.getElementById('theme-toggle').addEventListener('change', function() {
    if (this.checked) {
        document.body.classList.add('dark-theme');
        document.querySelector('.container').classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
        document.querySelector('.container').classList.remove('dark-theme');
    }
});

// Load notes on page load
window.onload = loadNotes;
