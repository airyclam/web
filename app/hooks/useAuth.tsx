import {
  AuthTokenResult,
  Role,
  useCurrentUserQuery,
} from "graphql-codegen/generated";
import Router from "next/router";
import { createContext, ReactNode, useContext, useEffect } from "react";

const AuthContext = createContext<AuthTokenResult>({} as AuthTokenResult);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useCurrentUserQuery();
  if (isLoading || error) return null;

  return (
    <AuthContext.Provider value={data?.currentUser as AuthTokenResult}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth({
  redirectTo = "/login",
  minRole = Role.Basic,
  redirect = true,
}: { redirectTo?: string; minRole?: Role; redirect?: boolean } = {}) {
  const user = useContext(AuthContext);

  useEffect(() => {
    if (redirect && !user) {
      void Router.push(redirectTo);
    }

    if (user) {
      switch (user.role) {
        case Role.Superuser:
          return;
        case Role.Staff:
          if (minRole === Role.Staff) return;
        case Role.Premium:
          if (minRole === Role.Premium) return;
        case Role.Basic:
          if (minRole === Role.Basic) return;
        default:
          void Router.push(redirectTo);
      }
    }
  }, [user, redirectTo, minRole, redirect]);

  return user;
}
