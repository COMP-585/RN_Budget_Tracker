// CRUD and listener for the users goals.

import { auth, db } from "@/FirebaseConfig";
import { addDoc, collection, deleteDoc, doc, increment, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";

// Type definition
export type Goal = {
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate?: string;  // e.g. "2025-12-31"
  petId?: string;    // optional link to a pet
  status?: "active" | "paused" | "completed";
  createdAt?: Date;
};


// Collection helper
const colPath = (uid: string) => collection(db, "users", uid, "goals");


// Create
export async function createGoal(data: Goal) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  await addDoc(colPath(uid), {
    ...data,
    currentAmount: data.currentAmount ?? 0,
    status: data.status ?? "active",
    createdAt: new Date(),
  });
}


// Real-time listener
export function listenGoals(cb: (rows: any[]) => void) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  const q = query(colPath(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  );
}


// Update
export async function updateGoal(id: string, patch: Partial<Goal>) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  await updateDoc(doc(db, "users", uid, "goals", id), patch as any);
}


// Amount Contribution towards goal
export async function addContribution(id: string, amount: number) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  await updateDoc(doc(db, "users", uid, "goals", id), {currentAmount: increment(amount)});
}


// Delete
export async function deleteGoal(id: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  await deleteDoc(doc(db, "users", uid, "goals", id));
}
