// authContext.js
import React, { useMemo, useReducer } from "react";
import { login, register } from "../services/AuthService";
import { save, clearUserData } from "../services/LocalStorageService";
import { fetchUserImage } from "../services/userService";

export const AuthContext = React.createContext();

export const useAuthContext = () => {
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null
          };
        case 'SIGN_UP':
          return {
            ...prevState,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  const signIn = async (data) => {
    const res = await login(data.email, data.password);

    if (!res.success) {
      return { success: false, error: res.error };
    }

    if (!res.user || !res.token) {
      return { success: false, error: "LOGIN_FAILED" };
    }

    await save("userToken", res.token);
    await save("userData", JSON.stringify(res.user));

    dispatch({ type: "SIGN_IN", token: res.token });

    return { success: true };
  };

  const signOut = () => {
    dispatch({ type: 'SIGN_OUT' })
    clearUserData();
  }


  const signUp = async (data) => {
    const res = await register(data);
    if (!res || res.status >= 400) {
      return { error: "SIGN_UP_FAILED", message: res?.message || "Error en el registro" };
    }
    dispatch({ type: "SIGN_UP" });
    return { success: true };
  };


  const restoreToken = token => dispatch({ type: 'RESTORE_TOKEN', token });

  return useMemo(() => ({
    signIn,
    signOut,
    signUp,
    restoreToken,
    state,
    dispatch
  }), [state]);
};
