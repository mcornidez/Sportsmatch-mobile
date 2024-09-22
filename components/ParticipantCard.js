import React, { useEffect } from "react"
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button } from "@rneui/base";
import { COLORS } from "../constants";


const ParticipantCard = ({ userData }) => {
    return (
        <View style={styles.card}>
            <View style={{alignSelf: 'center'}}>
                <Avatar rounded size={60} source={require("../assets/default-profile.png")} containerStyle={{ backgroundColor: COLORS.secondary }} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.userText}>{userData.firstname} {userData.lastname}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginVertical: 5 }}>
                    <Ionicons name="star" size={18} color={COLORS.secondary} />
                    <Text style={styles.profileTextAge}>  {userData.rating} / 5</Text>
                </View>
            </View>
        </View>
    );
}

export default ParticipantCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        width: '85%',
        alignSelf: 'center',
        height: 75,
        marginVertical: 4,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        borderWidth: 1,
        borderRadius: 5,
    },
    textContainer: {
        flexDirection: 'column',
        padding: 8,
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '75%',
    },
    userText: {
        fontSize: 30,
        fontWeight: 600,
        marginLeft: 12
    }
});