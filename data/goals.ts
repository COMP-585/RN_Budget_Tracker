// src/data/goals.ts
import { earnCoins } from "@/data/users";
import { auth, db } from "@/FirebaseConfig";
import { addDoc, collection, deleteDoc, doc, increment, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc, writeBatch } from "firebase/firestore";


// Firestore document shapes (NO id)
export type GoalDoc = {
  name: string;
  targetAmount: number;
  currentAmount: number;
  interval: string;

  dueDate?: string | null;
  color?: string | null;

  lastContributionAt?: Timestamp | null;
  lastContributionMessage?: string | null;
  lastContributionAmount?: number | null;
  contributionsCount?: number | null;

  createdAt?: Timestamp | null;
  status?: "active" | "paused" | "completed";
};

export type ContributionDoc = {
  amount: number;
  message?: string | null;
  createdAt?: Timestamp | null;
  uid?: string | null;
};

// UI-facing shapes (WITH id)
export type Goal = GoalDoc & { id: string };
export type Contribution = ContributionDoc & { id: string };

// ---------- Helpers ----------
const goalsCol = (uid: string) => collection(db, "users", uid, "goals");

// ---------- Create ----------
export async function createGoal(data: Partial<GoalDoc> & Pick<GoalDoc, "name" | "targetAmount">) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  await addDoc(goalsCol(uid), {
    name: data.name,
    targetAmount: data.targetAmount,
    currentAmount: data.currentAmount ?? 0,

    dueDate: data.dueDate ?? null,
    color: data.color ?? null,

    // summary/meta defaults
    lastContributionAt: null,
    lastContributionMessage: null,
    lastContributionAmount: null,
    contributionsCount: 0,

    createdAt: serverTimestamp(),
    status: data.status ?? "active",
  } as GoalDoc);
}

// ---------- Read (live) ----------
export function listenGoals(cb: (rows: Goal[]) => void) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  const q = query(goalsCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const rows: Goal[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as GoalDoc) }));
    cb(rows);
  });
}

// ---------- Update ----------
export async function updateGoal(id: string, patch: Partial<GoalDoc>) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  await updateDoc(doc(db, "users", uid, "goals", id), patch);
}

// ---------- Delete ----------
export async function deleteGoal(id: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  await deleteDoc(doc(db, "users", uid, "goals", id));
}

// ---------- Contributions ----------
export async function addContribution(goalId: string, amount: number, message?: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  const goalRef = doc(db, "users", uid, "goals", goalId);
  const contribCol = collection(db, "users", uid, "goals", goalId, "contributions");

  const batch = writeBatch(db);
  const contribRef = doc(contribCol);

  batch.set(contribRef, {
    amount,
    message: (message?.trim() || null) as string | null,
    createdAt: serverTimestamp(),
    uid,
  } as ContributionDoc);

  batch.update(goalRef, {
    currentAmount: increment(amount),
    lastContributionAt: serverTimestamp(),
    lastContributionMessage: message?.trim() || null,
    lastContributionAmount: amount,
    contributionsCount: increment(1),
  });

  await batch.commit();

  // AWARD COINS USING earnCoins FROM data/users.ts USING MULTIPLIER
  try {
    await earnCoins(amount); // this will apply a multiplier for coins earned
  } catch (err) {
    console.warn("Failed to award coins for contribution:", err);
    // optional: log this somewhere, but don't throw – contribution already saved
  }
}

export function listenContributions(
  goalId: string,
  cb: (rows: Contribution[]) => void
) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  const q = query(
    collection(db, "users", uid, "goals", goalId, "contributions"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const rows: Contribution[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as ContributionDoc) }));
    cb(rows);
  });
}
