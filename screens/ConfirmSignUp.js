import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useRoute } from "@react-navigation/native";
import { COLORS, FONTS } from "../constants";
import { verifyMail } from "../services/LocalStorageService";

const styles = StyleSheet.create({
  input: {
    height: 40,
    paddingLeft: 20,
    paddingRight: 20,
    borderWidth: 3,
    borderRadius: 20,
    borderColor: COLORS.primary,
    color: COLORS.primary,
  },
  inputContainer: {
    marginTop: 20,
    width: "65%",
    gap: 5,
  },
  inputText: {
    ...FONTS.body3,
    marginLeft: 10,
    color: COLORS.primary,
  },
  error: {
    ...FONTS.body3,
    color: "#F00",
    fontWeight: "700",
  },
  confirmBtn: {
    margin: 10,
    backgroundColor: COLORS.primary,
    width: 150,
    alignItems: "center",
    borderRadius: 15,
    padding: 8,
    marginTop: 30,
  }
});

const ConfirmSignUp = ({ navigation }) => {
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const route = useRoute();
  const email = route.params?.email;

  // const onConfirmPressed = async () => {
  //   verifyMail(email, code).then((response) => {
  //     if (response.error) {
  //       setError(response.error.message);
  //     } else {
  //       navigation.navigate("Login");
  //     }
  //   });
  // }

  return (
    <SafeAreaView
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 100,
      }}></SafeAreaView>
    // >
    //   <Text
    //     style={{
    //       ...FONTS.h1,
    //       fontSize: 40,
    //       color: COLORS.primary,
    //       paddingTop: 50,
    //     }}
    //   >
    //     SportsMatch
    //   </Text>
    //   {error && (
    //     <Text style={styles.error}>
    //       {error}
    //     </Text>
    //   )}
    //   <View style={styles.inputContainer}>
    //     <Text style={styles.inputText}>Confirmation code</Text>
    //     <TextInput
    //       style={styles.input}
    //       onChangeText={setCode}
    //       value={code}
    //       keyboardType="numeric"
    //     />
    //     <Text style={styles.inputText}>Please check your email for the confirmation code.</Text>
    //   </View>
    //   <TouchableOpacity
    //     style={styles.confirmBtn}
    //     onPress={onConfirmPressed}
    //   >
    //     <Text style={{ ...FONTS.h3, color: COLORS.white }}>Confirm</Text>
    //   </TouchableOpacity>
    // </SafeAreaView>
  );
};

export default ConfirmSignUp;
