import { useForm, Controller } from "react-hook-form";
import CustomButton from "../components/CustomButton";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { useState, useEffect, useContext } from "react";
import { COLORS, FONTS } from "../constants";
import { useNavigation } from "@react-navigation/native";
import Pill from "../components/Pill";
import { LOCATIONS, SPORT } from "../constants/data";
import { updateUser, updateUserImage } from "../services/userService";
import * as ImagePicker from "expo-image-picker";
import DefaultProfile from "../assets/default-profile.png";
import { Avatar } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import PhoneInput from "react-native-phone-number-input";
import { PhoneNumberUtil } from "google-libphonenumber";
import { UserContext } from "../contexts/UserContext";
import { CustomMultiDropdown } from "../components/CustomMultiDropdown";

const sports = [
  { key: 1, sportId: 1, title: SPORT[0] },
  { key: 2, sportId: 2, title: SPORT[1] },
  { key: 3, sportId: 3, title: SPORT[2] },
  { key: 4, sportId: 4, title: SPORT[3] },
  { key: 5, sportId: 5, title: SPORT[4] },
  { key: 6, sportId: 6, title: SPORT[5] },
];

const EditProfile = () => {
  const navigator = useNavigation();

  const [selectedSports, setSelectedSports] = useState([]);
  const { currUser, setCurrUser } = useContext(UserContext);
  const [currImg, setCurrImg] = useState({ uri: currUser.imageURL });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      locations: currUser.locations,
      phonenumber: currUser.phoneNumber,
      sports: currUser.sports,
    },
  });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [imageChanged, setImageChanged] = useState(false);
  const [error, setError] = useState();
  const [phoneConflictError, setPhoneConflictError] = useState(null);
  const phoneUtil = PhoneNumberUtil.getInstance();
  const { showActionSheetWithOptions } = useActionSheet();

  const parsePhoneNumber = (phone) => {
    const parsedNumber = phoneUtil.parse(phone, "");
    const code = phoneUtil.getRegionCodeForNumber(parsedNumber);
    const national_number = phoneUtil
      .parseAndKeepRawInput(phone, code)
      .getNationalNumber();
    return {
      code: code,
      national_number: national_number.toString(),
    };
  };

  useEffect(() => {
    const { code, national_number } = parsePhoneNumber(currUser.phoneNumber);
    setCurrUser({
      ...currUser,
      country_code: code,
      national_number: national_number,
    });
    setSelectedSports(currUser.sports);
    setSelectedLocations(currUser.locations);
    setLoading(false);
  }, []);

  const validatePhone = (phone) => {
    const { code, national_number } = parsePhoneNumber(phone);
    return phoneUtil.isValidNumberForRegion(
      phoneUtil.parse(national_number, code),
      code
    );
  };

  const handleSportsSelect = (sport) => {
    if (selectedSports.includes(sport.sportId)) {
      setSelectedSports(
        selectedSports.filter((item) => item !== sport.sportId)
      );
    } else {
      setSelectedSports([...selectedSports, sport.sportId]);
    }
  };

  const isSelected = (sport) => {
    return selectedSports.includes(sport.sportId) ? sport.title : null;
  };

  const dataChanged = (data) => {
    const phoneChanged = data.phone !== currUser.phoneNumber;
    const sportsChanged = currUser.sports !== selectedSports;
    const locChanged = currUser.locations !== selectedLocations;

    return phoneChanged || sportsChanged || locChanged;
  };

  const submit = async (data) => {
    setSubmitLoading(true);
    setPhoneConflictError(null);
    console.log("DATA: ", data);
    const formData = {
      phoneNumber: data.phonenumber,
      locations: data.locations,
      sports: selectedSports,
    };

    var userUpdatedRes;
    if (dataChanged) {
      userUpdatedRes = await updateUser(currUser.id, formData);
    }
    if (userUpdatedRes && userUpdatedRes.failed) {
      if (userUpdatedRes.internalStatus === "CONFLICT") {
        setPhoneConflictError("Este número ya fue registrado.");
      } else {
        setError(userUpdatedRes.message);
      }
      setSubmitLoading(false);
      return;
    }
    if (imageChanged) {
      const imgUpdatedRes = await updateUserImage(currUser.id, currImg.base64);
      if (imgUpdatedRes.status == 200) {
        currUser.imageURL = currImg.uri;
        navigator.navigate("MyProfile");
      } else {
        setError(imgUpdatedRes.message);
        setSubmitLoading(false);
        return;
      }
    }
    setCurrUser({ ...currUser, ...formData });
    setSubmitLoading(false);
    navigator.navigate("MyProfile");
  };

  const editProfileImage = () => {
    const options = ["Elegir de la galeria", "Tomar foto", "Cancelar"];
    const libraryIndex = 0;
    const cameraIndex = 1;
    const cancelButtonIndex = 2;
    const title = "Selccionar foto";

    showActionSheetWithOptions(
      {
        options,
        title,
        libraryIndex,
        cameraIndex,
        cancelButtonIndex,
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case libraryIndex:
            handleLibraryLaunch();
            break;
          case cameraIndex:
            handleCameraLaunch();
            break;
        }
      }
    );
  };

  const handleCameraLaunch = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setCurrImg({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      });
      setImageChanged(true);
    }
  };

  const handleLibraryLaunch = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0,
      base64: true,
    });

    if (!result.canceled) {
      setCurrImg({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      });
      setImageChanged(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: "75%" }}
          />
        ) : (
          <View style={styles.scrollContainer}>
            <Avatar
              size={130}
              rounded
              source={currImg?.uri ? { uri: currImg.uri } : DefaultProfile}
            >
              <TouchableOpacity onPress={editProfileImage}>
                <Ionicons
                  name="ios-camera"
                  size={25}
                  style={{
                    position: "absolute",
                    color: COLORS.primary,
                    bottom: 0,
                    right: 0,
                  }}
                />
              </TouchableOpacity>
            </Avatar>
            {/* <View style={styles.inputContainer}>
                <Text style={styles.inputText}>Nombre</Text>
                <Controller
                  control={control}
                  rules={{
                    required: true,
                  }}
                  defaultValue={currUser.firstname}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      editable={false}
                      style={styles.input}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="name"
                />
              </View>
              {errors.name && (
                <Text style={styles.error}>Este campo no puede estar vacio</Text>
              )}
              <View style={styles.inputContainer}>
                <Text style={styles.inputText}>Apellido</Text>
                <Controller
                  control={control}
                  rules={{
                    required: true,
                  }}
                  defaultValue={currUser.lastname}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      editable={false}
                      style={styles.input}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="lastName"
                />
              </View>
              {errors.lastName && (
                <Text style={styles.error}>Este campo no puede estar vacio</Text>
              )}
              <View style={styles.inputContainer}>
                <Text style={styles.inputText}>Email</Text>
                <Controller
                  control={control}
                  rules={{
                    required: true,
                    pattern: {
                      matchPattern: (mail) => validateEmail(mail),
                      message: "Invalid email address",
                    },
                  }}
                  defaultValue={currUser.email}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      editable={false}
                      style={styles.input}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                  name="email"
                />
              </View>
              {errors.email && (
                <Text style={styles.error}>
                  Por favor ingrese un email válido
                </Text>
              )} */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>Número de teléfono</Text>
              <Controller
                control={control}
                rules={{
                  required: true,
                  validate: (phone) => {
                    return validatePhone(phone);
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <PhoneInput
                    defaultValue={currUser.national_number}
                    defaultCode={currUser.country_code}
                    layout="first"
                    containerStyle={styles.phoneContainer}
                    textContainerStyle={styles.phoneContainer.input}
                    flagButtonStyle={styles.phoneContainer.flag}
                    onChangeFormattedText={(text) => {
                      onChange(text);
                    }}
                  />
                )}
                name="phonenumber"
              />
            </View>
            {<Text style={styles.error}>{phoneConflictError}</Text>}
            {errors.phonenumber && (
              <Text style={styles.error}>
                Por favor ingrese un número válido.
              </Text>
            )}
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>Mis Deportes</Text>
              <View style={styles.sportsContainer}>
                {sports.map((sport, index) => {
                  return (
                    <Controller
                      key={index}
                      control={control}
                      render={() => (
                        <Pill
                          customStyle={styles.pillStyle}
                          props={sport}
                          handlePress={() => handleSportsSelect(sport)}
                          currentFilter={isSelected(sport)}
                        />
                      )}
                      name={`sports[${index}]`}
                      defaultValue={false}
                    />
                  );
                })}
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputText}>Mis Ubicaciones</Text>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <CustomMultiDropdown
                    data={LOCATIONS}
                    onChangeItem={onChange}
                    defaultValues={currUser.locations}
                  />
                )}
                name="locations"
              />
            </View>
            {error && (
              <Text style={{ color: "red", paddingTop: 15 }}>{error}</Text>
            )}
            <CustomButton
              title="Guardar"
              onPress={handleSubmit(submit)}
              isLoading={submitLoading}
            />
          </View>
        )}
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingBottom: 24,
    paddingTop: 20,
    paddingHorizontal: 24,
    gap: 12,
  },
  input: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: COLORS.primary,
    color: COLORS.primary,
    fontSize: 16,
  },
  inputContainer: {
    alignSelf: "stretch",
    gap: 5,
  },
  inputText: {
    ...FONTS.body2,
    color: COLORS.primary,
    marginLeft: 10,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.transparent,

    flag: {
      width: 55,
    },
    input: {
      backgroundColor: COLORS.transparent,
      paddingVertical: 12,
    },
  },
  sportsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 7,
    marginTop: 8,
  },
  pillStyle: {
    padding: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "black",

    selectedPill: {
      backgroundColor: COLORS.primary,
    },
  },
  nestedScroll: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  mainWrapper: {
    width: "100%",
  },
  saveBtn: {
    margin: 10,
    backgroundColor: COLORS.primary,
    width: 150,
    alignItems: "center",
    borderRadius: 15,
    padding: 8,
    marginTop: 30,
  },
  error: {
    ...FONTS.body3,
    color: "#F00",
    fontWeight: "700",
  },
});

export default EditProfile;
