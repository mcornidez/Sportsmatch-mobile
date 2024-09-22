import React, { useEffect } from "react";
import 'react-native-gesture-handler';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts } from "expo-font";
import Tabs from "./navigation/Tabs";
import { Login, Register, ConfirmSignUp } from "./screens";
import { useAuthContext, AuthContext } from "./contexts/authContext";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { getCurrUserJWT } from "./services/LocalStorageService";
import { COLORS } from "./constants";

const Stack = createStackNavigator();

const App = () => {
  const authContext = useAuthContext();

  useEffect(() => {
    const restoreUserToken = async () => {
      let userToken;
      try {
        userToken = await getCurrUserJWT();
      } catch (err) {
        console.error("Failed: ", err);
      }
      authContext.restoreToken(userToken);
    };
    restoreUserToken();
  }, []);

  const [loaded] = useFonts({
    "Roboto-Black": require("./assets/fonts/Roboto-Black.ttf"),
    "Roboto-Bold": require("./assets/fonts/Roboto-Bold.ttf"),
    "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ActionSheetProvider>
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              statusbarColor: COLORS.primary,
            }}
          >
            {authContext.state.userToken ? (
              <Stack.Screen name="Tabs" component={Tabs} />
            ) : (
              <>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen name="ConfirmSignUp" component={ConfirmSignUp} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </ActionSheetProvider>
  );
};

export default App;
