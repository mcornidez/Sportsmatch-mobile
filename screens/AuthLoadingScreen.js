import React, { useEffect, useCallback } from "react";
import { ActivityIndicator } from "react-native";
import { COLORS } from "../constants";

export default function AuthLoadingScreen({ navigation }) {
  // useEffect(
  //   useCallback(() => {
  //     async function fetchCurrentUser() {
  //       const response = await getCurrentUser();
  //       if (response.error) {
  //         navigation.reset({
  //           index: 0,
  //           routes: [{ name: "Login" }],
  //         });
  //       } else {
  //         navigation.reset({
  //           index: 0,
  //           routes: [{ name: "Tabs" }],
  //         });
  //       }
  //     }
  //     fetchCurrentUser();
  //   }, [])
  // );

  return (

    <ActivityIndicator
      size="large"
      color={COLORS.primary}
      style={{ alignSelf: "center", marginTop: "50%" }}
    />
  );
}
