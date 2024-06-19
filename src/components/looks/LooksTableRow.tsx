import formatDateTime from "@/helpers/formatDateTime";
import { Avatar, Box, Button, IconButton, Image, Input, Switch, Td, Text, Tooltip, Tr } from "@chakra-ui/react";
import { IconPhoto, IconTrash, IconUpload } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import LookPhotos from "./LookPhotos";
import LookProducts from "./LookProducts";
import Confirmation from "@/components/Confirmation";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { LOOK_STATUSES } from "@/_config";
import KeywordsPopover from "@/components/KeywordsPopover";

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
    const [isSubmittingLookForApproval, setIsSubmittingLookForApproval] = useState<any>({});

    const [images, setImages] = useState<any[]>([]);

    const dateTime = useMemo(() => {
        if(!item?.createdAt) return '-';

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

    const handleUpdateData = async (data: any, id?: string, refreshData: boolean = true) => {
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

        if(refreshData) window.dispatchEvent(new CustomEvent('refresh:data'));
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
                status: LOOK_STATUSES.IN_DATA_MANAGEMENT,
                enabled: false,
                carouselEnabled: false,
            }, sendingLookDataToManagement?.id);

            notify('Look saved successfully', 3000);

            setSendingLookDataToManagement({});

            window.dispatchEvent(new CustomEvent('refresh:data'));
            window.dispatchEvent(new CustomEvent('refresh:looks'));
        } catch (error: any) {
            notify('Look sent to management but message could not be sent', 5000);
        }

        setIsProcessing(false);
    }

    const handleSubmitLookForApproval = async () => {
        setIsProcessing(true);

        try {
            handleUpdateData({
                status: LOOK_STATUSES.SUBMITTED_FOR_APPROVAL,
                enabled: false,
                carouselEnabled: false,
            }, isSubmittingLookForApproval?.id);

            notify('Look sent successfully', 3000);

            setSendingLookDataToManagement({});

            window.dispatchEvent(new CustomEvent('refresh:data'));
            window.dispatchEvent(new CustomEvent('refresh:looks'));
        } catch (error: any) {
            notify('Look sent for approval', 5000);
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

            setDeletingData({});
            window.dispatchEvent(new CustomEvent('refresh:data'));
            window.dispatchEvent(new CustomEvent('refresh:looks'));
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
            return sortedImages?.find((image: any) => image.backOfficeImageLink)?.backOfficeImageLink || '/images/cover-placeholder.webp';
        }

        // Return a placeholder image
        return '/images/cover-placeholder.webp';
    }, [item?.thumbnailImage, item?.photos]);

    const isLiveStatus = item?.status === LOOK_STATUSES.LIVE;

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

                            {item?.photos?.filter((item: any) => item?.deletedAt === null)?.length > 1 && <Box position='absolute' right={0} top={0} pointerEvents='none'><IconPhoto color="white" /></Box>}
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
                            src={item?.user?.smallPictureURL}
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
                                size={{
                                    base: 'sm',
                                    lg: 'md',
                                    '2xl': 'lg',
                                }}
                                defaultChecked={item?.enabled}
                                onChange={() => handleUpdateData({
                                    enabled: !item?.enabled,
                                }, item?.id, false)}
                            />
                        </Td>
                        <Td
                            textAlign='center'
                            display={!showStatus && !isLiveStatus ? 'none' : 'table-cell'}
                        >
                            <Switch
                                isDisabled={showStatus && !isLiveStatus}
                                colorScheme='blue'
                                size={{
                                    base: 'sm',
                                    lg: 'md',
                                    '2xl': 'lg',
                                }}
                                defaultChecked={item?.carouselEnabled}
                                onChange={() => handleUpdateData({
                                    carouselEnabled: !item?.carouselEnabled,
                                }, item?.id, false)}
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
                                borderColor='gray.200'
                                textAlign='center'
                                isDisabled={showStatus && !isLiveStatus}
                                defaultValue={item?.priority || 0}
                                onBlur={(e: any) => {
                                    if(parseInt(e.target.value) === parseInt(item?.priority)) return;

                                    handleUpdateData({
                                        priority: parseInt(e.target.value),
                                    }, item?.id, false)
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
                    <Box display='inline-block'>
                        <KeywordsPopover keywords={item?.keywordLooks} />
                    </Box>

                    {/* Send to Management button */}
                    {
                        <Tooltip label="Send look to management" placement="bottom">
                            <IconButton
                                display={[LOOK_STATUSES.IN_DATA_MANAGEMENT, LOOK_STATUSES.IN_EDIT]?.includes(item?.status) ? 'none' : 'inline-flex'}
                                aria-label="Edit"
                                variant='ghost'
                                rounded='full'
                                size='sm'
                                backgroundColor='black'
                                ml={4}
                                _hover={{
                                    backgroundColor: 'blackAlpha.700',
                                }}
                                _focusVisible={{
                                    backgroundColor: 'blackAlpha.800',
                                }}
                                icon={<img
                                    src="/icons/icon-send-look-to-management.svg"
                                    alt="Change Look"
                                    className="image-as-icon"
                                />}
                                onClick={() => setSendingLookDataToManagement(item)}
                            />
                        </Tooltip>
                    }

                    {/* Submit look for approval */}
                    {
                        <Tooltip label="Submit look for approval" placement="bottom">
                            <IconButton
                                display={item?.status !== LOOK_STATUSES.IN_EDIT ? 'none' : 'inline-flex'}
                                aria-label="Edit"
                                variant='ghost'
                                rounded='full'
                                size='sm'
                                ml={4}
                                colorScheme='green'
                                icon={<IconUpload size={22} />}
                                onClick={() => setIsSubmittingLookForApproval(item)}
                            />
                        </Tooltip>
                    }

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
                        icon={<svg viewBox="0 0 24 22" style={{ width: 24 }} xmlns="http://www.w3.org/2000/svg"><path d="m4.638 10.828v10.416h14.881v-10.416h3.72v-8.4342l-1.6889-0.42378-3.0653-0.77015c-0.5918-0.14863-1.2168-0.27653-1.9717-0.40581l-1.6993-0.28967-0.7107 1.5659c-0.179 0.38647-0.4648 0.71368-0.8237 0.94299s-0.776 0.35115-1.2019 0.35115-0.8429-0.12184-1.2018-0.35115c-0.359-0.22931-0.6448-0.55652-0.8238-0.94299l-0.7079-1.5659-1.7 0.27653c-0.74387 0.12997-1.3827 0.25648-1.9717 0.40581l-3.0654 0.76668-1.6889 0.43692v8.4342l3.7201 0.0034zm-1.4878-6.6941 3.0654-0.76669c0.59524-0.14863 1.2015-0.26754 1.8044-0.37193 0.35592 0.77745 0.92764 1.4363 1.6472 1.8983s1.5566 0.70751 2.4116 0.70751 1.6921-0.24557 2.4116-0.70751c0.7196-0.46194 1.2913-1.1208 1.6472-1.8983 0.6063 0.10439 1.2091 0.21915 1.8044 0.37193l3.0646 0.76669v4.4639h-2.2316c-0.3946 0-0.773 0.15674-1.052 0.43575-0.279 0.279-0.4357 0.65741-0.4357 1.0519v8.9265h-10.417v-8.9278c0-0.39461-0.15674-0.77302-0.43575-1.052-0.27901-0.279-0.65742-0.43575-1.052-0.43575h-2.2323v-4.4625z" fill="currentColor"/></svg>}
                        onClick={handleExpandProducts}
                    />

                    {/* Delete */}
                    <IconButton
                        aria-label='Delete'
                        variant='ghost'
                        colorScheme='red'
                        rounded='full'
                        size='sm'
                        ml={4}
                        icon={<IconTrash size={22} />}
                        onClick={() => setDeletingData(item)}
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
                        onSave={async (list: any) => {
                            await handleUpdateData({ photos: list }, item?.id);
                            setIsImagesExpanded(false);
                            setImages([]);

                            window?.dispatchEvent(new CustomEvent('refresh:data'));
                            window?.dispatchEvent(new CustomEvent('refresh:looks'));
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
                        onSave={() => {
                            setIsProductsExpanded(false)
                            window?.dispatchEvent(new CustomEvent('refresh:data'));
                        }}
                    />
                </Td>
            </Tr>

            <Tr>
                <Td colSpan={20} display='contents'>

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

                    {/* Submit look for approval */}
                    <Confirmation
                        isOpen={!!isSubmittingLookForApproval?.id}
                        title="Submit look for approval"
                        text={`Are you sure you want to submit this look for approval?`}
                        isProcessing={isProcessing}
                        cancelText="Cancel"
                        confirmText="Submit"
                        processingConfirmText="Sending..."
                        isDangerous={false}
                        onConfirm={handleSubmitLookForApproval}
                        onCancel={() => setIsSubmittingLookForApproval({})}
                    />
                </Td>
            </Tr>
        </>
    )
}

export default LooksTableRow;