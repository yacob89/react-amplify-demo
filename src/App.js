import React from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';

class App extends React.Component {
  state = {
    id: '',
    note: '',
    notes: []
  };

  async componentDidMount() {
    const result = await API.graphql(graphqlOperation(listNotes));
    this.setState({ notes: result.data.listNotes.items });
  }

  handleChangeNote = event => {
    this.setState({ note: event.target.value });
  };
  handleAddNote = async event => {
    const { note, notes } = this.state;
    event.preventDefault();
    // Check if we have existing note, if so update it
    if (this.hasExistingNote()) {
      console.log('Note Updated');
      this.handleUpdateNote();
    } else {
      const input = {
        note: note
      };
      const result = await API.graphql(
        graphqlOperation(createNote, { input: input })
      );
      const newNote = result.data.createNote;
      const updatedNotes = [newNote, ...notes];
      this.setState({ notes: updatedNotes, note: '' });
    }
  };
  handleUpdateNote = async () => {
    const { notes, id, note } = this.state;
    const input = { id, note };
    const result = await API.graphql(
      graphqlOperation(updateNote, { input: input })
    );
    const updatedNote = result.data.updateNote;
    const index = notes.findIndex(note => note.id === updatedNote.id);
    /* const updatedNotes = [
      ...notes.slice(0, index),
      updatedNote,
      ...notes.slice(index + 1)
    ]; */
    const updatedNotes = notes;
    updatedNotes.splice(index, 1, updatedNote);
    this.setState({ notes: updatedNotes, note: '', id: '' });
  };
  handleSetNote = ({ note, id }) => {
    this.setState({ note: note, id: id });
  };
  handleDeleteNote = async noteId => {
    const { notes } = this.state;
    const input = { id: noteId };
    const result = await API.graphql(
      graphqlOperation(deleteNote, { input: input })
    );
    const deletedNoteId = result.data.deleteNote.id;
    const updatedNotes = notes.filter(note => note.id !== deletedNoteId);
    this.setState({ notes: updatedNotes });
  };
  hasExistingNote = () => {
    // Check if we have existing note to update, return true/false
    const { notes, id } = this.state;
    if (id) {
      // is this the valid id?
      const isNote = notes.findIndex(note => note.id === id) > -1;
      return isNote;
    }
    return false;
  };
  render() {
    const { id, note, notes } = this.state;

    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-1">Amplify Notetaker</h1>
        {/* Note Form */}
        <form className="mb3" onSubmit={this.handleAddNote}>
          <input
            type="text"
            className="pa2 f4"
            placeholder="Write your note"
            onChange={this.handleChangeNote}
            value={note}
          />
          <button className="pa2 f4" type="submit">
            {id ? 'Update Note' : 'Add Note'}
          </button>
        </form>

        {/* Note Lists */}
        <div>
          {notes.map(item => (
            <div key={item.id} className="flex items-center">
              <li
                className="list pa1 f3"
                onClick={() => this.handleSetNote(item)}
              >
                {item.note}
              </li>
              <button
                className="bg-transparent bn f4"
                onClick={() => this.handleDeleteNote(item.id)}
              >
                <span>&times;</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
