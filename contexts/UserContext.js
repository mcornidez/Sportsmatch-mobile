import { createContext } from "react";

export const UserContext = createContext({
    currUser: {},
    setCurrUser: () => {},
    });