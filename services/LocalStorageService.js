import * as SecureStore from 'expo-secure-store';

const save = async (key, value) => {
    await SecureStore.setItemAsync(key, value);
}

const getValueFor = async key => {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        return result;
    } else {
        console.log("No values stored under key: " + key);
        return null;
    }
}


const getCurrUserJWT = async () => {
    return await getValueFor('userToken');
}

const clearUserData = () => {
    if(getValueFor('userToken'))
        SecureStore.deleteItemAsync('userToken');
    if(getValueFor('userData'))
        SecureStore.deleteItemAsync('userData');
}

const getCurrentUserData = async () => {
    const stringRes =  await getValueFor('userData');
    return await JSON.parse(stringRes);
}

export { save, getValueFor, getCurrUserJWT, getCurrentUserData, clearUserData}