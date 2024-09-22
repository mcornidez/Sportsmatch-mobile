import React, { useContext, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Profile from "../screens/Profile";
import EditProfile from "../screens/EditProfile";
import { COLORS } from "../constants";
import { useNavigation } from "@react-navigation/native";
import { Menu, MenuDivider, MenuItem } from "react-native-material-menu";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/authContext";

const Stack = createNativeStackNavigator();

const ProfileStackNavigator = () => {

  const [visible, setVisible] = useState(false);
  const navigator = useNavigation();
  const authContext = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ statusBarColor: COLORS.primary }}>
      <Stack.Group>
        <Stack.Screen
          options={{
            headerTintColor: COLORS.white, headerStyle: { backgroundColor: COLORS.primary },
            headerRight: () => {
              return (
                <Menu
                  visible={visible}
                  anchor={
                    <TouchableOpacity onPress={() => setVisible(!visible)}>
                      <Ionicons
                        name="menu"
                        size={24}
                        color={COLORS.white}
                      />
                    </TouchableOpacity>
                  }
                  onRequestClose={() => setVisible(!visible)}
                >
                  <MenuItem
                    onPress={() => {
                      navigator.navigate("Edit Profile");
                      setVisible(!visible);
                    }}
                  >
                    Editar perfil
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem
                    onPress={() => {
                      authContext.signOut();
                      setVisible(!visible);
                    }}
                  >
                    Cerrar sesión
                  </MenuItem>
                </Menu>
              );
            },
            headerTitle: "Perfil"
          }}
          name="MyProfile"
          component={Profile} />
        <Stack.Screen
          options={{
            headerTintColor: COLORS.white, statusBarColor:COLORS.primary, headerStyle: { backgroundColor: COLORS.primary },
            headerTitle: "Editar perfil"
          }}
          name="Edit Profile"
          component={EditProfile} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;
