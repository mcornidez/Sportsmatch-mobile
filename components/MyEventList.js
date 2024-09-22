import React, { useEffect, useState } from "react";
import { FlatList, Text } from "react-native";
import { View } from "react-native";
import EventStatus from "./EventStatus";
import { Divider } from "@rneui/base";
import MyEventCard from "./MyEventCard";
import { EVENT_STATUS, EXPERTISE, SPORT } from "../constants/data";
import { getDateComponents } from "../utils/datetime";
import { removeParticipantAsOwner } from "../services/eventService";
import { COLORS } from "../constants";
import { Spots } from "./Spots";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

const MyEventList = ({ data }) => {
  const [participantList, setParticipantsList] = useState(
    data.item.participants
  );
  const [remaining, setRemaining] = useState(+data.item.remaining);
  const { hours, day, month, minutes } = getDateComponents(data.item.schedule);
  const navigation = useNavigation();

  const handleRemoveParticipant = async (eventId, participantId) => {
    try {
      await removeParticipantAsOwner(eventId, participantId);
      console.log(
        "Removing participant: ",
        participantId,
        " from event: ",
        eventId
      );
      setParticipantsList(
        participantList.filter(
          (participant) => participant.userId !== participantId
        )
      );
      setRemaining(remaining + 1);
    } catch (error) {
      console.log(error);
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
          <Text style={{ fontSize: 24, fontWeight: 600 }}>
            {SPORT[data.item.sportId - 1]}
          </Text>
          <EventStatus status={data.item.eventStatus} />
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 600 }}>
            {data.item.location}
          </Text>
          <Text
            style={{ fontSize: 18, fontWeight: 600 }}
          >{`${day}/${month} ${hours}:${minutes} hs`}</Text>
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
            data.item.eventStatus
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

const renderItem = (data, eventId, handleRemoveParticipant, eventStatus) => {
  return (
    <MyEventCard
      props={data}
      eventId={eventId}
      handleRemoveParticipant={handleRemoveParticipant}
      eventStatus={eventStatus}
    />
  );
};
export default MyEventList;
