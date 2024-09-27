import {
  User as FirebaseUser,
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
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
  login: () => Promise<void>;
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

  const provider = useMemo(() => {
    const provider = new GoogleAuthProvider();

    // See https://developers.google.com/identity/protocols/oauth2/scopes#photoslibrary
    // provider.addScope("https://www.googleapis.com/auth/photoslibrary.readonly");

    return provider;
  }, []);

  // useEffect(() => {
  //   (window as any).login_from_google = (googleUser: any) => {
  //     const credential = GoogleAuthProvider.credential(googleUser.credential);
  //     signInWithCredential(auth, credential);
  //   };
  // }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(toUser(user));
      } else {
        setUser(null);
      }
    });
  }, [auth]);

  async function login() {
    try {
      await signInWithPopup(auth, provider);
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
