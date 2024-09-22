import { COLORS } from "../constants";
import { Event, MyEvents } from "../screens";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export const MyEventsStackNavigator = () => {
    return (
        <Stack.Navigator
            id="MyEventsStackNavigator"
            screenOptions={{ headerTintColor: COLORS.white, headerShown: true, statusBarColor: COLORS.primary, headerStyle: { backgroundColor: COLORS.primary } }}>
            <Stack.Group>
                <Stack.Screen name="Mis Eventos" component={MyEvents} />
                <Stack.Screen name="Evento-MisEventos" options={{title: "Evento"}} component={Event}
                />
            </Stack.Group>
        </Stack.Navigator>
    );
}