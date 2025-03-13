import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import {getFields, getAvailableTimeslots, getFieldsWithLocation} from "../services/fieldService";
import { getClubById } from "../services/clubService";
import { COLORS } from "../constants";
import { DateTime } from "luxon";
import {deleteEvent} from "../services/eventService";


const SearchFields = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const { eventId, sportId, date, time, duration, location } = route.params || {};

    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
        fetchFields();
    }, [sportId]);

    const fetchFields = async () => {
        setLoading(true);
        setRefreshing(true);
        setFields([]);
        try {
            let allFields = [];

            if (location === undefined) {
                allFields = await getFields();
            } else {
                allFields = await getFieldsWithLocation(location);
            }

            if (!Array.isArray(allFields) || allFields.length === 0) {
                console.log("⚠️ No se recibieron canchas desde el servidor.");
                setFields([]);
                return;
            }

            const filteredFields = allFields.filter(field =>
                field.sports.some(sport => sport.id === sportId)
            );

            const uniqueClubIds = [...new Set(filteredFields.map(field => field.club_id))];

            const clubs = await Promise.all(uniqueClubIds.map(async (clubId) => {
                try {
                    const club = await getClubById(clubId);
                    return club;
                } catch (error) {
                    console.error(`❌ Error obteniendo el club ${clubId}:`, error);
                    return null;
                }
            }));

            const validClubs = clubs.filter(club => club !== null);

            const clubMap = validClubs.reduce((acc, club) => {
                acc[club.id] = {
                    name: club.name,
                    location: club.location || "Ubicación no disponible",
                    address: club.address || "Dirección no disponible",
                };
                return acc;
            }, {});


            let allFieldTimeslots = [];

            for (const field of filteredFields) {
                try {
                    const availableSlots = await getAvailableTimeslots(field.id, date);

                    if (availableSlots.length > 0) {
                        const fieldTimeslots = availableSlots.map(slot => {
                            const startTime = DateTime.fromFormat(slot.start_time, "HH:mm:ss");
                            const endTime = DateTime.fromFormat(slot.end_time, "HH:mm:ss");
                            const slotDuration = endTime.diff(startTime, "minutes").minutes;
                            const clubInfo = clubMap[field.club_id] || { name: "Club desconocido", location: "Ubicación no disponible", address: "Dirección no disponible" };

                            return {
                                ...field,
                                clubName: clubInfo.name,
                                clubLocation: clubInfo.location,
                                clubAddress: clubInfo.address,
                                slotStart: slot.start_time,
                                slotEnd: slot.end_time,
                                slotId: slot.id,
                                slotDuration: slotDuration,
                            };
                        });

                        allFieldTimeslots = [...allFieldTimeslots, ...fieldTimeslots];
                    }
                } catch (error) {
                    console.error(`❌ Error obteniendo disponibilidad de la cancha ${field.id}:`, error);
                }
            }

            const userTime = DateTime.fromFormat(time, "HH:mm");
            const exactDuration = parseInt(duration, 10);
            let sortedSlots = [];

            // 1️⃣ Buscar coincidencia exacta en fecha, hora y duración
            const exactMatches = allFieldTimeslots.filter(slot =>
                slot.slotStart === userTime.toFormat("HH:mm:ss") &&
                slot.slotDuration === exactDuration
            );
            sortedSlots = [...sortedSlots, ...exactMatches];

            // 2️⃣ Buscar ±2 horas con la misma duración
            const flexibleTimeMatches = allFieldTimeslots.filter(slot => {
                const slotTime = DateTime.fromFormat(slot.slotStart, "HH:mm:ss");
                return (
                    Math.abs(slotTime.diff(userTime, "minutes").minutes) <= 120 &&
                    slot.slotDuration === exactDuration &&
                    !sortedSlots.includes(slot)
                );
            });
            sortedSlots = [...sortedSlots, ...flexibleTimeMatches];

            // 3️⃣ Buscar variando la duración pero manteniendo ±2 horas
            const flexibleDurationMatches = allFieldTimeslots.filter(slot => {
                const slotTime = DateTime.fromFormat(slot.slotStart, "HH:mm:ss");
                return (
                    Math.abs(slotTime.diff(userTime, "minutes").minutes) <= 120 &&
                    !sortedSlots.includes(slot)
                );
            });
            sortedSlots = [...sortedSlots, ...flexibleDurationMatches];

            setFields(sortedSlots);
        } catch (error) {
            console.error("❌ Error obteniendo canchas fetch fields:", error);
            setFields([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    const onRefresh = () => {
        fetchFields();
    };

    useFocusEffect(
        useCallback(() => {
            const onBackPress = async (e) => {
                if (eventId) {
                    try {
                        await deleteEvent(eventId);
                        console.log(`✅ Evento ${eventId} eliminado correctamente.`);
                    } catch (error) {
                        console.error(`❌ Error al eliminar el evento ${eventId}:`, error);
                    }
                }

                navigation.navigate("Nuevo Evento", { returnedFromSearchFields: true });
            };

            const unsubscribe = navigation.addListener("beforeRemove", onBackPress);

            return () => unsubscribe();
        }, [navigation, eventId])
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.card,
                selectedField === item.id ? styles.selectedCard : {}
            ]}
            onPress={() =>
                navigation.navigate("Reserva Cancha", {
                    eventId: eventId,
                    fieldId: item.id,
                    slotId: item.slotId,
                    clubName: item.clubName,
                    clubLocation: item.clubLocation,
                    clubAddress: item.clubAddress,
                    fieldName: item.name,
                    date,
                    slotStart: item.slotStart,
                    slotDuration: item.slotDuration,
                    capacity: item.capacity,
                    cost: item.cost,
                    description: item.description,
                })
            }
        >
            {/* Sección superior con el nombre del club y la cancha */}
            <View style={styles.section}>
                <View style={styles.infoContainer}>
                    <Text style={styles.clubName}>{item.clubName}</Text>
                    <Text style={styles.fieldName}>{item.name}</Text>
                    <Text style={styles.details}>
                        Capacidad: {item.capacity} jugadores
                    </Text>
                </View>
            </View>

            {/* Sección con precio y duración */}
            <View style={styles.priceSection}>
                <Text style={styles.priceText}>${item.cost}</Text>
                <Text style={styles.durationText}>{item.slot_duration} MIN</Text>
            </View>

            {/* Sección inferior con fecha y ubicación */}
            <View style={styles.bottomSection}>
                <Text style={[styles.cardSmText, { color: COLORS.white }]}>
                    {date} - {item.slotStart.split(":").slice(0, 2).join(":")} hs
                </Text>

                <Text style={[styles.cardSmText, { color: COLORS.white }]}>
                    {item.clubLocation || "Ubicación no disponible"}
                </Text>
            </View>
        </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Canchas disponibles</Text>
            <Text style={styles.subHeaderText}>{date} | {time} hs | {duration} min</Text>


            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
                <FlatList
                    data={fields}
                    renderItem={renderItem}
                    keyExtractor={(item) => `${item.id}-${item.slotId}`}
                    refreshControl={
                        <RefreshControl tintColor={COLORS.primary} refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={fields.length === 0 ? styles.noContentContainer : styles.contentContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>No hay canchas disponibles</Text>}
                />
            )}
        </View>
    );
};

