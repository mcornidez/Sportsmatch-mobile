import React, { useEffect, useState } from "react";
import {ActivityIndicator, FlatList, Text} from "react-native";
import { View } from "react-native";
import EventStatus from "./EventStatus";
import { Divider } from "@rneui/base";
import MyEventCard from "./MyEventCard";
import { EVENT_STATUS, EXPERTISE } from "../constants/data";
import { getDateComponents } from "../utils/datetime";
import { removeParticipantAsOwner } from "../services/eventService";
import { COLORS } from "../constants";
import { Spots } from "./Spots";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { DateTime } from "luxon";
import { getSports } from "../services/sportService";

const MyEventList = ({ data, refetchEvent }) => {
  const [participantList, setParticipantsList] = useState([]);
  const [remaining, setRemaining] = useState(+data.item.remaining);
  const navigation = useNavigation();
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(true);

    useEffect(() => {
        setParticipantsList(data.item.participants);
    }, [data.item.participants]);

    useEffect(() => {
        const fetchSports = async () => {
            try {
                const sportsData = await getSports();
                setSports(sportsData);
            } catch (error) {
                console.error("Error loading sports:", error);
            } finally {
                setLoadingSports(false);
            }
        };

        fetchSports();
    }, []);

    let eventDate = DateTime.fromFormat(data.item.schedule, "yyyy-MM-dd HH:mm:ssZZ", { zone: "utc" });
    const today = DateTime.utc();
    const daysDiff = today.diff(eventDate, "days").days;

    if (!eventDate.isValid) {
        eventDate = DateTime.invalid("Fecha inválida");
    }

    if (data.item.eventStatus === EVENT_STATUS.FINALIZED && daysDiff > 7) {
        return null;
    }

    const formattedDate = eventDate.isValid ? `${eventDate.day}/${eventDate.month}` : "--/--";
    const formattedTime = eventDate.isValid ? eventDate.toFormat("HH:mm") : "--:--";

  const handleRemoveParticipant = async (eventId, participantId) => {
    try {
      await removeParticipantAsOwner(eventId, participantId);
      console.log(
        "Removing participant: ",
        participantId,
        " from event: ",
        eventId
      );
      await refetchEvent(eventId);
      setParticipantsList(
        participantList.filter(
          (participant) => participant.userId !== participantId
        )
      );
      setRemaining(remaining + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const renderMyEvent = () => {
    navigation.navigate("Evento-MisEventos", {
      eventId: data.item.id,
      ownerRating: {
        rating: data.item.rating.rate,
        rateCount: data.item.rating.count,
      },
      ownerId: data.item.owner.id,
    });
  };

  const sport = sports.find((s) => s.id === data.item.sportId)?.name || "Deporte desconocido";

  const formattedLocation = data.item.location?.split(",")[0] || "Ubicación desconocida";


    return (
    <View style={{ minWidth: "100%", paddingHorizontal: 24, paddingTop: 8 }}>
      <TouchableOpacity
        style={{
          flexDirection: "column",
          justifyContent: "center",
          marginVertical: 8,
          gap: 8,
          backgroundColor: COLORS.primary20,
          padding: 8,
          borderRadius: 8,
        }}
        onPress={renderMyEvent}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
            {loadingSports ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
                <Text style={{ fontSize: 24, fontWeight: "600" }}>{sport}</Text>
            )}
            <View style={{ alignItems: 'flex-end' }}>
                <EventStatus status={data.item.eventStatus} />
                {data.item.hasReservation && (
                    <View
                        style={{
                            backgroundColor: COLORS.primary,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 12,
                            alignSelf: "flex-end",
                            marginBottom: 4,
                            marginTop: 4,
                        }}
                    >
                        <Text style={{ color: COLORS.white, fontWeight: "bold", fontSize: 12 }}>
                            Con reserva
                        </Text>
                    </View>
                )}
            </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{ fontSize: 18, fontWeight: 600 }}
          >{formattedDate} {formattedTime} hs</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{ fontSize: 18, fontWeight: 600, color: COLORS.darkgray }}
          >
            {EXPERTISE[data.item.expertise - 1]}
          </Text>
          <Spots qty={remaining} alternative />
        </View>
      </TouchableOpacity>
      <FlatList
        data={participantList}
        renderItem={(listData) =>
          renderItem(
            listData.item,
            data.item.id,
            handleRemoveParticipant,
            data.item.eventStatus,
              refetchEvent
          )
        }
        style={{ flex: 1 }}
        keyExtractor={(item, index) => {
          return `${item.userId} + ${index} + ${item.id}}`;
        }}
        ListEmptyComponent={
          data.item.eventStatus !== EVENT_STATUS.FINALIZED && (
            <Text
              style={{ fontSize: 20, alignSelf: "center", marginVertical: 8 }}
            >
              Aún no hay participantes
            </Text>
          )
        }
      ></FlatList>
      <Divider
        width={3}
        style={{ width: "100%", marginTop: 10, alignSelf: "center" }}
      />
    </View>
  );
};

const renderItem = (data, eventId, handleRemoveParticipant, eventStatus, refetchEvent) => {
  return (
    <MyEventCard
      props={data}
      eventId={eventId}
      handleRemoveParticipant={handleRemoveParticipant}
      eventStatus={eventStatus}
      refetchEvent={refetchEvent}
    />
  );
};
export default MyEventList;
