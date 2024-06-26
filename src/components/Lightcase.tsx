import { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

const Lightcase = () => {
    const [lightcase, setLightcase] = useState<any>({
        open: false,
        isLoading: true,
        srcset: null,
        index: 0,
        error: false,
    });

    useEffect(() => {
        const onLightcase = (event: any) => {
            if(!event?.detail?.image) return;

            setLightcase({
                open: true,
                isLoading: true,
                srcset: typeof event?.detail?.image === 'string'
                    ? [
                        { src: event?.detail?.image },
                    ]
                    : event?.detail?.image.map((image: any) => ({
                        src: image,
                    })),
                index: event?.detail?.index || 0,
                error: false,
            });
        }

        window?.addEventListener('lightcase', onLightcase);

        return () => {
            window?.removeEventListener('lightcase', onLightcase);
        }
    }, []);

    const handleCloseLightcase = () => {
        setLightcase({
            open: false,
            isLoading: true,
            src: null,
            error: false,
        });
    }

    return (
        <Lightbox
            open={lightcase.open}
            close={handleCloseLightcase}
            slides={lightcase.srcset}
            index={lightcase.index}
            carousel={{
                preload: 2,
            }}
        />
    )
}

export default Lightcase;