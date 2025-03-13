import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { EXPERTISE, MONTHS, EVENT_STATUS } from "../constants/data";
import { COLORS, FONTS } from "../constants";
import { Avatar } from "@rneui/themed";
import {DateTime, Settings} from "luxon";
import { getDateComponents } from "../utils/datetime";
import { AirbnbRating } from "@rneui/base";
import { rateUser } from "../services/eventService";
import DefaultProfile from "../assets/default-profile.png";
import { fetchUserImage } from "../services/userService";
import CustomButton from "./CustomButton";
import { Spots } from "./Spots";
import { getSports } from "../services/sportService";

const Card = ({ props }) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [userRate, setUserRate] = useState(3);
  const [loading, setLoading] = useState(true);
  const [isRated, setIsRated] = useState(props.isRated);
  const [sports, setSports] = useState([]);

  const [image, setImage] = React.useState(null);

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

  let eventDate = DateTime.fromFormat(props.schedule,
      "yyyy-MM-dd HH:mm:ssZZ", { zone: "utc" }
  );
  const formattedDate = eventDate.toFormat("dd/MM");
  const formattedTime = eventDate.toFormat("HH:mm");

  const handlePress = () => {
    const routeName = `Evento${navigation.getId() === "MyEventsStackNavigator" ? "-MisEventos" : ""}`;
    navigation.navigate(routeName, {
      eventId: props.id,
      userImgURL: props.userImgURL,
      ownerRating : {
        rating: props.rating.rate,
        rateCount: props.rating.count
      }
    }
    );
  };

  const postUserRating = async () => {
    try {
      await rateUser(props.id, userRate, props.owner.id);
      setModalVisible(false);
      setIsRated(true);
    } catch (error) {
      console.error(error);
      //TODO: send user feedback of this error
    }
  };
  const { day, month, hours, minutes } = getDateComponents(props?.schedule);

  useEffect(() => {

    const fetchImage = async () => {
      const response = await fetchUserImage(props.owner.id);
      if (response === undefined)
        console.error("fetch image response undefined")
      if (response.status === 200) {
        setImage(response.imageURL);
      }
      setLoading(false);
    };

    try {
      fetchImage();
    } catch (err) {
      console.error("ERROR fetching user data", err);
    }
  }, []);

  const sport = sports.find((s) => s.id === props.sportId)?.name || "Deporte desconocido";

  const renderRating = () => {
    return (
      <AirbnbRating
        size={30}
        reviewSize={25}
        reviews={[
          "Muy malo",
          "Malo",
          "Normal",
          "Bueno",
          "Muy bueno",
        ]}
        onFinishRating={setUserRate}
      />);
  }

  return (
    <>
        <TouchableOpacity style={styles.card} onPress={handlePress}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <Pressable
              style={styles.centeredView}
              onPress={(e) =>
                e.target == e.currentTarget && setModalVisible(false)
              }
            >
              <View style={styles.modalView}>
                <Text style={styles.modalText}>
                  ¿Cómo fue jugar con este participante?
                </Text>
                <View style={{ marginBottom: 20 }}>
                  {renderRating()}
                </View>
                <CustomButton
                  title="Enviar puntuación"
                  onPress={postUserRating}
                />
              </View>
            </Pressable>
          </Modal>
          <View style={styles.section}>
            <View style={styles.userSection}>
              <Avatar
                rounded
                size={100}
                source={image ? { uri: image } : DefaultProfile}
                containerStyle={styles.avatar}
              />
              <Text style={styles.cardMidText}>{props.owner.firstName}</Text>
            </View>
            <View style={styles.verticalSection}>
              <View>
              <Text style={styles.cardBigText}>
                {sport}
              </Text>
              <Text style={styles.cardExpertise}>
                {EXPERTISE[props.expertise - 1]}
              </Text>
              </View>
              {props.eventStatus === EVENT_STATUS.FINALIZED ? (
                isRated ? (
                  <Text style={{ ...styles.cardMidText, marginBottom: 2 }}>
                    Finalizado
                  </Text>
                ) : (
                  <View style={{width: '80%'}}>
                    <CustomButton
                      title="Puntuar"
                      onPress={() => setModalVisible(true)}
                    />
                  </View>
                )
              ) : (
                <Spots qty={props.remaining}/>
              )}
            </View>
          </View>
          <View style={styles.bottomSection}>
            <Text style={[styles.cardSmText, { color: COLORS.white }]}>
              {formattedDate} {formattedTime} hs
            </Text>
            <Text style={[styles.cardSmText, { color: COLORS.white }]}>
              <Text style={[styles.cardSmText, { color: COLORS.white }]}>
                {props.location?.split(',')[0] || "Ubicación desconocida"}
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
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

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 10,
    marginBottom: 5,
    backgroundColor: COLORS.primary,
  },

  cardBigText: {
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.primary,
    marginLeft: 6,
  },
  cardExpertise: {
    fontSize: 16,
    fontWeight: 500,
    color: COLORS.darkgray,
    marginLeft: 6,
    marginTop: 5
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
  verticalSection: {
    flex: 1,
    flexDirection: "column",
    justifyContent: 'space-between',
    maxWidth: '48%',
    height: '100%',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
  },
});

export default Card;
