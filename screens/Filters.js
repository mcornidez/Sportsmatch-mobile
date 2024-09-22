import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { EXPERTISE, HORARIOS, LOCATIONS } from "../constants/data";
import { formatDate, showDatepicker } from "../utils/datetime";
import { Chip } from "@rneui/themed";
import { COLORS } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from '../components/CustomButton'
import CustomDropdown from "../components/CustomDropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";


const FilterModal = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const STORAGE_KEY = 'selectedChips';
    const { control, handleSubmit, formState: { isDirty, errors }, setValue, reset } = useForm(
        {
            defaultValues: {
                schedule: [],
                date: "",
                expertise: "",
                location: "",
            }
        }
    );
    useEffect(() => {
        const loadFilterData = async () => {
            try {
                const storedFormValues = await AsyncStorage.getItem(STORAGE_KEY);
                if (storedFormValues !== null) {
                    const formValues = JSON.parse(storedFormValues);
                    Object.entries(formValues).forEach(([fieldName, fieldValue]) => {
                        if (fieldValue !== undefined) {
                            if (fieldName === "date") {
                                fieldValue = fieldValue !== "" ? new Date(fieldValue) : "";
                            }
                            console.log("SETIE", fieldName, fieldValue);
                            setValue(fieldName, fieldValue, { shouldDirty: true });
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading filter data:', error);
            }
        };
        loadFilterData();
    }, []);

    const onSubmit = (data) => {
        console.log("FILTROS", data);
        navigation.navigate("Inicio", { filters: JSON.stringify(data) });
        try {
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving filter data:', error);
        }
    }

    const closeFilters = () => {
        cleanFilters();
        navigation.goBack();
    }


    const cleanFilters = () => {
        reset();
        AsyncStorage.removeItem(STORAGE_KEY);
    }

    const toggleChipSelection = async (index, selectedChips, onChange) => {
        const isSelected = selectedChips.includes(index);
        const newSelectedChips = isSelected
            ? selectedChips.filter((chipIdx) => chipIdx !== index)
            : [...selectedChips, index];
        onChange(newSelectedChips);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary10 }}>
            <View style={styles.viewContainer}>
                <Text style={[styles.bigText, { alignSelf: 'center' }]}>
                    Filtros de búsqueda
                </Text>
                <View style={{flex: 1,flexDirection: 'column', gap: 30, justifyContent: 'center'}}>
                        <View>
                            <Text style={styles.sectionTitle}>Ubicacion: </Text>
                            <Controller control={control} rules={{ required: false }} render={({ field }) => {
                                return (
                                    <CustomDropdown
                                        setSelected={field.onChange}
                                        selected={field.value}
                                        data={LOCATIONS}
                                        search={false}
                                        name="ubicación"
                                        showLabel={false}
                                    />)
                            }}
                                name="location" />
                        </View>
                        <View>
                            <Text style={styles.sectionTitle}>Nivel de juego: </Text>
                            <Controller control={control} rules={{ required: false }} render={({ field }) => (
                                <CustomDropdown
                                    setSelected={field.onChange}
                                    selected={field.value}
                                    data={EXPERTISE}
                                    name="nivel"
                                    showLabel={false}
                                />)}
                                name="expertise" />
                        </View>
                        <View>
                            <Text style={styles.sectionTitle}>Fecha:</Text>
                            <Controller control={control} rules={{ required: false }} render={({ field }) => {
                                return (
                                    Platform.OS === 'ios' ?
                                        <>
                                            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.dateTimeContainer}>
                                                <Text>{field.value == "" ? "Elija una fecha" : formatDate(field.value)}</Text>
                                            </TouchableOpacity>
                                            <DateTimePickerModal
                                                isVisible={modalVisible}
                                                date={field.value == "" ? new Date() : field.value}
                                                minimumDate={new Date()}
                                                backdropStyleIOS={{ backgroundColor: COLORS.primary10 }}
                                                style={{ backgroundColor: COLORS.primary10 }}
                                                headerTextIOS="Selecciona una fecha"
                                                onConfirm={(date) => {
                                                    setModalVisible(false);
                                                    field.onChange(date);
                                                }}
                                                onCancel={() => setModalVisible(false)}
                                            />
                                        </>

                                        :
                                        <TouchableOpacity onPress={() => showDatepicker(field)} style={styles.dateTimeContainer}>
                                            <Text>{field.value == "" ? "Elija una fecha" : formatDate(field.value)}</Text>
                                        </TouchableOpacity>

                                )
                            }} name="date" />
                        </View>
                        <View>
                            <Text style={styles.sectionTitle}>Horario:</Text>
                            <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', marginVertical: 8, paddingVertical: 14 }}>
                                <Controller control={control} rules={{ required: false }} defaultValue={[]} render={({ field }) =>
                                (
                                    HORARIOS.map((horario, idx) => {
                                        const isSelected = field.value.includes(idx)
                                        return (
                                            <Chip title={horario} buttonStyle={{ borderColor: COLORS.primary, borderWidth: 1 }}
                                                titleStyle={{ color: !isSelected ? COLORS.primary : COLORS.white }} key={idx} color={COLORS.primary}
                                                type={isSelected ? 'solid' : 'outline'} onPress={() => toggleChipSelection(idx, field.value, field.onChange)} />
                                        )
                                    })
                                )
                                }
                                    name="schedule" />
                            </View>

                        </View>
                </View>
                <View style={styles.buttonContainer}>
                    {isDirty &&
                        <View style={{ width: '45%'}}>
                            <CustomButton title={"Limpiar"} color={COLORS.primary} onPress={cleanFilters} filled={false} />
                        </View>
                    }
                    <View style={isDirty ? { width: '45%' }: {width: '100%'}}>
                        <CustomButton title={"Guardar"} color={COLORS.primary} onPress={handleSubmit(onSubmit)} />
                    </View>
                </View>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    viewContainer: {
        height: '100%',
        flexDirection: 'column',
        paddingHorizontal: 24,
        paddingVertical: 42,
        justifyContent: 'space-between',
        backgroundColor: COLORS.primary10
    },
    bigText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    dateTimeContainer: {
        borderRadius: 10,
        paddingVertical: 20,
        paddingHorizontal: 8,

        marginVertical: 10,
        borderColor: '#aeaeae',
        borderWidth: 1,
    },
    buttonContainer: {
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});


export default FilterModal;