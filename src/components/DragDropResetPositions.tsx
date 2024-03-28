import { Box, Button, Flex, Image } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const initialDnDState = {
    draggedFrom: null,
    draggedTo: null,
    isDragging: false,
    originalOrder: [],
    updatedOrder: []
}

type DragDropResetPositionProps = {
    images: any;
    onSave: (images: any) => void;
    onCancel: () => void;
}
const DragDropResetPosition = ({ images, onSave, onCancel }: DragDropResetPositionProps) => {
    const [dragAndDrop, setDragAndDrop] = useState<any>(initialDnDState);
    const [list, setList] = useState<any>(images);

    useEffect(() => {
        setList(images);
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

    const handleSaveList = () => {
        // Set orderIndex
        list.forEach((image: any, index: number) => {
            image.orderIndex = index;
        });

        onSave(list);
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
                {
                    list.map((image: any, index: number) => (
                        <Box
                            key={index}
                            data-position={index}
                            cursor={dragAndDrop.isDragging ? 'grabbing' : 'grab'}
                            height={28}
                            width={20}
                            draggable="true"
                            onDragStart={onDragStart}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            transform={dragAndDrop.isDragging && dragAndDrop?.draggedFrom === index ? 'scale(1.10)' : 'scale(1)'}
                            transition='all .2s ease-in-out'
                        >
                            <Image
                                src={image?.link}
                                alt={`Image ${index}`}
                                height='full'
                                width='full'
                                objectFit='cover'
                                rounded='md'
                                pointerEvents='none'
                                zIndex={5}
                                loading='eager'
                            />
                        </Box>
                    ))
                }
            </Flex>

            <Box>
                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
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

export default DragDropResetPosition;
