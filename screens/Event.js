import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator, TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../components/CustomButton";
import { EVENT_STATUS, EXPERTISE, USER_STATUS } from "../constants/data";
import {
  fetchEventById,
  fetchParticipants,
  joinNewEvent,
  quitEvent,
} from "../services/eventService";
import { Avatar, Divider } from "@rneui/themed";
import { COLORS } from "../constants";
import { useNavigation } from "@react-navigation/native";
import { MONTHS } from "../constants/data";
import { getDateComponents } from "../utils/datetime";
import DefaultProfile from "../assets/default-profile.png";
import { UserContext } from "../contexts/UserContext";
import { fetchUserImage } from "../services/userService";
import { fetchReservationsByEvent } from "../services/reservationService";
import {DateTime} from "luxon";
import {AuthContext} from "../contexts/authContext";
import * as SecureStore from "expo-secure-store";
import { getSports } from "../services/sportService";

const Event = ({ route }) => {
  const { eventId, userImgURL, ownerRating, ownerId } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [eventParticipants, setEventParticipants] = useState(null);
  const [userStatus, setUserStatus] = useState(USER_STATUS.UNENROLLED);
  const [sports, setSports] = useState([]);
  const [imageUrl, setimageUrl] = useState(userImgURL);
  const { currUser } = useContext(UserContext);
  const [eventData, setEventData] = useState(null);
  const [reservationData, setReservationData] = useState(null);
  const { signOut } = useContext(AuthContext);
  const navigation = useNavigation();
  const [loadingReservation, setLoadingReservation] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const reservations = await fetchReservationsByEvent(eventId);
        if (Array.isArray(reservations) && reservations.length > 0) {
          setReservationData(reservations[0]);
        } else {
          setReservationData(null);
        }
      } catch (error) {
        console.error("❌ Error obteniendo la reserva:", error);
        setReservationData(null);
      } finally {
        setLoadingReservation(false);
      }
    };

    fetchReservation();
  }, [eventId]);



  useEffect(() => {
    setLoading(true);
    fetchEventById(eventId).then((data) => {
      setEventData(data);
    });

    if (!route.params.userImgURL) {
      const fetchImage = async () => {
        const response = await fetchUserImage(ownerId);
        if (response.status == 200) {
          setimageUrl(response.imageUrl);
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


  useEffect(() => {
    const fetchSports = async () => {
      try {
        const sportsData = await getSports();
        setSports(sportsData);
      } catch (error) {
        console.error("Error loading sports:", error);
      }
    };

    fetchSports();
  }, []);


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
    try {
      await joinNewEvent(eventId, currUser.id);

      setUserStatus(USER_STATUS.REQUESTING);
    } catch (error) {
      console.error(error);
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

    if (loadingReservation || !eventData || !currUser) {
      return null;
    }

    if (eventData.status === EVENT_STATUS.FINALIZED) {
      return null;
    }

    const isOwner = eventData.owner?.id.toString() === currUser.id.toString();
    const isReservationCancelled = reservationData?.status === "cancelled";

    return (
        <>
          {isOwner && (!reservationData || isReservationCancelled) && (
              <CustomButton
                  title={"Buscar Cancha"}
                  onPress={() =>
                      navigation.navigate("Buscar Canchas", {
                        eventId: eventId,
                        sportId: eventData.sportId,
                        location: eventData.location,
                        date: formattedDate,
                        time: formattedTime,
                        duration: eventData.duration,
                        origin: "Event"
                      })
                  }
                  color={COLORS.primary}
              />
          )}

          {!isOwner && (
              userStatus === USER_STATUS.UNENROLLED ? (
                  <CustomButton
                      title={"Anotarme"}
                      onPress={joinEvent}
                      isLoading={loading}
                  />
              ) : (
                  <CustomButton
                      title={"Desanotarme"}
                      color={"red"}
                      onPress={handleQuitEvent}
                      isLoading={loading}
                  />
              )
          )}

        </>
    );
  };

  let eventDate = eventData?.schedule
      ? DateTime.fromFormat(eventData.schedule, "yyyy-MM-dd HH:mm:ssZZ", { zone: "utc" })
      : null;

  const formattedDate = eventDate ? `${eventDate.day} de ${MONTHS[eventDate.month - 1]}` : "-- de --";
  const formattedTime = eventDate ? eventDate.toFormat("HH:mm") : "--:--";

  const sportName = sports.find((s) => s.id === eventData?.sportId)?.name || "Deporte desconocido";

  const eventDuration = eventData?.duration ? eventData.duration : 0;

  const handleReservationDetail = () => {
    const isOwner = eventData.owner?.id.toString() === currUser.id.toString();

    navigation.navigate("ReservationDetail", { eventId, isOwner, eventDate, eventDuration });
  };

  {renderEventButton()}

  return loading || !eventData ? (
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
            source={
              eventData.owner?.imageUrl
                  ? { uri: eventData.owner.imageUrl }
                  : userImgURL
                      ? { uri: userImgURL }
                      : DefaultProfile
            }
            containerStyle={styles.avatar}
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
            {sportName}
          </Text>
        </View>
      </View>
      <Divider width={4} style={{ width: "100%", marginBottom: -24 }} />
      <View style={styles.eventBody}>
        <View style={styles.bodySection}>
          <Text style={styles.bodyBigText}>Fecha:</Text>
          <Text style={styles.bodyMidText}>{`${formattedDate} ${formattedTime} hs`}</Text>
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
          <Text
              style={styles.bodyMidText}
              numberOfLines={1}
              ellipsizeMode="tail"
          >
            {eventData.location?.split(",")[0] || "Ubicación desconocida"}
          </Text>
        </View>

        <Divider width={1} />
        {eventData.description && eventData.description.trim() !== "" && (
            <>
              <View style={{ ...styles.bodySection }}>
                <Text style={styles.bodyBigText}>Descripción:</Text>
                <View style={{ width: 160 }}>
                  <ScrollView style={{ maxHeight: 110 }}>
                    <Text style={styles.bodyMidText}>
                      {eventData.description}
                    </Text>
                  </ScrollView>
                </View>
              </View>
            </>
        )}
        <Divider width={1} />
        {!ownerId && renderParticipantStatusMessage()}

        {loadingReservation ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
            <>
              {eventData && renderEventButton()}
              {reservationData && (
                  <CustomButton title={"Detalle de reserva"} onPress={handleReservationDetail} color={COLORS.primary} />
              )}
            </>
        )}
      </View>
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
    fontSize: 26,
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

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
    marginBottom: 5,
    backgroundColor: COLORS.primary,
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
