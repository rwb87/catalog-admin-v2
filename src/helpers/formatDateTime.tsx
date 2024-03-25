const formatDateTime = (date: string, showTime: boolean = true) => {
    const options: any = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    if(showTime) {
        options['hour'] = 'numeric';
        options['minute'] = 'numeric';
    }

    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
}

export default formatDateTime;