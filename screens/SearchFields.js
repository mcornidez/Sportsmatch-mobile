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
            // 1️⃣ Obtener canchas
            let allFields = location ? await getFieldsWithLocation(location) : await getFields();

            if (!Array.isArray(allFields) || allFields.length === 0) {
                setFields([]);
                return;
            }

            // 2️⃣ Filtrar canchas por deporte
            const filteredFields = allFields.filter(field =>
                field.sports.some(sport => sport.id === sportId)
            );

            const uniqueClubIds = [...new Set(filteredFields.map(field => field.club_id))];

            const clubs = await Promise.all(uniqueClubIds.map(clubId => getClubById(clubId)));
            const clubMap = clubs.reduce((acc, club) => {
                acc[club.id] = club;
                return acc;
            }, {});

            // 3️⃣ Obtener slots de disponibilidad para cada cancha
            const allFieldSlots = [];

            for (const field of filteredFields) {
                const slots = await getAvailableTimeslots(field.id, date);

                const validSlots = slots.filter(s => {
                    const slotDateTime = DateTime.fromFormat(`${s.availability_date} ${s.start_time}`, "yyyy-MM-dd HH:mm:ss");
                    const now = DateTime.utc();
                    return s.slotStatus === "available" && slotDateTime > now;
                });

                validSlots.forEach(slot => {
                    const startTime = DateTime.fromFormat(slot.start_time, "HH:mm:ss");
                    const endTime = DateTime.fromFormat(slot.end_time, "HH:mm:ss");
                    const slotDuration = endTime.diff(startTime, "minutes").minutes;
                    const clubInfo = clubMap[field.club_id] || {};

                    allFieldSlots.push({
                        ...field,
                        clubName: clubInfo.name || "Club desconocido",
                        clubLocation: clubInfo.location || "Ubicación no disponible",
                        clubAddress: clubInfo.address || "Dirección no disponible",
                        slotId: slot.id,
                        slotStart: slot.start_time,
                        slotEnd: slot.end_time,
                        slotDuration,
                    });
                });
            }

            // 4️⃣ Filtrado por ±1 slotDuration
            const userTime = DateTime.fromFormat(time, "HH:mm");

            const matchedSlots = allFieldSlots.filter(slot => {
                const slotStartTime = DateTime.fromFormat(slot.slotStart, "HH:mm:ss");
                const slotEndTime = DateTime.fromFormat(slot.slotEnd, "HH:mm:ss");
                const userDateTime = DateTime.fromFormat(time, "HH:mm");

                const diff = userDateTime.diff(slotStartTime, "minutes").minutes;

                // Aceptamos si userTime está máximo 1 slotDuration (casi 2) después del slotStart
                return diff >= 0 && diff <= (slot.slotDuration*2-1);
            });



            setFields(matchedSlots);
        } catch (error) {
            console.error("❌ Error obteniendo canchas:", error);
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
                if (route.params?.origin === "NewEvent") {
                    if (eventId) {
                        try {
                            await deleteEvent(eventId);
                            console.log(`✅ Evento ${eventId} eliminado correctamente.`);
                        } catch (error) {
                            console.error(`❌ Error al eliminar el evento ${eventId}:`, error);
                        }
                    }
                    navigation.navigate("Nuevo Evento", { returnedFromSearchFields: true });
                } else {
                    navigation.navigate("Event", { eventId, ownerId: null });
                }
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
                    {item.location || "Ubicación no disponible"}
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
