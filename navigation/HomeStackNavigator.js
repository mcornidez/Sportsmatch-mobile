import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NewEvent, Home, Event } from '../screens';
import { View } from 'react-native';
import FilterModal from '../screens/Filters';

const Stack = createNativeStackNavigator();

const HomeStackNavigator = () => {
    const navigator = useNavigation();
    const [showFilters, setShowFilters] = React.useState(false);
    return (
        <Stack.Navigator
            screenOptions={{ headerTintColor: COLORS.white, headerShown: true, statusBarColor: COLORS.primary, headerStyle: {backgroundColor: COLORS.primary}}}>
            <Stack.Group>
                <Stack.Screen
                    options={{
                        headerRight: () => {
                            return (
                                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: 8}}>
                                    <Ionicons name='options' size={24} color={COLORS.white} onPress={() => {
                                        navigator.navigate("Filtros")
                                    }} />
                                    <Ionicons name='add' size={30} color={COLORS.white} onPress={() => navigator.navigate("Nuevo Evento")} />
                                </View>
                            )
                        }
                    }}
                    name="Inicio" component={Home}/>
                <Stack.Screen name="Evento" component={Event} />
                <Stack.Screen name="Nuevo Evento" component={NewEvent}
                />
            </Stack.Group>
            <Stack.Group screenOptions={{ presentation: 'fullScreenModal', headerShown: false}}>
                <Stack.Screen name="Filtros" component={FilterModal}/>
            </Stack.Group>
        </Stack.Navigator>
    );
}

export default HomeStackNavigator;