import formatDateTime from "@/helpers/formatDateTime";
import { Box, Heading, IconButton, Input, Switch, Td, Tooltip, Tr } from "@chakra-ui/react";
import { IconChevronDown, IconPhoto, IconTrash, IconUpload } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import LookPhotos from "./LookPhotos";
import LookProducts from "./LookProducts";
import Confirmation from "@/components/Confirmation";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { LOOK_STATUSES } from "@/_config";
import KeywordsPopover from "@/components/KeywordsPopover";
import LookMusics from "./LookMusics";
import LookLocations from "./LookLocations";
import Avatar from "@/components/Avatar";
import UnassignedLinksTable from "./UnassignedLinksTable";

type TableRowProps = {
    item: any,
    isUserChangeAllowed?: boolean,
    isProductExpandAllowed?: boolean,
    isAdminActionsAllowed?: boolean,
    isResourcesExpandable?: boolean,
    showStatus?: boolean,
}
const LooksTableRow = (props: TableRowProps) => {
    const {
        item,
        // isUserChangeAllowed = false,
        isProductExpandAllowed = true,
        isAdminActionsAllowed = true,
        isResourcesExpandable = true,
        showStatus = false
    } = props;

    const [isResourcesExpanded, setIsResourcesExpanded] = useState<boolean>(false);
    const [isImagesExpanded, setIsImagesExpanded] = useState<boolean>(false);
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
        setIsResourcesExpanded(false);

        setImages(isImagesExpanded ? [] : item?.photos);
        setIsImagesExpanded(!isImagesExpanded);
    }

    // const handleOpenChangeCreatorDrawer = (item: any) => {
    //     window?.dispatchEvent(new CustomEvent('drawer:change-creator', {
    //         detail: {
    //             look: item,
    //         }
    //     }));
    // }

    const handleUpdateData = async (data: any, id?: number, refreshData: boolean = true) => {
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

    if(!item?.id) return;

    return (
        <>

            {/* Row */}
            <Tr>
                <Td>
                    {
                        <Box
                            width={20}
                            height={28}
                            position='relative'
                        >
                            <img
                                src={thumbnailImage}
                                alt={item?.name}
                                loading="lazy"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                }}
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
                    {/* <Button
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
                    > */}
                        <Avatar
                            user={item?.user}
                            showName={true}
                        />
                    {/* </Button> */}
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
                            display={!showStatus && !isLiveStatus ? 'none' : 'table-cell'}
                        >
                            <Input
                                type="number"
                                rounded='full'
                                size='xs'
                                width={20}
                                borderColor='gray.200'
                                textAlign='center'
                                defaultValue={item?.splashIndex || 0}
                                onBlur={(e: any) => {
                                    if(parseInt(e.target.value) === parseInt(item?.splashIndex)) return;

                                    handleUpdateData({
                                        splashIndex: parseInt(e.target.value),
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
                    display={isAdminActionsAllowed? 'table-cell' : 'none'}
                >
                    <Box display='inline-block'>
                        <KeywordsPopover type="looks" id={item?.id} />
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

                    {/* Expand Products, Musics and Locations */}
                    {
                        isResourcesExpandable && <Tooltip label="Resources" placement="bottom">
                            <IconButton
                                display='inline-flex'
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
                                icon={<IconChevronDown size={22} />}
                                style={{
                                    transition: 'transform 0.2s ease-in-out',
                                    transform: `rotate(${isResourcesExpanded ? 180 : 0}deg)`
                                }}
                                onClick={() => setIsResourcesExpanded(!isResourcesExpanded)}
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
                        isAdminActionsAllowed={isAdminActionsAllowed}
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

            {/* Resources */}
            <Tr
                display={isResourcesExpanded ? 'table-row' : 'none'}
                bgColor='gray.50'
            >
                <Td colSpan={20} padding={4}>

                    {/* Unassigned Links */}
                    {
                        item?.parsedUnassignedLinks?.length
                            ? <Box
                                backgroundColor='white'
                                p={4}
                                rounded='lg'
                                borderWidth={1}
                                borderColor='gray.100'
                            >
                                <Heading as='h3' size='md' mb={4} fontWeight='bold'>Unassigned Links</Heading>
                                <UnassignedLinksTable
                                    look={item}
                                    links={item?.parsedUnassignedLinks}
                                />
                            </Box>
                            : null
                    }

                    {/* Products */}
                    {
                        isProductExpandAllowed
                            ? <Box
                                backgroundColor='white'
                                p={4}
                                rounded='lg'
                                borderWidth={1}
                                borderColor='gray.100'
                                mt={item?.parsedUnassignedLinks?.length ? 4 : 0}
                            >
                                <Heading as='h3' size='md' mb={4} fontWeight='bold'>Products</Heading>
                                <LookProducts
                                    look={item}
                                    onSave={() => {
                                        // setIsResourcesExpanded(false)
                                        window?.dispatchEvent(new CustomEvent('refresh:data'));
                                    }}
                                />
                            </Box>
                            : null
                    }

                    {/* Musics */}
                    <Box
                        backgroundColor='white'
                        p={4}
                        rounded='lg'
                        borderWidth={1}
                        borderColor='gray.100'
                        mt={isProductExpandAllowed ? 4 : 0}
                    >
                        <Heading as='h3' size='md' mb={4} fontWeight='bold'>Musics</Heading>
                        <LookMusics
                            lookId={item?.id}
                            data={item?.musics?.map((music: any) => music?.music)}
                            onSave={() => {
                                // setIsResourcesExpanded(false)
                                window?.dispatchEvent(new CustomEvent('refresh:data'))
                                window?.dispatchEvent(new CustomEvent('refresh:looks'))
                            }}
                        />
                    </Box>

                    {/* Locations */}
                    <Box
                        backgroundColor='white'
                        p={4}
                        rounded='lg'
                        borderWidth={1}
                        borderColor='gray.100'
                        mt={4}
                    >
                        <Heading as='h3' size='md' mb={4} fontWeight='bold'>Locations</Heading>
                        <LookLocations
                            data={item?.locations?.map((location: any) => location?.location)}
                            lookId={item?.id}
                            onSave={() => {
                                // setIsResourcesExpanded(false)
                                window?.dispatchEvent(new CustomEvent('refresh:data'))
                                window?.dispatchEvent(new CustomEvent('refresh:looks'))
                            }}
                        />
                    </Box>
                </Td>
            </Tr>

            {/* Confirmations */}
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