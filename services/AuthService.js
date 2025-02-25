import { btoa } from "react-native-quick-base64";
import { API_URL } from '@env';

const getBasicToken = (email, password) => {
  const credentials = email + ":" + password;
  return btoa(credentials);
};

const login = async (email, password) => {
  try {
    let config = {
      headers: { "c-basic-auth": getBasicToken(email, password) },
    };
    const response = await fetch(API_URL + "/auth", config);
    const body = await response.json();
    return [response.headers.map["c-api-key"], body.user];
  } catch (error) {
    console.error(error);
  }
};

const register = async (data) => {
  const response = await fetch(API_URL + "/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  var json;
  try {
    json = await response.json();
  } catch (error) {
    console.error(error);
  }
  if (response.status === 201) {
    return {
      ok: true,
    };
  }
  return {
    status: response.status,
    internalStatus: json.internalStatus,
    message: json.message,
  };
};

export { login, register };