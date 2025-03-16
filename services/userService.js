
import { authenticatedFetch } from "./eventService";
import { Buffer } from "@craftzdog/react-native-buffer";
import { API_URL } from '@env';

export const updateUser = async (userId, userData) => {
  const response = await authenticatedFetch("/users/" + userId, {
    method: "PUT",
    body: JSON.stringify(userData),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
};

export const updateUserImage = async (userId, base64Img) => {
  const res = await authenticatedFetch("/users/" + userId + "/image", {
    method: "PUT",
  });

  if (!res.ok) {
    return {
      status: res.status,
      message: "Failed to upload user image",
    };
  }

  const presignedUrl = await res.json();

  var buffer = Buffer.from(base64Img);

  var requestOptions = {
    method: "PUT",
    body: buffer,
    headers: {
      'Content-Type': ""
    }
  };

  const response = await fetch("https://cdn-icons-png.freepik.com/256/1077/1077114.png?semt=ais_hybrid", requestOptions);

  return {
    status: response.status,
    message: response.ok
        ? "Image update successful"
        : "Failed to upload user image",
  };
};

export const updatePhoneNumber = async (userId, phoneNumber, token) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'c-api-key': token,
      },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to update phone number:", error);
    throw error;
  }
};

export const fetchUserImage = async (userId) => {
  const res = await authenticatedFetch("/users/" + userId + "/image", {
     method: "GET",
   });

   if (!res.ok) {
     return {
       status: res.status,
       message: "Failed to fetch user image",
     };
   }

   const presignedUrl = await res.json();

   var requestOptions = {
     method: "GET",
   };

   const response = await fetch("https://cdn-icons-png.freepik.com/256/1077/1077114.png?semt=ais_hybrid", requestOptions);

   if (response.ok) {
     const data = await response.text();

     return {
       status: response.status,
       imageUrl: data ? `data:image/png;base64,${data}` : null,
     };
   }

   return {
     status: response.status,
     message: "Failed to fetch user image",
   };
};

