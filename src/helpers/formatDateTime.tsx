import moment from "moment";

const formatDateTime = (date: string, showTime: boolean = true) => {
    return moment(date).format(showTime ? 'MMM DD, YYYY hh:mm A' : 'MMM DD, YYYY');
}

export default formatDateTime;