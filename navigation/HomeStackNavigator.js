import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { Home, Event } from '../screens';
import { TouchableOpacity, View } from 'react-native';
import FilterModal from '../screens/Filters';
import SearchFields from "../screens/SearchFields";
import NewEvent from "../screens/NewEvent";
import FieldReservation from "../screens/FieldReservation";

const Stack = createNativeStackNavigator();

const HomeStackNavigator = ({ navigation }) => {
    return (
        <Stack.Navigator
            initialRouteName="Inicio"
            screenOptions={{
                headerTintColor: COLORS.white,
                headerStyle: { backgroundColor: COLORS.primary },
            }}
        >
            <Stack.Screen
                name="Inicio"
                component={Home}
                options={{
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10 }}>
                            {/* Botón de agregar evento */}
                            <TouchableOpacity onPress={() => navigation.navigate("Nuevo Evento")} style={{ paddingHorizontal: 6 }}>
                                <Ionicons name="add" size={26} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    )
                }}
            />
            <Stack.Screen name="Evento" component={Event} />
            <Stack.Screen name="Buscar Canchas" component={SearchFields} />
            <Stack.Screen name="Nuevo Evento" component={NewEvent} />
            <Stack.Screen name="Reserva Cancha" component={FieldReservation} />

            {/* Modales */}
            <Stack.Group screenOptions={{ presentation: 'fullScreenModal', headerShown: false }}>
                <Stack.Screen name="Filtros" component={FilterModal} />
            </Stack.Group>
        </Stack.Navigator>
    );
}

export default HomeStackNavigator;
