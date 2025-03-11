import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { Home, Event } from '../screens';
import { Pressable, View } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import FilterModal from '../screens/Filters';
import SearchFields from "../screens/SearchFields";
import NewEvent from "../screens/NewEvent";
import FieldReservation from "../screens/FieldReservation";

const Stack = createNativeStackNavigator();

const HomeStackNavigator = () => {
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
                    headerRight: () => <HeaderRight />
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
};

const HeaderRight = () => {
    const navigation = useNavigation();

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5, // 🔥 Espacio reducido para que no se vean tan separados
                pointerEvents: "box-none",
            }}
        >
            {/* Botón de Filtros */}
            <Pressable
                onPress={() => {
                    console.log("Botón Filtros presionado");
                    navigation.navigate("Filtros");
                }}
                style={{
                    paddingHorizontal: 6, // 🔥 Ajuste de tamaño
                    paddingVertical: 6,
                    borderRadius: 6
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="options" size={28} color={COLORS.white} />
            </Pressable>

            {/* Botón de Agregar Evento */}
            <Pressable
                onPress={() => {
                    console.log("Botón + presionado");
                    navigation.navigate("Nuevo Evento");
                }}
                style={{
                    paddingHorizontal: 6, // 🔥 Ajuste de tamaño
                    paddingVertical: 6,
                    borderRadius: 6
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="add" size={28} color={COLORS.white} />
            </Pressable>
        </View>
    );
};

export default HomeStackNavigator;
