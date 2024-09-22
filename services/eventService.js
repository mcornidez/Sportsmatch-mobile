import { EVENT_STATUS, EXPERTISE } from "../constants/data";
import * as SecureStore from "expo-secure-store";

export const API_URL =
  "http://sportsmatch-lb-700737557.us-east-1.elb.amazonaws.com";

export const authenticatedFetch = async (url, options = {}) => {
  try {
    const token = await SecureStore.getItemAsync("userToken");
    const headers = {
      ...options.headers,
      "C-api-key": token,
    };
    const response = await fetch(API_URL + url, { ...options, headers });
    console.log(`Response for ${url} :`, response.status);
    if (response.status >= 400 && response.status < 600) {
      const body = await response.json();
      if (response.status === 401 && body.internalStatus === "TOKEN_EXPIRED") {
        // await refreshSession();
        // return await authenticatedFetch(url, options);
      } else if (response.status === 409) {
        return {
          failed: true,
          message: body.message,
          internalStatus: body.internalStatus
        }
      } else throw new Error("Bad response from server: " +  JSON.stringify(body));
    }
    return response;
  } catch (err) {
    console.log("ERROR: ", err);
  }
};

export const fetchUser = async (email) => {
  const data = await fetch(API_URL + "/users?email=" + email);
  const json = await data.json();
  return json;
};

export const fetchParticipants = async (eventId, status) => {
  let queryParams = "";
  if(status == EVENT_STATUS.FINALIZED) queryParams = "?status=accepted";

  const response = await fetch(
    API_URL + "/events/" + eventId + "/participants" + queryParams
  );
  const json = await response.json();

  return json;
};

//TODO: clean this code
export const fetchEvents = async (userId, filters) => {
  console.log("FILTROS ", filters);
  let filterString;
  if (filters) {
    if (filters.date != "") filters.date = filters.date.split("T")[0];
    else delete filters.date;
    if (filters.expertise != "")
      filters.expertise = EXPERTISE.indexOf(filters.expertise) + 1;
    else delete filters.expertise;
    if (!filters.schedule || filters.schedule.length == 0)
      delete filters.schedule;
    if(filters.location == "") delete filters.location;
    filterString = Object.entries(filters)
      .map(([key, value]) => {
        console.log("KEY: " + key + " VALUE: " + value);
        return "&" + key + "=" + value;
      })
      .join("");
  }

  return await fetch(
    `${API_URL}/events?userId=${userId}&filterOut=true${
      filterString ?? ""
    }&limit=200`
  );
};

export const fetchJoinedEvents = async (userId) => {
  const response = await fetch(API_URL + "/events?participantId=" + userId);
  const jsonRes = await response.json();
  return jsonRes;
};

export const fetchMyEvents = async (userId) => {
  const events = await fetch(API_URL + `/events?userId=${userId}`);
  const json = await events.json();
  const response = json;
  for (let i = 0; i < response.items.length; i++)
    response.items[i].participants = await fetchParticipants(response.items[i].id, response.items[i].eventStatus);
  
  return response;
};

export const fetchNearEvents = async (userId, filters = undefined) => {
  try {
    const response = await fetchEvents(userId, filters);
    let jsonRes = await response.json();
    jsonRes.items = jsonRes.items?.filter(
      (event) =>
        event.remaining > 0 && event.eventStatus !== EVENT_STATUS.FINALIZED
    );
    return jsonRes;
  } catch (err) {
    console.log("ERRPR", err);
  }
};

export const publishEvent = async (eventData) => {
  await authenticatedFetch("/events", {
    method: "POST",
    body: JSON.stringify(eventData),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const fetchUserId = async (email, userJWT) => {
  const data = await fetch(API_URL + "/users?email=" + email);
  return await data.json();
};

export const fetchEventById = async (eventId) => {
  const data = await fetch(API_URL + "/events/" + eventId);
  return await data.json();
};

export const joinNewEvent = async (eventId, userId) => {
  await authenticatedFetch("/events/" + eventId + "/participants", {
    method: "POST",
    body: JSON.stringify({ userId: userId }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const acceptParticipant = async (eventId, userId) => {
  await authenticatedFetch("/events/" + eventId + "/participants/" + userId, {
    method: "PUT",
    body: JSON.stringify({ status: true }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};
//Endpoint should be /rating for it to be RESTful
export const rateUser = async (eventId, rating, participantId) => {
  console.log("RATING USER: " + participantId + " WITH RATING: " + rating + " FOR EVENT: " + eventId);
  await authenticatedFetch(`/users/${participantId}/rating`, {
    method: "POST",
    body: JSON.stringify({ eventId: eventId, rating: rating }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const quitEvent = async (eventId, userId) => {
  console.log("REMOVING MYSELF FROM EVENT: " + eventId);
  const res = await authenticatedFetch("/events/" + eventId + "/participants/" + userId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
};

export const removeParticipantAsOwner = async (eventId, userId) => {
  console.log("REMOVING PARTICIPANT FROM EVENT: " + eventId);
  await authenticatedFetch("/events/" + eventId + "/participants/" + userId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
