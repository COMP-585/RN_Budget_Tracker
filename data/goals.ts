// src/data/goals.ts
import { earnCoins } from "@/data/users";
import { auth, db } from "@/FirebaseConfig";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc, writeBatch } from "firebase/firestore";


// Firestore document shapes (NO id)
export type GoalDoc = {
  name: string;             // goal name
  targetAmount: number;     // goal money target
  currentAmount: number;    // goal current money
  interval: string;         // goal interval (ex: daily)
  duration: number;         // goal duration (ex: 5 days)
  maxContribution: number;  // goal max contribution limit (ex: max $20/day)
  category: string;         // goal category
  missingAmount: number;    // goal missing contribution (ex: <$20 on day 3)

  goalStatus: "active" | "paused" | "completed";
  intervalStatus: "pending" | "fulfilled";

  lastContributionAt?: Timestamp | null;
  lastContributionMessage?: string | null;
  lastContributionAmount?: number | null;
  contributionsCount?: number | null;

  createdAt?: Timestamp | null;
};

export type ContributionType = "contribution" | "amendment";

export type ContributionDoc = {
  amount: number;
  type: ContributionType;
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

  // initialize goal at creation
  await addDoc(goalsCol(uid), {
    name: data.name,
    targetAmount: data.targetAmount,
    currentAmount: data.currentAmount ?? 0,
    interval: data.interval,
    duration: data.duration,
    maxContribution: data.maxContribution,
    category: data.category,
    missingAmount: 0,

    goalStatus: "active",
    intervalStatus: "pending",

    lastContributionAt: null,
    lastContributionMessage: null,
    lastContributionAmount: null,
    contributionsCount: 0,

    createdAt: serverTimestamp(),
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

  const goalRef = doc(db, "users", uid, "goals", id);
  const contribCol = collection(db, "users", uid, "goals", id, "contributions");

  // Get all contributions
  const contribSnap = await getDocs(contribCol);

  // Delete every contribution
  const deletions = contribSnap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletions);

  // Delete the goal itself
  await deleteDoc(goalRef);
}

// ---------- Contributions ----------
export async function addContribution(goalId: string, amount: number, type: ContributionType) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not signed in");

  const goalRef = doc(db, "users", uid, "goals", goalId);
  const contribCol = collection(db, "users", uid, "goals", goalId, "contributions");

  const goalSnap = await getDoc(goalRef);
  const goalData = goalSnap.data() as GoalDoc | undefined;
  if (!goalData) throw new Error("Goal not found");

  const batch = writeBatch(db);
  const contribRef = doc(contribCol);

  const label = type === "amendment" ? "Amendment" : "Contribution";

  batch.set(contribRef, {
    amount,
    type,
    message: label,
    createdAt: serverTimestamp(),
    uid,
  } as ContributionDoc);

  const updateData: any = {
    currentAmount: increment(amount),
    lastContributionAt: serverTimestamp(),
    lastContributionMessage: label,
    lastContributionAmount: amount,
    contributionsCount: increment(1),
  };

  // Only update intervalStatus for real contributions
  if (type === "contribution") {
    updateData.intervalStatus = "fulfilled";
  }

  const futureCurrent = (goalData.currentAmount ?? 0) + amount;
  if (futureCurrent >= goalData.targetAmount) {
    updateData.goalStatus = "completed";
  }

  batch.update(goalRef, updateData);

  await batch.commit();

  // AWARD COINS USING earnCoins FROM data/users.ts USING getCoinsFromProgressDelta
  try {
    if (type === "contribution") {
      await earnCoins(amount);
    } else {
      return;
    }
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

// --------- Other Utilities ----------
// "Can the user contribute right now?" helper
function addIntervalsFromDate(start: Date, interval: string, count: number): Date {
  const d = new Date(start.getTime());

  if (interval === "daily") {
    d.setDate(d.getDate() + count);
  } else if (interval === "weekly") {
    d.setDate(d.getDate() + 7 * count);
  } else if (interval === "monthly") {
    d.setMonth(d.getMonth() + count);
  } else {
    // Fallback: daily
    d.setDate(d.getDate() + count);
  }

  return d;
}

// "When is the next contribution date?"
export function getContributionWindow(goal: Goal, now = new Date()) {
  // If they've never contributed, they can contribute immediately
  if (!goal.lastContributionAt) {
    return {
      canContribute: true,
      nextDate: now,
      msUntilNext: 0,
    };
  }

  const last = goal.lastContributionAt.toDate();
  const nextDate = addIntervalsFromDate(last, goal.interval, 1);
  const diffMs = nextDate.getTime() - now.getTime();

  const canContribute = diffMs <= 0;

  return {
    canContribute,
    nextDate,
    msUntilNext: diffMs,
  };
}

function getIntervalsElapsed(goal: Goal, now = new Date()): number {
  if (!goal.createdAt) return 0;

  const start = goal.createdAt.toDate();
  const diffMs = now.getTime() - start.getTime();
  if (diffMs <= 0) return 0;

  const oneDay = 24 * 60 * 60 * 1000;

  if (goal.interval === "daily") {
    return Math.floor(diffMs / oneDay);
  }

  if (goal.interval === "weekly") {
    return Math.floor(diffMs / (7 * oneDay));
  }

  if (goal.interval === "monthly") {
    const startMonth = start.getFullYear() * 12 + start.getMonth();
    const nowMonth = now.getFullYear() * 12 + now.getMonth();
    return Math.max(0, nowMonth - startMonth);
  }

  return 0;
}

export function getGoalScheduleInfo(goal: Goal, now = new Date()) {
  if (!goal.createdAt || !goal.duration || goal.duration <= 0) {
    return null;
  }

  const start = goal.createdAt.toDate();
  const totalIntervals = goal.duration;

  const rawElapsed = getIntervalsElapsed(goal, now);
  const intervalsElapsed = Math.min(rawElapsed, totalIntervals);
  const currentIndex = Math.min(intervalsElapsed + 1, totalIntervals); // 1-based
  const intervalsRemaining = Math.max(0, totalIntervals - intervalsElapsed);

  const endDate = addIntervalsFromDate(start, goal.interval, totalIntervals);
  const oneDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / oneDay)
  );

  return {
    currentIndex,       // e.g. 7
    totalIntervals,     // e.g. 20
    intervalsRemaining, // e.g. 13
    daysLeft,           // e.g. 13
  };
}

export function getFullIntervalsBetween( start: Date, end: Date, interval: string ): number {
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return 0;

  const oneDay = 24 * 60 * 60 * 1000;

  if (interval === "daily") {
    return Math.floor(diffMs / oneDay);
  }

  if (interval === "weekly") {
    return Math.floor(diffMs / (7 * oneDay));
  }

  if (interval === "monthly") {
    // how many whole month boundaries
    const startMonth = start.getFullYear() * 12 + start.getMonth();
    const endMonth = end.getFullYear() * 12 + end.getMonth();
    return Math.max(0, endMonth - startMonth);
  }

  // fallback – treat as daily
  return Math.floor(diffMs / oneDay);
}