import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "token";

interface AuthContextValue {
  token: string | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const saved = await AsyncStorage.getItem(TOKEN_KEY);

        if (mounted) {
          setToken(saved || null);
        }
      } catch (error) {
        console.warn("Could not restore local session", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    if (username.trim() !== "admin" || password !== "admin") {
      return false;
    }

    const demoToken = "demo_token";

    await AsyncStorage.setItem(TOKEN_KEY, demoToken);

    setToken(demoToken);

    return true;
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isLoading,
      signIn,
      signOut,
    }),
    [token, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){
    const context=useContext(AuthContext);

    if(!context){
        throw new Error('useAuth must be inside AuthProvider');
    }

    return context;
}