import { authenticatedFetch } from "./eventService";
import { Buffer } from "@craftzdog/react-native-buffer";

export const API_URL =
  "http://sportsmatch-lb-700737557.us-east-1.elb.amazonaws.com";

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

  const response = await fetch(presignedUrl.presignedPutUrl, requestOptions);

  return {
    status: response.status,
    message: response.ok
      ? "Image update successful"
      : "Failed to upload user image",
  };
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

  const response = await fetch(presignedUrl.presignedGetUrl, requestOptions);

  if (response.ok) {
    const data = await response.text();

    return {
      status: response.status,
      imageURL: data ? `data:image/png;base64,${data}` : null,
    };
  }

  return {
    status: response.status,
    message: "Failed to fetch user image",
  };
};
