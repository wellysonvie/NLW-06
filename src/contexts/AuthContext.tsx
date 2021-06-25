import { createContext, ReactNode, useEffect, useState } from "react";

import { auth, firebase } from "../services/firebase";

type User = {
  id: string;
  name: string;
  avatar: string;
};

type AuthContextType = {
  user: User | undefined;
  signInWithGoogle: () => Promise<void>;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextType);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>();

  function verifyAndSetUser(user: firebase.User) {
    const { displayName, photoURL, uid } = user;

    if (!displayName || !photoURL) {
      throw new Error("Missing information from Google Account.");
    }

    setUser({ id: uid, name: displayName, avatar: photoURL });
  }

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    const result = await auth.signInWithPopup(provider);

    if (result.user) {
      verifyAndSetUser(result.user);
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user: firebase.User | null) => {
        if (user) {
          verifyAndSetUser(user);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
