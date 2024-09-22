import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../components/CustomButton";
import { EVENT_STATUS, EXPERTISE, SPORT, USER_STATUS } from "../constants/data";
import {
  fetchEventById,
  fetchParticipants,
  joinNewEvent,
  quitEvent,
} from "../services/eventService";
import { Avatar, Divider } from "@rneui/themed";
import { COLORS } from "../constants";
import { MONTHS } from "../constants/data";
import { getDateComponents } from "../utils/datetime";
import DefaultProfile from "../assets/default-profile.png";
import { UserContext } from "../contexts/UserContext";
import { fetchUserImage } from "../services/userService";

const Event = ({ route }) => {
  const { eventId, userImgURL, ownerRating, ownerId } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [eventParticipants, setEventParticipants] = useState(null);
  const [userStatus, setUserStatus] = useState(USER_STATUS.UNENROLLED);
  const [imageURL, setImageURL] = useState(userImgURL);
  const { currUser } = useContext(UserContext);
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchEventById(eventId).then((data) => {
      setEventData(data);
    });

    if (!route.params.userImgURL) {
      const fetchImage = async () => {
        const response = await fetchUserImage(ownerId);
        if (response.status == 200) {
          setImageURL(response.imageURL);
        }
        setLoading(false);
      };
      try {
        fetchImage();
      } catch (err) {
        console.error("ERROR fetching user data", err);
      }
    }
  }, [eventId, userImgURL, ownerId]);

  useEffect(() => {
    if (eventData)
      fetchParticipants(eventId).then((data) => {
        setEventParticipants(data);
      });
  }, [eventData]);

  useEffect(() => {
    if (eventParticipants) {
      eventParticipants.length > 0 &&
        eventParticipants.forEach((participant) => {
          if (participant.userId == currUser.id) {
            if (participant.participantStatus === true) {
              setUserStatus(USER_STATUS.ENROLLED);
            } else {
              setUserStatus(USER_STATUS.REQUESTING);
            }
          }
        });
      setLoading(false);
    }
  }, [eventParticipants]);

  const handleQuitEvent = async () => {
    setSubmitLoading(true);

    try {
      await quitEvent(eventData.id, currUser.id);
      setUserStatus(USER_STATUS.UNENROLLED);
    } catch (error) {
      console.log("Error quitting event. ", error);
    }
    setSubmitLoading(false);
  };

  const joinEvent = async () => {
    setSubmitLoading(true);
    console.log("Joining event", currUser);
    try {
      await joinNewEvent(eventId, currUser.id);
      setUserStatus(USER_STATUS.REQUESTING);
    } catch (error) {
      console.log(error);
    }
    setSubmitLoading(false);
  };

  const renderParticipantStatusMessage = () => {
    if (eventData.status === EVENT_STATUS.FINALIZED)
      return (
        <Text style={styles.participantStatusText}>Evento finalizado!</Text>
      );
    switch (userStatus) {
      case USER_STATUS.UNENROLLED:
        return null;
      case USER_STATUS.REQUESTING:
        return (
          <Text style={styles.participantStatusText}>
            Esperando confirmación del creador del evento
          </Text>
        );
      case USER_STATUS.ENROLLED:
        return (
          <Text style={styles.participantStatusText}>
            Ya estás anotado al evento!
          </Text>
        );
    }
  };

  const renderEventButton = (loading) => {
    if (eventData.status === EVENT_STATUS.FINALIZED) return null;
    switch (userStatus) {
      case USER_STATUS.UNENROLLED:
        return (
          <CustomButton
            title={"Anotarme"}
            onPress={joinEvent}
            isLoading={loading}
          />
        );
      case USER_STATUS.REQUESTING:
      case USER_STATUS.ENROLLED:
        return (
          <CustomButton
            title={"Desanotarme"}
            color={"red"}
            onPress={handleQuitEvent}
            isLoading={loading}
          />
        );
    }
  };

  const { day, month, hours, minutes } = getDateComponents(eventData?.schedule);

  return loading ? (
    <ActivityIndicator
      size="large"
      color={COLORS.primary}
      style={{ marginTop: "70%" }}
    />
  ) : (
    <View style={styles.eventContainer}>
      <View style={styles.eventHeader}>
        <Avatar
          rounded
          size={110}
          source={imageURL ? { uri: imageURL } : DefaultProfile}
          containerStyle={{ backgroundColor: COLORS.secondary }}
        />
        <View style={styles.headerData}>
          <Text style={styles.bigText}>{eventData.owner?.firstName}</Text>
          <View style={{ flexDirection: "row", alignSelf: "center" }}>
            <Ionicons name="star" size={18} color={COLORS.secondary} />
            <Text> {Number(ownerRating?.rating).toFixed(1)} / 5 </Text>
            <Text>
              {" "}
              | {ownerRating?.rateCount}{" "}
              {ownerRating?.rateCount !== 1 ? "partidos" : "partido"}
            </Text>
          </View>
          <Text style={{ ...styles.mediumText, alignSelf: "center" }}>
            {" "}
            {SPORT[eventData.sportId - 1]}
          </Text>
        </View>
      </View>
      <Divider width={4} style={{ width: "100%", marginBottom: -24 }} />
      <View style={styles.eventBody}>
        <View style={styles.bodySection}>
          <Text style={styles.bodyBigText}>Fecha:</Text>
          <Text style={styles.bodyMidText}>{`${day} de ${
            MONTHS[month - 1]
          } ${hours}:${minutes} hs`}</Text>
        </View>
        <Divider width={1} />
        <View style={styles.bodySection}>
          <Text style={styles.bodyBigText}>Nivel:</Text>
          <Text style={styles.bodyMidText}>
            {EXPERTISE[eventData.expertise - 1]}
          </Text>
        </View>
        <Divider width={1} />
        <View style={styles.bodySection}>
          <Text style={styles.bodyBigText}>Ubicación:</Text>
          <Text style={styles.bodyMidText}>{eventData.location}</Text>
        </View>
        <Divider width={1} />
        <View style={{ ...styles.bodySection }}>
          <Text style={styles.bodyBigText}>Descripción:</Text>
          <View style={{ width: 160 }}>
            <ScrollView style={{ maxHeight: 110 }}>
              <Text style={styles.bodyMidText}>
                {eventData.description == ""
                  ? "No hay descripcion"
                  : eventData.description}
              </Text>
            </ScrollView>
          </View>
        </View>
        <Divider width={1} />
        {!ownerId && renderParticipantStatusMessage()}
      </View>
      {!ownerId && (
        <View style={{ alignSelf: "stretch" }}>
          {renderEventButton(submitLoading)}
        </View>
      )}
    </View>
  );
};

export default Event;

const styles = StyleSheet.create({
  bodySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 24,
  },
  eventContainer: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-evenly",
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    alignSelf: "stretch",
  },

  headerData: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  bigText: {
    fontSize: 36,
    fontWeight: "bold",
    alignSelf: "center",
  },

  mediumText: {
    fontSize: 18,
  },

  bodyBigText: {
    fontSize: 25,
    fontWeight: "bold",
    marginRight: 16,
  },

  bodyMidText: {
    fontSize: 18,
    paddingTop: 4,
  },

  eventBody: {
    flexDirection: "column",
    alignSelf: "stretch",
    justifyContent: "space-evenly",
  },

  participantStatusText: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginTop: 16,
    textAlign: "center",
  },
});
