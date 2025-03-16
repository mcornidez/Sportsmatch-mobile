import React, { useContext, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image, ActivityIndicator,
} from "react-native";
import { COLORS } from "../constants";
import { Avatar, Chip, Divider } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import DefaultProfile from "../assets/default-profile.png";
import { NoContentMessage } from "../components/NoContentMessage";
import { UserContext } from "../contexts/UserContext";
import { useFocusEffect } from "@react-navigation/native";
import {fetchUserProfile} from "../services/userService";
import { getSports } from "../services/sportService";


const Profile = () => {
  const { currUser, setCurrUser } = useContext(UserContext);
  const [imageUrl, setImageUrl] = useState(
      currUser?.imageUrl || DefaultProfile
  );
  const [sportsData, setSportsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
      React.useCallback(() => {
        const refreshUser = async () => {
          try {
            setLoading(true);
            const [updatedUser, fetchedSports] = await Promise.all([
              fetchUserProfile(currUser.id),
              getSports()
            ]);
            setSportsData(fetchedSports);
            setCurrUser(updatedUser);
          } catch (err) {
            console.error("Error loading profile:", err);
          } finally {
            setLoading(false);
          }
        };

        refreshUser();
      }, [])
  );

  useEffect(() => {
    if (currUser?.imageUrl) {
      setImageUrl(currUser.imageUrl);
    }
  }, [currUser.imageUrl]);


  const formatPhoneNumber = (phoneNumberString) => {
    if (!phoneNumberString) return;
    let formatted = phoneNumberString.replace(
      /(\d{2})(\d{2})(\d{4})/,
      "$1 $2 $3"
    );
    return formatted;
  };
  

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
      ) : (
        <ScrollView contentContainerStyle={styles.mainContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            <Avatar
                size={108}
                rounded
                source={imageUrl ? { uri: imageUrl } : DefaultProfile}
                containerStyle={{ backgroundColor: COLORS.secondary }}
                onError={() => setImageUrl(DefaultProfile)}
            />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileTextName}>
                {currUser?.firstName} {currUser?.lastName}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  marginVertical: 5,
                }}
              >
                <Ionicons name="star" size={18} color={COLORS.secondary} />
                <Text style={styles.profileTextAge}> {Number(currUser?.rating.rate).toFixed(1)}</Text>
              </View>
              <Text style={styles.profileTextLocation}>
                {currUser?.rating.count} {currUser?.rating.count === 1 ? "partido" : "partidos"}
              </Text>
            </View>
          </View>
          <View style={styles.profileBody}>
            <View style={styles.bodySectionContainer}>
              <Text style={styles.bodyText}>Mis Datos</Text>
              <Divider width={3} style={{ width: "100%", marginBottom: 16 }} />
              <View style={styles.userDataContainer}>
                <Image
                  source={require("../assets/pin-48-blue.png")}
                  style={{ width: 23, height: 23 }}
                />
                <View style={styles.userDataDisplay}>
                  <Text style={styles.itemText}>
                    {"Argentina"}
                  </Text>
                </View>
              </View>
              <View style={styles.userDataContainer}>
                <Ionicons name="call" size={24} color={COLORS.primary} />
                <View style={styles.userDataDisplay}>
                  <Text style={styles.itemText}>{formatPhoneNumber(currUser?.phoneNumber)}</Text>
                </View>
              </View>
              <View style={styles.userDataContainer}>
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
                <View style={styles.userDataDisplay}>
                  <Text style={styles.itemText}>{currUser?.birthDate}</Text>
                </View>
              </View>
            </View>
            <View style={styles.bodySectionContainer}>
              <Text style={styles.bodyText}>Mis Deportes</Text>
              <Divider width={3} style={{ width: "100%", marginBottom: 16 }} />
              <View style={styles.chipContainer}>
                {currUser?.sports.length != 0 ? (
                    currUser.sports.map((sportId, idx) => {
                      const sport = sportsData.find((s) => s.id === sportId);
                      return (
                          <Chip
                              title={sport?.name || "Deporte desconocido"}
                              key={idx}
                              color={COLORS.primary}
                          />
                      );
                    })
                ) : (
                    <NoContentMessage message="No elegiste ningún deporte" />
                )}
              </View>
            </View>
            <View style={styles.bodySectionContainer}>
              <Text style={styles.bodyText}>Mis Ubicaciones</Text>
              <Divider width={3} style={{ width: "100%", marginBottom: 16 }} />
              <View style={styles.chipContainer}>
                {currUser?.locations && currUser.locations.length > 0 && currUser.locations.every(location => location !== null) ? (
                    currUser.locations.map((location, idx) => (
                        <Chip title={location} key={idx} color={COLORS.primary} />
                    ))
                ) : (
                    <NoContentMessage message="No elegiste ninguna ubicación" />
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: 24,
    paddingHorizontal: 24
  },

  profileHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    paddingHorizontal: 24,
    height: 140,
    justifyContent: "space-evenly",
    alignItems: "center",
    alignSelf: "stretch"
  },
  profileTextContainer: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    marginLeft: 20,
    maxWidth: "60%",
    minWidth: "42%",
  },
  profileTextLocation: {
    fontSize: 14,
    fontWeight: 400,
    color: COLORS.white,
  },
  profileTextName: {
    fontSize: 28,
    fontWeight: 500,
    color: COLORS.mediumGray,
  },

  profileTextAge: {
    fontSize: 14,
    color: COLORS.white,
  },
  bodyText: {
    fontSize: 26,
    fontWeight: 600,
    color: COLORS.primary,
    marginBottom: 8,
    marginRight: "auto",
  },
  itemText: {
    fontSize: 20,
    fontWeight: 300,
    paddingBottom: 2
  },
  profileBody: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    alignSelf: 'stretch'
  },
  chipContainer: {
    flex: 1,
    flexDirection: "row",
    alignSelf: 'stretch',
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  bodySectionContainer: {
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    paddingTop: 8,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  userDataContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 2,
    paddingVertical: 2
  },
  userDataDisplay: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: 8,
  },
  
});

export default Profile;
