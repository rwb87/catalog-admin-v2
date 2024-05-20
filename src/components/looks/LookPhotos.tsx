import fetch from '@/helpers/fetch';
import { Box, Button, Flex, Grid, IconButton, Image } from '@chakra-ui/react';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

const initialDnDState = {
    draggedFrom: null,
    draggedTo: null,
    isDragging: false,
    originalOrder: [],
    updatedOrder: []
}

type LookPhotosProps = {
    lookId: number;
    images: any;
    onSave: (images: any) => void;
    onCancel: () => void;
}
const LookPhotos = ({ lookId, images, onSave, onCancel }: LookPhotosProps) => {
    const imagesInputRef = useRef<HTMLInputElement>(null);

    const [dragAndDrop, setDragAndDrop] = useState<any>(initialDnDState);
    const [list, setList] = useState<any>(images);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        const newImages = images.map((image: any) => {
            if(image?.link === '') image.link = '/images/cover-placeholder.webp';
            return image;
        });

        // Filter deleted images
        newImages.filter((image: any) => image.deletedAt === null);

        // Order by orderIndex
        newImages.sort((a: any, b: any) => a.orderIndex - b.orderIndex);

        setList(JSON.parse(JSON.stringify(newImages)));
    }, [images]);

    const onDragStart = (event: any) => {
        const initialPosition: number = parseInt(event?.currentTarget?.dataset?.position || 0);

        setDragAndDrop({
            ...dragAndDrop,
            draggedFrom: initialPosition,
            isDragging: true,
            originalOrder: list
        });

        // Firefox only
        event.dataTransfer.setData("text/html", '');
    }

    const onDragOver = (event: any) => {
        event.preventDefault();

        let newList = dragAndDrop.originalOrder;

        const draggedFrom = dragAndDrop.draggedFrom;

        const draggedTo = Number(event.currentTarget.dataset.position);

        const itemDragged = newList[draggedFrom];

        const remainingItems = newList.filter((item: any, index: number) => index !== draggedFrom);

        newList = [
            ...remainingItems.slice(0, draggedTo),
            itemDragged,
            ...remainingItems.slice(draggedTo)
        ];

        if (draggedTo !== dragAndDrop.draggedTo){
            setDragAndDrop({
            ...dragAndDrop,

                updatedOrder: newList,
                draggedTo: draggedTo
            })
        }

    }

    const onDrop = () => {
        setList(dragAndDrop.updatedOrder);

        setDragAndDrop({
            ...dragAndDrop,
            draggedFrom: null,
            draggedTo: null,
            isDragging: false
        });
    }

    const handleSaveList = async () => {
        if(list?.find((image: any) => image.isUpload)) await handleUploadNewImages();

        const newList = JSON.parse(JSON.stringify(list));

        newList?.filter((image: any) => isNaN(image.id));

        newList?.map((image: any, index: number) => {
            image.orderIndex = index;
        });

        onSave(newList);
    }

    const handleUploadNewImages = async () => {
        if(isProcessing || !imagesInputRef.current?.files?.length || !lookId) return;

        setIsProcessing(true);
        const formData = new FormData();

        Array.from(imagesInputRef.current?.files).forEach((file: any) => {
            formData.append('images', file);
        });

        try {
            const response = await fetch({
                endpoint: `/looks/${lookId}/images`,
                method: 'POST',
                data: formData,
                hasFiles: true
            });

            if(response) {
                setIsProcessing(false);
                return response;
            } else {
                setIsProcessing(false);
                return [];
            }
        } catch (error) {
            setIsProcessing(false);
            return [];
        }
    }

    const handleOnOpenImage = (link: string) => {
        window?.dispatchEvent(new CustomEvent('lightcase', { detail: { image: link } }));
    }

    return (
        <Flex
            direction='row'
            gap={2}
            wrap='nowrap'
            alignItems='center'
            justifyContent='space-between'
            width='100%'
        >
            <Flex
                direction='row'
                gap={2}
                wrap='nowrap'
            >

                {/* Upload */}
                <Grid
                    height={28}
                    width={20}
                    rounded='md'
                    bg='gray.100'
                    placeItems='center'
                    cursor='pointer'
                    position='relative'
                    borderWidth={1}
                    borderColor='gray.200'
                >
                    <input
                        ref={imagesInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                        }}
                        onChange={(e: any) => {
                            const files = e.target.files;

                            const newList = JSON.parse(JSON.stringify(images));

                            for(let i = 0; i < files.length; i++) {
                                newList?.push({
                                    link: URL.createObjectURL(files[i]),
                                    croppedLink: URL.createObjectURL(files[i]),
                                    originalLink: URL.createObjectURL(files[i]),
                                    orderIndex: newList.length,
                                    isUpload: true
                                });
                            }

                            setList(newList);
                        }}
                    />
                    <IconUpload size={32} />
                </Grid>

                {/* Images */}
                {
                    list?.map((image: any, index: number) => {
                        if(image?.deletedAt) return null;

                        return (
                            <Box
                                key={image?.id ?? index}
                                data-position={index}
                                height={28}
                                width={20}
                                transform={dragAndDrop.isDragging && dragAndDrop?.draggedFrom === index ? 'scale(1.10)' : 'scale(1)'}
                                transition='all .2s ease-in-out'
                                cursor={image?.isUpload ? 'not-allowed' : dragAndDrop.isDragging ? 'grabbing' : 'grab'}
                                draggable="true"
                                pointerEvents={image?.isUpload ? 'none' : 'auto'}
                                onDragStart={onDragStart}
                                onDragOver={onDragOver}
                                onDrop={onDrop}
                                onClick={() => handleOnOpenImage(image?.link)}
                            >
                                <Image
                                    src={image?.croppedLink}
                                    alt={`Image ${index}`}
                                    height='full'
                                    width='full'
                                    objectFit='cover'
                                    rounded='md'
                                    pointerEvents='none'
                                    zIndex={5}
                                    loading='eager'
                                />

                                {
                                    image?.isUpload
                                        ? <IconUpload size={16} color='greenyellow' style={{ position: 'absolute', top: 2, right: 2 }} />
                                        : <IconButton
                                            size='xs'
                                            variant='solid'
                                            colorScheme='red'
                                            aria-label='Delete'
                                            icon={<IconTrash style={{ width: '24px', height: '24px' }} />}
                                            position='absolute'
                                            top={-1}
                                            right={-1}
                                            rounded='full'
                                            aspectRatio={1}
                                            onClick={(event: any) => {
                                                event.stopPropagation();

                                                const newList = JSON.parse(JSON.stringify(list));
                                                newList[index].deletedAt = new Date().toISOString();
                                                setList(newList);
                                            }}
                                        />
                                }
                            </Box>
                        )
                    })
                }
            </Flex>

            <Box>
                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    loadingText='Saving...'
                    isDisabled={isProcessing}
                    isLoading={isProcessing}
                    onClick={handleSaveList}
                >Save</Button>

                <Button
                    variant='ghost'
                    colorScheme='gray'
                    size='sm'
                    ml={2}
                    onClick={onCancel}
                >Cancel</Button>
            </Box>
        </Flex>
    )
};

export default LookPhotos;
