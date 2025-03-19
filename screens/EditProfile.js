import {useForm, Controller} from "react-hook-form";
import CustomButton from "../components/CustomButton";
import {getSports} from "../services/sportService";
import {updatePhoneNumber} from "../services/userService";
import AvatarSelector from "../components/AvatarSelector";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard, Alert,
    Modal
} from "react-native";
import {useState, useEffect, useContext} from "react";
import {COLORS, FONTS} from "../constants";
import {useNavigation} from "@react-navigation/native";
import Pill from "../components/Pill";
import {LOCATIONS} from "../constants/data";
import {updateUser, updateUserImage} from "../services/userService";
import * as ImagePicker from "expo-image-picker";
import {Avatar} from "@rneui/themed";
import {Ionicons} from "@expo/vector-icons";
import {useActionSheet} from "@expo/react-native-action-sheet";
import PhoneInput from "react-native-phone-number-input";
import {PhoneNumberUtil} from "google-libphonenumber";
import {UserContext} from "../contexts/UserContext";
import {CustomMultiDropdown} from "../components/CustomMultiDropdown";
const DEFAULT_PROFILE_URL = "https://new-sportsmatch-user-pictures.s3.us-east-1.amazonaws.com/avatars/default-profile.png";

const EditProfile = () => {
    const navigator = useNavigation();

    const [selectedSports, setSelectedSports] = useState([]);
    const {currUser, setCurrUser} = useContext(UserContext);
    const [currImg, setCurrImg] = useState({uri: currUser.imageUrl});
    const [sports, setSports] = useState([]);
    const {
        control,
        handleSubmit,
        formState: {errors},
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
    const {showActionSheetWithOptions} = useActionSheet();
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(currUser.imageUrl || null);


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
        const fetchSports = async () => {
            try {
                const sportsData = await getSports();
                setSports(sportsData);
            } catch (error) {
                console.error("Error loading sports:", error);
            }
        };

        fetchSports();

        const {code, national_number} = parsePhoneNumber(currUser.phoneNumber);
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
        const {code, national_number} = parsePhoneNumber(phone);
        return phoneUtil.isValidNumberForRegion(
            phoneUtil.parse(national_number, code),
            code
        );
    };

    const handleSportsSelect = (sport) => {
        if (selectedSports.includes(sport.id)) {
            setSelectedSports(selectedSports.filter((item) => item !== sport.id));
        } else {
            setSelectedSports([...selectedSports, sport.id]);
        }
    };

    const isSelected = (sport) => {
        return selectedSports.includes(sport.id);
    };

    const dataChanged = (data) => {
        const phoneChanged = data.phonenumber !== currUser.phoneNumber;
        const sportsChanged = currUser.sports !== selectedSports;
        const locChanged = currUser.locations !== selectedLocations;

        return phoneChanged || sportsChanged || locChanged;
    };

    const submit = async (data) => {
        setSubmitLoading(true);
        setPhoneConflictError(null);

        try {
            const token = currUser.token;

            console.log("selectedSports: ", selectedSports)
            console.log("selectedLocations: ", selectedLocations)

            const payload = {};

            if (data.phonenumber !== currUser.phoneNumber) {
                payload.phoneNumber = data.phonenumber;
            }

            if (selectedSports.length !== currUser.sports.length ||
                !selectedSports.every(s => currUser.sports.includes(s)) ||
                selectedLocations.length !== currUser.locations.length ||
                !selectedLocations.every(l => currUser.locations.includes(l))) {
                payload.sports = selectedSports;
                payload.locations = selectedLocations;
                payload.phoneNumber = data.phonenumber;

                if (imageChanged && selectedAvatar) {
                    payload.imageUrl = selectedAvatar;
                }
            }

            await updateUser(currUser.id, payload, token);

            setCurrUser({
                ...currUser,
                phoneNumber: data.phonenumber,
                sports: selectedSports,
                locations: selectedLocations,
                ...(imageChanged && selectedAvatar ? { imageUrl: selectedAvatar } : {})
            });

            navigator.navigate("MyProfile");
        } catch (error) {
            console.error("Error updating profile:", error);
            setError("Failed to update profile.");
        } finally {
            setSubmitLoading(false);
        }
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

    useEffect(() => {
        const checkPermissions = async () => {
            const {status} = await ImagePicker.getMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            }
        };
        checkPermissions();
    }, []);


    const requestPermissions = async () => {
        const {status: cameraStatus} = await ImagePicker.requestCameraPermissionsAsync();
        const {status: galleryStatus} = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== "granted" || galleryStatus !== "granted") {
            Alert.alert(
                "Permiso requerido",
                "Necesitas habilitar el acceso a la cámara y galería en la configuración del dispositivo."
            );
            return false;
        }

        return true;
    };

    const handleCameraLaunch = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        console.log("Abriendo cámara...");

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
                base64: true,
            });

            console.log("Resultado de la captura:", result);

            if (result.canceled || !result.assets || result.assets.length === 0) {
                console.log("Captura cancelada.");
                return;
            }

            const capturedImage = result.assets[0];
            console.log("Imagen capturada:", capturedImage.uri);

            setCurrImg({uri: capturedImage.uri});
            setImageChanged(true);

            console.log("Estado actualizado correctamente.");
        } catch (error) {
            console.error("Error tomando foto:", error);
        }
    };


    const handleLibraryLaunch = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        console.log("Abriendo galería...");

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true,
            });

            console.log("Resultado de la selección:", result);

            if (result.canceled || !result.assets || result.assets.length === 0) {
                console.log("Selección cancelada o sin imágenes.");
                return;
            }

            const selectedImage = result.assets[0];
            console.log("Imagen seleccionada:", selectedImage.uri);

            setCurrImg({uri: selectedImage.uri});
            setImageChanged(true);

            console.log("Estado actualizado correctamente.");
        } catch (error) {
            console.error("Error seleccionando imagen:", error);
        }
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                <KeyboardAvoidingView
                    style={{flex: 1}}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color={COLORS.primary}
                            style={{marginTop: "75%"}}
                        />
                    ) : (
                        <View style={styles.scrollContainer}>

                            {/* Avatar y lápiz */}
                            <View style={{ alignItems: "center", marginBottom: 16 }}>
                                <View>
                                    <Avatar
                                        size={130}
                                        rounded
                                        source={
                                            selectedAvatar
                                                ? { uri: selectedAvatar }
                                                : { uri: DEFAULT_PROFILE_URL }
                                        }
                                        containerStyle={{ backgroundColor: COLORS.lightGray }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowAvatarSelector(true)}
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            right: 0,
                                            backgroundColor: COLORS.white,
                                            borderRadius: 15,
                                            padding: 4,
                                        }}
                                    >
                                        <Ionicons name="pencil" size={20} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={showAvatarSelector}
                                onRequestClose={() => setShowAvatarSelector(false)}
                            >
                                <View style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: "rgba(0,0,0,0.5)"
                                }}>
                                    <View style={{
                                        backgroundColor: "#fff",
                                        padding: 20,
                                        borderRadius: 10,
                                        width: "80%"
                                    }}>
                                        <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 10 }}>Elige tu avatar</Text>
                                        <AvatarSelector
                                            selectedAvatar={selectedAvatar}
                                            onSelect={(path) => {
                                                setSelectedAvatar(path);
                                                setImageChanged(true);
                                            }}
                                        />
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 15 }}>
                                            <CustomButton title="Cancelar" onPress={() => setShowAvatarSelector(false)} />
                                            <CustomButton
                                                title="Guardar avatar"
                                                onPress={async () => {
                                                    try {
                                                        const token = currUser.token;
                                                        await updateUser(currUser.id, { imageUrl: selectedAvatar }, token);
                                                        setCurrUser({ ...currUser, imageUrl: selectedAvatar });
                                                        setShowAvatarSelector(false);
                                                    } catch (err) {
                                                        console.error("Error al actualizar imagen:", err);
                                                    }
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </Modal>
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
                                    render={({field: {onChange, onBlur, value}}) => (
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
                                                key={sport.id}
                                                control={control}
                                                render={() => (
                                                    <Pill
                                                        customStyle={[
                                                            styles.pillStyle,
                                                            isSelected(sport) && styles.selectedPill
                                                        ]}
                                                        props={{
                                                            title: sport.name,
                                                            textStyle: isSelected(sport) ? styles.selectedText : styles.unselectedText
                                                        }}
                                                        handlePress={() => handleSportsSelect(sport)}
                                                        currentFilter={isSelected(sport)}
                                                    />

                                                )}
                                                name={`sports[${sport.name}]`}
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
                                            onChangeItem={(items) => {
                                                onChange(items);
                                                setSelectedLocations(items);
                                            }}
                                            defaultValues={selectedLocations}
                                        />
                                    )}
                                    name="locations"
                                />
                            </View>
                            {error && (
                                <Text style={{color: "red", paddingTop: 15}}>{error}</Text>
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
        backgroundColor: COLORS.white,
    },

    selectedPill: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },

    pillText: {
        fontSize: 14,
    },

    selectedText: {
        color: COLORS.white,
    },
    unselectedText: {
        color: COLORS.black,
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

