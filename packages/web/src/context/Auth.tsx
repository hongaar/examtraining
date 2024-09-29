import {
  User as FirebaseUser,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import { createContext, useEffect, useMemo, useState } from "react";
import { USE_EMULATOR } from "../api";
import { useFirebase } from "../hooks";

type Props = {
  children: React.ReactNode;
};

type User = {
  email: string | null;
  name: string | null;
  picture: string | null;
} | null;

type Context = {
  user: User | null;
  login: (secret: string) => Promise<void>;
  logout: () => Promise<void>;
};

function toUser(user: FirebaseUser | null): User {
  if (user === null) {
    return null;
  }

  return {
    email: user.email,
    name: user.displayName,
    picture: user.photoURL,
  };
}

export const AuthContext = createContext<Context>(null as any);

export function AuthProvider({ children }: Props) {
  console.debug("Rendering AuthProvider");

  const [user, setUser] = useState<User>(null);
  const firebase = useFirebase();

  const auth = useMemo(() => {
    const auth = getAuth(firebase.app);

    if (USE_EMULATOR && process.env.NODE_ENV === "development") {
      try {
        connectAuthEmulator(auth, "http://localhost:9099");
      } catch {}
    }

    return auth;
  }, [firebase]);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(toUser(user));
      } else {
        setUser(null);
      }
    });
  }, [auth]);

  async function login(secret: string) {
    try {
      const userCredential = await signInWithCustomToken(auth, secret);

      console.log({ userCredential });
    } catch (error: any) {
      console.error(error);
    }
    // // This gives you a Google Access Token. You can use it to access the Google API.
    // const credential = GoogleAuthProvider.credentialFromResult(result);

    // if (!credential) {
    //   throw new Error("No credential");
    // }

    // console.log({ result, credential });

    // const token = credential.accessToken;

    // if (!token) {
    //   throw new Error("No token");
    // }

    // // The signed-in user info.
    // const user = result.user;

    // setUser(toUser(user));
  }

  async function logout() {
    signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
