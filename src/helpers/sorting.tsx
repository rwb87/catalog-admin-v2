const sortData = (data: any[], sortBy: string) => {
    const split = sortBy.split(':');

    const sort = split[0]?.toString()?.trim()?.split('.')[0];
    const byObjectLength = sortBy?.includes('.length');
    const order = split[1]?.toString()?.trim()?.toLowerCase();

    data.sort((a: any, b: any) => {
        if(a[sort]?.toString()?.trim() === '' || a[sort] === null) return 1;
        if(b[sort]?.toString()?.trim() === '' || b[sort] === null) return -1;

        let aSort = typeof a[sort] === 'string' ? a[sort]?.toLowerCase()?.trim() : a[sort];
        let bSort = typeof b[sort] === 'string' ? b[sort]?.toLowerCase()?.trim() : b[sort];

        if(byObjectLength) {
            aSort = a[sort]?.length;
            bSort = b[sort]?.length;
        }

        if(order === 'asc') {
            if(aSort < bSort) return -1;
            if(aSort > bSort) return 1;
            return 0;
        } else {
            if(aSort > bSort) return -1;
            if(aSort < bSort) return 1;
            return 0;
        }
    });

    return data;
}

export default sortData;