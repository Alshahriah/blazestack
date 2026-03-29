import { Suspense, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { trpc } from '../../lib/trpc';

function NoteItem({
  note,
  onDelete,
  deleting,
}: {
  note: { id: string; title: string; body: string; createdAt: Date | string };
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.noteTitle}>{note.title}</Text>
        {note.body ? <Text style={styles.noteBody}>{note.body}</Text> : null}
        <Text style={styles.noteDate}>{new Date(note.createdAt).toLocaleString()}</Text>
      </View>
      <Pressable
        onPress={() => onDelete(note.id)}
        disabled={deleting}
        style={styles.deleteBtn}
      >
        <Text style={styles.deleteBtnText}>Delete</Text>
      </Pressable>
    </View>
  );
}

function NotesList() {
  const utils = trpc.useUtils();
  const { data: notes = [] } = trpc.notes.list.useQuery();

  const deleteMutation = trpc.notes.delete.useMutation({
    onSuccess: () => utils.notes.list.invalidate(),
  });

  if (notes.length === 0) {
    return <Text style={styles.empty}>No notes yet. Add one above.</Text>;
  }

  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <NoteItem
          note={item}
          onDelete={(id) => deleteMutation.mutate({ id })}
          deleting={deleteMutation.isPending}
        />
      )}
    />
  );
}

export default function NotesScreen() {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const createMutation = trpc.notes.create.useMutation({
    onSuccess: () => {
      setTitle('');
      setBody('');
      utils.notes.list.invalidate();
    },
  });

  function handleCreate() {
    if (!title.trim()) return;
    createMutation.mutate({ title: title.trim(), body: body.trim() });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.heading}>Notes</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Body (optional)"
          placeholderTextColor="#9ca3af"
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={3}
        />
        <Pressable
          style={[styles.button, (!title.trim() || createMutation.isPending) && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={!title.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add note</Text>
          )}
        </Pressable>
        {createMutation.error && (
          <Text style={styles.error}>{createMutation.error.message}</Text>
        )}
      </View>

      <Suspense fallback={<ActivityIndicator style={{ marginTop: 24 }} />}>
        <NotesList />
      </Suspense>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', paddingTop: 60, paddingHorizontal: 16 },
  heading: { fontSize: 28, fontWeight: '700', color: '#111827', marginBottom: 16 },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  error: { color: '#ef4444', fontSize: 12 },
  list: { gap: 10, paddingBottom: 40 },
  empty: { color: '#9ca3af', fontSize: 14, textAlign: 'center', marginTop: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardContent: { flex: 1 },
  noteTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  noteBody: { fontSize: 13, color: '#4b5563', marginTop: 4 },
  noteDate: { fontSize: 11, color: '#9ca3af', marginTop: 6 },
  deleteBtn: { paddingTop: 2 },
  deleteBtnText: { fontSize: 12, color: '#ef4444', fontWeight: '500' },
});
