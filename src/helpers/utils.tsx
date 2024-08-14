import { ChangeEvent } from "react";

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
export const changeSelectBoxColorForProductReviewStatus = (status: string, type: 'background' | 'text' | 'border') => {
    const isTextColor = type === 'text';
    const isBorderColor = type === 'border';

    switch (status) {
        case 'need_review':
            if(isTextColor) return 'black';
            if(isBorderColor) return '#a1a3a5';

            return 'transparent';
        case 'correct':
            if(isTextColor) return 'white';
            if(isBorderColor) return '#379777';

            return '#379777';
        case 'updated':
            if(isTextColor) return 'white';
            if(isBorderColor) return '#279EFF';

            return '#279EFF'
        case 'incorrect':
            if(isTextColor) return 'white';
            if(isBorderColor) return '#FF8225';

            return '#FF8225';
        case 'need_further_review':
            if(isTextColor) return 'white';
            if(isBorderColor) return '#C80036';

            return'#C80036';
        default:
            if(isTextColor) return 'white';
            if(isBorderColor) return '#a1a3a5';

            return 'transparent';
    }
}
export const handleProductReviewStatusUpdate = (event: ChangeEvent<HTMLSelectElement>, itemId: number) => {
    const { value } = event.target;

    const $svg = event.target.parentElement.querySelector('svg');
    const $this = event.target;

    const backgroundColor = changeSelectBoxColorForProductReviewStatus(value, 'background');
    const textColor = changeSelectBoxColorForProductReviewStatus(value, 'text');
    const borderColor = changeSelectBoxColorForProductReviewStatus(value, 'border');

    $this.style.backgroundColor = backgroundColor;
    $this.style.color = textColor;
    $this.style.border = `1px solid ${borderColor}`;
    $svg.style.color = textColor;

    window.dispatchEvent(new CustomEvent('action:change-product-review-status', { detail: { productId: itemId, reviewStatus: value } }))
}