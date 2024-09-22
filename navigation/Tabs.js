import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeStackNavigator from "./HomeStackNavigator";
import ProfileStackNavigator from "./ProfileStackNavigator";
import { MyEventsStackNavigator } from "./MyEventsStackNavigator";
import { COLORS } from "../constants";
import { MyEvents } from "../screens";
import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { getCurrentUserData, save } from "../services/LocalStorageService";
const Tab = createBottomTabNavigator();

const Tabs = () => {
  const [currUser, setCurrUserAndPersist] = useState();
  const [loading, setLoading] = useState(true); 

const setCurrUser = async (user) => {
  setCurrUserAndPersist(user);
  await save('userData', JSON.stringify(user));
}
  
  useEffect(() => {
    getCurrentUserData().then((user) => {
      setCurrUser(user);
      setLoading(false);
    })
  }, []);



  return (
    loading ? null :
    <UserContext.Provider value={{currUser, setCurrUser}}>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "HomeNavigator") {
            iconName = "home";
          } else if (route.name === "Perfil") {
            iconName = "person";
          } else if (route.name === "MisEventosNavigator") {
            iconName = "calendar";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        options={{
          headerShown: false,
          title: "Inicio",
        }}
        name="HomeNavigator"
        component={HomeStackNavigator}
      />
      <Tab.Screen name="MisEventosNavigator" component={MyEventsStackNavigator} options={{
          headerShown: false,
          title: "Mis Eventos",
        }} />
      <Tab.Screen
        options={{
          headerShown: false
        }}
        name="Perfil"
        component={ProfileStackNavigator}
      />
    </Tab.Navigator>
    </UserContext.Provider>
  );
};
export default Tabs;
