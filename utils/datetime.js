import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

const formatTime = (date) => {
    return date.getHours() + ":" + String(date.getMinutes()).padStart(2, "0");
}

const formatDate = (date) => {
    return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
};

const showMode = (currentMode, field) => {
    let currentDate = new Date();
    DateTimePickerAndroid.open({
        value: field.value !== undefined && field.value !== "" ? field.value : currentDate,
        onChange: (event, selectedDate) => {
            field.onChange(selectedDate)
        },
        mode: currentMode,
        is24Hour: true,
        minuteInterval: 15,
        minimumDate: currentDate,
        display: currentMode === 'date' ? 'calendar' : 'spinner',

    });
};

const showDatepicker = (field) => {
    showMode('date', field);
};

const showTimepicker = (field) => {
    showMode('time', field);
};

const getDateComponents = (date) => {
    const parsedDate = new Date(date);
    const day = parsedDate.getDate();
    const month = parsedDate.getMonth() + 1; // Months are zero-based
    const hours = parsedDate.getHours();
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0")

    return { day, month, hours, minutes };
};

export { formatTime, formatDate, showDatepicker, showTimepicker, getDateComponents }