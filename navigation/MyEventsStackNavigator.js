import { COLORS } from "../constants";
import { Event, MyEvents, NewPayment } from "../screens";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ReservationDetail from "../screens/ReservationDetail";

const Stack = createNativeStackNavigator();

export const MyEventsStackNavigator = () => {
    return (
        <Stack.Navigator
            id="MyEventsStackNavigator"
            screenOptions={{ headerTintColor: COLORS.white, headerShown: true, statusBarColor: COLORS.primary, headerStyle: { backgroundColor: COLORS.primary } }}>
            <Stack.Group>
                <Stack.Screen name="Mis Eventos" component={MyEvents} />
                <Stack.Screen name="Evento-MisEventos" options={{title: "Evento"}} component={Event}/>
                <Stack.Screen name="NewPayment" options={{title: "Pagar reserva"}} component={NewPayment} />
                <Stack.Screen name="ReservationDetail" options={{title: "Detalle de reserva"}} component={ReservationDetail} />
            </Stack.Group>
        </Stack.Navigator>
    );
}