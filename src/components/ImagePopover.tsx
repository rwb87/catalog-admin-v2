import { Popover, PopoverBody, PopoverContent, PopoverTrigger } from "@chakra-ui/react";
import { useState } from "react";

type ImagePopoverProps = {
    image: {
        thumbnail: string;
        image: string | string[]
    }
    children: React.ReactNode;
}
export default function ImagePopover({ image, children }: ImagePopoverProps) {
    const [isOpen, setIsOpen] = useState<string | null>(null);

    const handleOpenImage = () => {
        const imageUrl = Array.isArray(image.image) ? image.image[0] : image.image;

        window.dispatchEvent(new CustomEvent('lightcase', { detail: { image: imageUrl } }))
    }

    return (
        <Popover
            isOpen={isOpen === image.thumbnail}
            onClose={() => setIsOpen(null)}
        >
            <PopoverTrigger>
                <button
                    onMouseEnter={() => setIsOpen(image.thumbnail)}
                    onMouseLeave={() => setIsOpen(null)}
                    onClick={handleOpenImage}
                >
                    {children}
                </button>
            </PopoverTrigger>
            <PopoverContent
                width='unset'
                zIndex={1000000000000000000000000}
                position='relative'
            >
                <PopoverBody p={2}>
                    <img
                        src={image.thumbnail}
                        style={{
                            objectFit: 'contain',
                            borderRadius: '0.375rem',
                            // height: '100%',
                            // width: 'auto',
                            maxWidth: '300px',
                            maxHeight: '400px',
                        }}
                    />
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}