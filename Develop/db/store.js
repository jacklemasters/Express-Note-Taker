const util = require("util");
const fs = require("fs");

// This package will be used to generate our unique ids. https://www.npmjs.com/package/uuid
const { v1: uuidv1 } = require('uuid');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

class Store {
    read() {
    return readFileAsync("db/db.json", "utf8");
}

write(note) {
    return writeFileAsync("db/db.json", JSON.stringify(note));
}

getNotes() {
    return this.read().then(notes => {
    let parsedNotes;

      // If notes isn't an array or can't be turned into one, return new empty array
    try {
        parsedNotes = [].concat(JSON.parse(notes));
    } catch (err) {
        parsedNotes = [];
    }

        return parsedNotes;
    });
}

addNote(note) {
    const { title, text } = note;

    if (!title || !text) {
        throw new Error("Note 'title' and 'text' cannot be blank");
    }

    // Add a unique id to the note using uuid 
    const newNote = { title, text, id: uuidv1() };

    return this.getNotes()
        .then(notes => [...notes, newNote])
        .then(updatedNotes => this.write(updatedNotes))
        .then(() => newNote);
}

removeNote(id) {
    // Get all notes, remove the note, and write the filtered notes
    return this.getNotes()
        .then(notes => notes.filter(note => note.id !== id))
        .then(filteredNotes => this.write(filteredNotes));
}
}

module.exports = new Store();