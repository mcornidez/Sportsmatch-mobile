import React, { useContext, useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { COLORS } from "../constants";
import { Avatar, Chip, Divider } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { SPORT } from "../constants/data";
import DefaultProfile from "../assets/default-profile.png";
import { NoContentMessage } from "../components/NoContentMessage";
import { UserContext } from "../contexts/UserContext";

const Profile = () => {
  const { currUser } = useContext(UserContext);

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
        <ScrollView contentContainerStyle={styles.mainContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            <Avatar
              size={108}
              rounded
              source={ currUser.imageURL ? { uri: currUser.imageURL } : DefaultProfile}
              containerStyle={{ backgroundColor: COLORS.secondary }}
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
                  currUser.sports.map((sport, idx) => {
                    return (
                      <Chip
                        title={SPORT[sport - 1]}
                        key={idx}
                        color={COLORS.primary}
                      />
                    );
                  })
                ) : (
                  <NoContentMessage message="No elegiste ningun deporte"/>
                )}
              </View>
            </View>
            <View style={styles.bodySectionContainer}>
              <Text style={styles.bodyText}>Mis Ubicaciones</Text>
              <Divider width={3} style={{ width: "100%", marginBottom: 16 }} />
              <View style={styles.chipContainer}>
                {currUser?.locations.length && 
                currUser.locations.every((location) => location !== null) != 0 ?
                 (
                  currUser.locations.map((location, idx) => {
                    return (
                      <Chip title={location} key={idx} color={COLORS.primary} />
                    );
                  })
                ) : (
                  <NoContentMessage message="No elegiste ninguna ubicación"/>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
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
