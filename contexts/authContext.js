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

  const signIn = async data => {
    const [userToken, userData] = await login(data.email, data.password);
    await save('userToken', userToken);
    const userImageUrlRes = await fetchUserImage(userData.id);
    if(userImageUrlRes.status == 200) userData.imageURL = userImageUrlRes.imageURL;
    await save('userData', JSON.stringify(userData));
    dispatch({ type: 'SIGN_IN', token: userToken });
  };

  const signOut = () => {
    dispatch({ type: 'SIGN_OUT' })
    clearUserData();
  }


  const signUp = async data => {
    const res = await register(data);
    console.log("RESPONSE: ", res);
    dispatch({ type: 'SIGN_UP' });
    return res;
  }

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