export default SearchFields;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary10,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    headerText: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        color: COLORS.primary,
        textAlign: "center"
    },
    selectedCard: {
        backgroundColor: COLORS.primary20,
    },
    infoContainer: {
        flexDirection: "column",
    },
    fieldName: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.darkGray,
        marginTop: 5
    },
    details: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginTop: 5,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    noContentContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.darkGray,
        textAlign: "center",
    },
    card: {
        flex: 1,
        minWidth: "100%",
        marginVertical: 10,
        borderRadius: 8,
        flexDirection: "column",
        borderWidth: 3,
        borderColor: COLORS.primary,
        maxHeight: 150,
        minHeight: 150,
        justifyContent: "space-between",
        gap: 8,
        backgroundColor: COLORS.white,
    },
    userSection: {
        paddingTop: 4,
        paddingHorizontal: 10,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },

    bottomSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: -1,
        marginRight: -1,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    cardBigText: {
        fontSize: 20,
        fontWeight: 700,
        color: COLORS.primary,
        marginLeft: 6,
    },
    cardMidText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    cardSmText: {
        fontSize: 14,
        fontWeight: 500,
    },
    section: {
        flex: 1,
        alignSelf: 'stretch',
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingTop: 6
    },
    clubName: {
        fontSize: 22,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    priceSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
        paddingHorizontal: 10,
    },
    priceText: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.primary,
    },
    durationText: {
        fontSize: 16,
        fontWeight: "500",
        color: COLORS.darkGray,
    },
    subHeaderText: {
        fontSize: 18,
        fontWeight: "500",
        color: COLORS.darkGray,
        textAlign: "center",
        marginTop: 5,
    },
});
