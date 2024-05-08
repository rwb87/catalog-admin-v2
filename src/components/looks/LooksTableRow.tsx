import formatDateTime from "@/helpers/formatDateTime";
import { Avatar, Box, Button, IconButton, Image, Input, Switch, Td, Text, Tooltip, Tr } from "@chakra-ui/react";
import { IconChevronDown, IconPhoto, IconTrash } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import LookPhotos from "./LookPhotos";
import LookProducts from "./LookProducts";
import Confirmation from "@/components/Confirmation";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";

type TableRowProps = {
    item: any,
    isUserChangeAllowed?: boolean,
    isProductExpandAllowed?: boolean,
    showStatus?: boolean,
}
const LooksTableRow = ({ item, isUserChangeAllowed = true, isProductExpandAllowed = true, showStatus = false }: TableRowProps) => {
    const [isImagesExpanded, setIsImagesExpanded] = useState<boolean>(false);
    const [isProductsExpanded, setIsProductsExpanded] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [deletingData, setDeletingData] = useState<any>({});
    const [sendingLookDataToManagement, setSendingLookDataToManagement] = useState<any>({});

    const [images, setImages] = useState<any[]>([]);

    const dateTime = useMemo(() => {
        const date = formatDateTime(item?.createdAt, false);
        const time = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        }).format(new Date(item?.createdAt));

        return `${date}, <br /> ${time}`;
    }, [item?.createdAt]);

    const handleExpandImages = () => {
        setIsProductsExpanded(false);

        if(!isImagesExpanded) {
            setImages(item?.photos);
            setIsImagesExpanded(true);
        } else {
            setImages([]);
            setIsImagesExpanded(false);
        }
    }

    const handleExpandProducts = () => {
        setIsImagesExpanded(false);

        setIsProductsExpanded(!isProductsExpanded);
    }

    const handleOpenChangeCreatorDrawer = (item: any) => {
        window?.dispatchEvent(new CustomEvent('drawer:change-creator', {
            detail: {
                look: item,
            }
        }));
    }

    const handleUpdateData = async (data: any, id?: string) => {
        setIsProcessing(true);

        try {
            const response = await fetch({
                endpoint: `/looks/${id}`,
                method: 'PUT',
                data: {
                    ...data,
                },
            });

            if (response) notify('Look saved successfully', 3000);
            else notify('An error occurred', 3000);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        window.dispatchEvent(new CustomEvent('refresh:data'));
        setIsProcessing(false);
    }

    const handleSendLookDataToManagement = async () => {
        const message = document.querySelector('input[name="management-message"]') as HTMLInputElement;
        const messageValue: string = message?.value?.trim();

        setIsProcessing(true);

        try {
            if(messageValue !== '') {
                await fetch({
                    endpoint: `/looks/${sendingLookDataToManagement?.id}/messages`,
                    method: 'POST',
                    data: {
                        message: messageValue,
                    },
                });
            }

            handleUpdateData({
                status: 'in_data_management',
                enabled: false,
                carouselEnabled: false,
            }, sendingLookDataToManagement?.id);

            notify('Look saved successfully', 3000);

            setSendingLookDataToManagement({});

            window.dispatchEvent(new CustomEvent('refresh:data'));
        } catch (error: any) {
            notify('Look sent to management but message could not be sent', 5000);
        }

        setIsProcessing(false);
    }

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch({
                endpoint: `/looks/${deletingData?.id}`,
                method: 'DELETE',
            });

            if (response) notify('Look deleted', 3000);
            else notify('An error occurred', 3000);

            window.dispatchEvent(new CustomEvent('refresh:data'));
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsDeleting(false);
    }

    const thumbnailImage = useMemo(() => {
        if(item?.thumbnailImage) return item?.thumbnailImage;

        // Sort the images with orderIndex
        if(item?.photos?.length) {
            const sortedImages = item?.photos.sort((a: any, b: any) => a.orderIndex - b.orderIndex);
            return sortedImages?.find((image: any) => image.croppedLink)?.croppedLink || '/images/cover-placeholder.webp';
        }

        // Return a placeholder image
        return '/images/cover-placeholder.webp';
    }, [item?.thumbnailImage, item?.photos]);

    const isLiveStatus = item?.status === 'live';
    // const isSubmittedForApproval = item?.status === 'submitted_for_approval';
    const isDataManagement = item?.status === 'in_data_management';

    return (
        <>
            <Tr>
                <Td>
                    {
                        <Box
                            width={20}
                            height={28}
                            position='relative'
                        >
                            <Image
                                src={thumbnailImage}
                                width='full'
                                height='full'
                                objectFit='cover'
                                alt={item?.name}
                                rounded='md'
                                cursor='pointer'
                                loading="lazy"
                                onClick={handleExpandImages}
                                onError={(e: any) => {
                                    e.target.src = '/images/cover-placeholder.webp';
                                    e.target.onerror = null;
                                }}
                            />

                            {item?.photos?.filter((item: any) => item?.deletedAt === null)?.length > 1 && <Box position='absolute' right={1} top={1} pointerEvents='none'><IconPhoto color="white" /></Box>}
                        </Box>
                    }
                </Td>
                <Td>
                    <Button
                        variant={isUserChangeAllowed ? 'ghost' : 'none'}
                        rounded='full'
                        gap={2}
                        pl={1}
                        pt={1}
                        pb={1}
                        height='auto'
                        fontWeight='normal'
                        cursor={isUserChangeAllowed ? 'pointer' : 'default'}
                        onClick={() => isUserChangeAllowed ? handleOpenChangeCreatorDrawer(item) : {}}
                    >
                        <Avatar
                            size='sm'
                            name={item?.user?.username || '-'}
                            src={item?.user?.pictureURL}
                        />
                        <Text>{item?.user?.username || '-'}</Text>
                    </Button>
                </Td>
                <Td textAlign='center' minWidth='150px' dangerouslySetInnerHTML={{ __html: dateTime }} />
                {
                    <>
                        <Td
                            textAlign='center'
                            display={!showStatus && !isLiveStatus ? 'none' : 'table-cell'}
                        >
                            <Switch
                                isDisabled={showStatus && !isLiveStatus}
                                colorScheme='blue'
                                size='lg'
                                defaultChecked={item?.enabled}
                                onChange={() => handleUpdateData({
                                    enabled: !item?.enabled,
                                }, item?.id)}
                            />
                        </Td>
                        <Td
                            textAlign='center'
                            display={!showStatus && !isLiveStatus ? 'none' : 'table-cell'}
                        >
                            <Switch
                                isDisabled={showStatus && !isLiveStatus}
                                colorScheme='blue'
                                size='lg'
                                defaultChecked={item?.carouselEnabled}
                                onChange={() => handleUpdateData({
                                    carouselEnabled: !item?.carouselEnabled,
                                }, item?.id)}
                            />
                        </Td>
                        <Td
                            textAlign='center'
                            display={!showStatus && !isLiveStatus ? 'none' : 'table-cell'}
                        >
                            <Input
                                type="number"
                                rounded='full'
                                size='xs'
                                width={20}
                                textAlign='center'
                                isDisabled={showStatus && !isLiveStatus}
                                defaultValue={item?.priority || 0}
                                onBlur={(e: any) => {
                                    if(parseInt(e.target.value) === parseInt(item?.priority)) return;

                                    handleUpdateData({
                                        priority: parseInt(e.target.value),
                                    }, item?.id)
                                }}
                            />
                        </Td>
                        <Td
                            textAlign='center'
                            color='blue.500'
                            display={!showStatus && !isLiveStatus ? 'none' : 'table-cell'}
                        >{item?.incomingDiscovers || 0}</Td>
                    </>
                }

                {
                    showStatus && <Td
                        color='blue.500'
                        fontWeight='bold'
                        textTransform='capitalize'
                        textAlign='center'
                    >{item?.status?.replaceAll('_', ' ') || '-'}</Td>
                }

                <Td
                    textAlign='right'
                    whiteSpace='nowrap'
                >
                    {/* Send to Management button */}
                    {
                        <Tooltip label="Send look to management" placement="bottom">
                            <IconButton
                                display={isDataManagement ? 'none' : 'inline-flex'}
                                aria-label="Edit"
                                variant='ghost'
                                rounded='full'
                                size='sm'
                                mr={4}
                                backgroundColor='black'
                                _hover={{
                                    backgroundColor: 'blackAlpha.700',
                                }}
                                _focusVisible={{
                                    backgroundColor: 'blackAlpha.800',
                                }}
                                icon={<img
                                    src="/icons/icon-send-look-to-management.svg"
                                    alt="Change Look"
                                    width={24}
                                />}
                                onClick={() => setSendingLookDataToManagement(item)}
                            />
                        </Tooltip>
                    }

                    {/* Delete */}
                    <IconButton
                        aria-label='Delete'
                        variant='ghost'
                        colorScheme='red'
                        rounded='full'
                        size='sm'
                        icon={<IconTrash size={22} />}
                        onClick={() => setDeletingData(item)}
                    />

                    {/* Expand Products */}
                    <IconButton
                        display={isProductExpandAllowed ? 'inline-flex' : 'none'}
                        aria-label='Expand'
                        variant='ghost'
                        rounded='full'
                        size='sm'
                        backgroundColor='black'
                        color='white'
                        ml={4}
                        _hover={{
                            backgroundColor: 'blackAlpha.700',
                        }}
                        _focusVisible={{
                            backgroundColor: 'blackAlpha.800',
                        }}
                        icon={<IconChevronDown
                            size={22}
                            style={{
                                transition: 'transform 0.15s',
                                transform: isProductsExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                        />}
                        onClick={handleExpandProducts}
                    />
                </Td>
            </Tr>

            {/* Photos */}
            <Tr
                display={isImagesExpanded ? 'table-row' : 'none'}
                bgColor='gray.50'
            >
                <Td colSpan={20}>
                    <LookPhotos
                        lookId={item?.id}
                        images={images}
                        onSave={(list: any) => {
                            handleUpdateData({ photos: list }, item?.id);
                            setIsImagesExpanded(false);
                            setImages([]);
                        }}
                        onCancel={() => {
                            setIsImagesExpanded(false)
                            setImages([]);
                        }}
                    />
                </Td>
            </Tr>

            {/* Products */}
            <Tr
                display={isProductsExpanded ? 'table-row' : 'none'}
                bgColor='gray.50'
            >
                <Td colSpan={20}>
                    <LookProducts
                        look={item}
                        onSave={() => setIsProductsExpanded(false)}
                    />
                </Td>
            </Tr>

            {/* Delete Dialog */}
            <Confirmation
                isOpen={!!deletingData?.id}
                text={`Are you sure you want to delete this look? You can't undo this action afterwards.`}
                isProcessing={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setDeletingData({})}
            />

            {/* Send look data to management alert */}
            <Confirmation
                isOpen={!!sendingLookDataToManagement?.id}
                title="Send look data to management"
                html={<Input
                    type="text"
                    placeholder="Message for management (optional)"
                    rounded='md'
                    size='sm'
                    width='full'
                    name='management-message'
                    autoComplete='off'
                />}
                isProcessing={isProcessing}
                cancelText="Cancel"
                confirmText="Send"
                processingConfirmText="Sending..."
                isDangerous={false}
                onConfirm={handleSendLookDataToManagement}
                onCancel={() => setSendingLookDataToManagement({})}
            />
        </>
    )
}

export default LooksTableRow;