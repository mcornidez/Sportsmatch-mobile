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
import { EXPERTISE, SPORT, MONTHS, EVENT_STATUS } from "../constants/data";
import { COLORS, FONTS } from "../constants";
import { Avatar } from "@rneui/themed";
import { getDateComponents } from "../utils/datetime";
import { AirbnbRating } from "@rneui/base";
import { rateUser } from "../services/eventService";
import DefaultProfile from "../assets/default-profile.png";
import { fetchUserImage } from "../services/userService";
import CustomButton from "./CustomButton";
import { Spots } from "./Spots";

const Card = ({ props }) => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [userRate, setUserRate] = useState(3);
  const [loading, setLoading] = useState(true);
  const [isRated, setIsRated] = useState(props.isRated);

  const handlePress = () => {
    const routeName = `Evento${navigation.getId() === "MyEventsStackNavigator" ? "-MisEventos" : ""}`;
    navigation.navigate(routeName, { eventId: props.id, userImgURL: image, ownerRating : { rating: props.rating.rate, rateCount: props.rating.count}});
  };

  const postUserRating = async () => {
    try {
      await rateUser(props.id, userRate, props.owner.id);
      setModalVisible(false);
      setIsRated(true);
    } catch (error) {
      console.log(error);
      //TODO: send user feedback of this error
    }
  };
  const { day, month, hours, minutes } = getDateComponents(props?.schedule);

  const [image, setImage] = React.useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      const response = await fetchUserImage(props.owner.id);
      if (response.status == 200) {
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
                containerStyle={{ backgroundColor: COLORS.secondary }}
              />
              <Text style={styles.cardMidText}>{props.owner.firstName}</Text>
            </View>
            <View style={styles.verticalSection}>
              <View>
              <Text style={styles.cardBigText}>
                {SPORT[props.sportId - 1]}
              </Text>
              <Text style={[FONTS.body2, {fontWeight: 700, color: COLORS.darkgray}]}>
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
              {day} de {MONTHS[month - 1]} {hours}:{minutes} hs
            </Text>
            <Text style={[styles.cardSmText, { color: COLORS.white }]}>
              {props.location}
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
    marginVertical: 5,
    borderRadius: 8,
    flexDirection: "column",
    borderWidth: 3,
    borderColor: COLORS.primary,
    maxHeight: 180,
    minHeight: 180,
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: COLORS.white,
  },

  userSection: {
    paddingTop: 4,
    paddingHorizontal: 12,
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
    fontSize: 28,
    fontWeight: 700,
    color: COLORS.primary,
  },
  cardMidText: {
    fontSize: 22,
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
