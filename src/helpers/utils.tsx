export const encodeAmpersand = (str: string) => str.replaceAll('&', '%26');

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