export const encodeAmpersand = (str: string) => str?.replaceAll('&', '%26');

export const getImageMetadata = async (file: File) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    return new Promise((resolve) => {
        img.onload = () => {
            resolve({
                width: img.width,
                height: img.height,
                size: file.size,
                type: file.type,
                mimeType: file.type.split('/')[1],
                name: file.name,
            });
        }
    });
}
export const changeSelectBoxColorForProductReviewStatus = (status: string) => {
    switch (status) {
        case 'correct':
            return '#379777';
        case 'correct link but incorrect info. updated':
            return '#279EFF'
        case 'incorrect':
            return '#FF8225';
        case 'need further review':
            return'#C80036';
        default:
            return '#379777';
    }
}