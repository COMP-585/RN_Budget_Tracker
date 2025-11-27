import { auth, db } from "@/FirebaseConfig";
import { arrayUnion, doc, onSnapshot, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";

export type UserProfile = {
  displayName?: string;
  coins?: number;
  currentPetId?: string | null;
  currentAccessory?: string | null;
  unlockedPets?: string[];
  unlockedAccessories?: string[];
  createdAt?: any; // or Firebase Timestamp if you prefer
};


// Reference helper
export const userRef = (uid: string) => doc(db, "users", uid);

export const initUserProfile = async (uid: string) => {
  await setDoc(userRef(uid), {
    coins: 0,
    currentPetId: null,
    currentAccessory: null,
    unlockedPets: [],
    unlockedAccessories: [],
    createdAt: serverTimestamp(),
  }, { merge: true });
};

/* Earn coins based on a budget increment or contribution */
export async function earnCoins(amount: number) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not logged in");

  const coinsToAdd = Math.ceil(amount * 10); // contribution($) * coin multiplier — adjust as needed
  if (coinsToAdd <= 0) return;

  const ref = userRef(uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const prevCoins = snap.exists() ? (snap.data()?.coins as number) || 0 : 0;

    tx.set(
      ref,
      { coins: prevCoins + coinsToAdd },
      { merge: true }
    );
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
export const unlockAccessory = async (accessoryId: string) => {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  await setDoc(
    userRef(uid),
    { unlockedAccessories: arrayUnion(accessoryId) },
    { merge: true }
  );
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
