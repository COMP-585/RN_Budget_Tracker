import { auth, db } from "@/FirebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  arrayUnion,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Alert } from "react-native";
import { Costume } from "./costumes";

export type UserProfile = {
  email?: string;
  displayName?: string;
  coins?: number;
  currentPet?: string | null;
  currentCostumeId?: number | null;
  unlockedPets?: string[];
  unlockedCostumes?: number[];
  createdAt?: any; // or Firebase Timestamp if you prefer
};

// Reference helper
export const userRef = (uid: string) => doc(db, "users", uid);

/* Earn coins based on a contribution towards percent completed */
export async function earnCoins(coinsToAdd: number) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not logged in");

  if (coinsToAdd <= 0) return;

  const ref = userRef(uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const prevCoins = snap.exists() ? (snap.data()?.coins as number) || 0 : 0;

    tx.set(ref, { coins: prevCoins + coinsToAdd }, { merge: true });
  });
}

// ===== Unlock =====
export const unlockPet = async (petId: string) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  await setDoc(
    userRef(uid),
    { unlockedPets: arrayUnion(petId) },
    { merge: true }
  );
};

// ===== Unlock =====
export const unlockCostume = async (costumeItem: Costume, currBal: number) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const newBal =
    currBal - costumeItem.price <= 0 ? 0 : currBal - costumeItem.price;

  await updateDoc(userRef(uid), {
    coins: newBal,
    unlockedCostumes: arrayUnion(costumeItem.id),
  });
};

/* =============== Listen to User Profile Changes =============== */
export function listenToUserProfile(
  callback: (data: UserProfile | null) => void
) {
  const uid = auth.currentUser?.uid;
  if (!uid) return () => {};

  const ref = userRef(uid);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback(snap.data() as UserProfile);
  });
}

// 0–1 fraction: coins come from % progress, not dollars
export function getCoinsFromProgressDelta(options: {
  oldCurrent: number; // before contribution
  newCurrent: number; // after contribution
  targetAmount: number; // goal.targetAmount
}) {
  const { oldCurrent, newCurrent, targetAmount } = options;

  // Avoid divide-by-zero
  const target = Math.max(targetAmount, 1);

  // Clamp between 0 and 1
  const oldProgress = Math.min(1, oldCurrent / target);
  const newProgress = Math.min(1, newCurrent / target);

  const delta = newProgress - oldProgress;
  if (delta <= 0) return 0;

  // 1.0 (100%) progress = 100 coins total
  // 0.01 (1%) progress   = 1 coin
  const coins = Math.round(delta * 100);
  return coins;
}

export const handleSignUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (user) {
      await setDoc(
        userRef(user.uid),
        {
          email: user.email,
          coins: 0,
          currentPet: null,
          currentCostumeId: null,
          unlockedPets: [],
          unlockedCostumes: [],
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error: any) {
    console.error("Sign-up error:", error);
    Alert.alert("Sign-up Failed", error.message);
  }
};

export const updateCostumeId = async (costumeId: number) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  await updateDoc(userRef(uid), {
    currentCostumeId: costumeId,
  });
};