let url;
if(window.location.hostname === "localhost") {
    url = "https://localhost:44310";
} else {
    url = window.origin;
};

export const domain = url;

export const setCookie = (name, value, days) => {
    var d = new Date();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
};

export const getCookie = (name) => {
    var v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
    return v ? v[2] : null;
};

export const deleteCookie = (name) => {
    setCookie(name, "", -1);    
};

export function formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
  
    return [year, month, day].join("-");
};
  
export function DayAsString(dayIndex) {
    var weekdays = new Array(7);
    weekdays[0] = "Sunday";
    weekdays[1] = "Monday";
    weekdays[2] = "Tuesday";
    weekdays[3] = "Wednesday";
    weekdays[4] = "Thursday";
    weekdays[5] = "Friday";
    weekdays[6] = "Saturday";

    return weekdays[dayIndex];
};

export const getInningNo = (innStr) => {
    return innStr === 'First' 
            ?
            "1"
            :
            innStr === 'Second'
            ?
            "2"
            :
            innStr === 'Third'
            ?
            "3"
            :
            "4";
};

export function segregateEventDayWise (days, arr) {
    var eventList = [];
    days.forEach((obj) => {
        let dayJSTIme = obj.JSTime;
        let array = new Array();
        let map = new Map();
        arr.forEach((event) => {
            let eventJSTIme = event.JSTime;
            if (dayJSTIme === eventJSTIme && (event.no_of_day !== "1" || !map.has(event.match_id))) {
                if(event.no_of_day !== "1"){
                    if(!map.has(event.match_id+event.day)) {
                        array.push(event);
                        map.set(event.match_id+event.day, true);
                    };
                } else {
                    array.push(event);
                    map.set(event.match_id, true);
                };
            };
        });
  
        array = array.sort(dynamicSortMultiple("eventTime"));
        eventList.push(array);
    });
  
    return eventList;
};
  
export function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;
    return function (obj1, obj2) {
      var i = 0,
        result = 0,
        numberOfProperties = props.length;
      /* try getting a different result from 0 (equal)
       * as long as we have extra properties to compare
       */
      while (result === 0 && i < numberOfProperties) {
        result = dynamicSort(props[i])(obj1, obj2);
        i++;
      }
      return result;
    };
};
  
export const dynamicSort = (property) => {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      /* next line works with strings and numbers,
       * and you may want to customize it to your needs
       */
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
};