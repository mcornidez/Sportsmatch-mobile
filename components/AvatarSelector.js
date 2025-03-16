import React, { useState } from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text } from "react-native";
import { COLORS } from "../constants";

const baseUrl = "https://new-sportsmatch-user-pictures.s3.us-east-1.amazonaws.com/avatars/";

const avatars = [
    `${baseUrl}1.png`,
    `${baseUrl}2.png`,
    `${baseUrl}3.png`,
    `${baseUrl}4.png`,
    `${baseUrl}5.png`,
    `${baseUrl}6.png`,
];

const AvatarSelector = ({ selectedAvatar, onSelect }) => {
    const [selected, setSelected] = useState(selectedAvatar || null);

    const handleSelect = (avatarUrl) => {
        setSelected(avatarUrl);
        onSelect(avatarUrl);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Elige tu avatar</Text>
            <View style={styles.avatarContainer}>
                {avatars.map((avatar, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => handleSelect(avatar)}
                        style={[
                            styles.avatarWrapper,
                            selected === avatar && styles.selected,
                        ]}
                    >
                        <Image source={{ uri: avatar }} style={styles.avatar} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: COLORS.primary,
        marginBottom: 12,
    },
    avatarContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 12,
    },
    avatarWrapper: {
        borderWidth: 2,
        borderColor: "transparent",
        borderRadius: 12,
        padding: 4,
    },
    selected: {
        borderColor: COLORS.primary,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
});

export default AvatarSelector;
