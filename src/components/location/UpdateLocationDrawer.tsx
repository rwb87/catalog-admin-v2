import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { useEffect, useRef, useState } from "react";
import CustomDrawer from "@/components/Drawer";
import { Box, FormControl, FormLabel, Grid, IconButton, Image, Input } from "@chakra-ui/react";
import { IconCamera } from "@tabler/icons-react";

type UpdateLocationDrawerProps = {
    data: any;
    onSave: (data: any) => void;
    onClose: () => void;
}
const UpdateLocationDrawer = ({ data, onSave, onClose }: UpdateLocationDrawerProps) => {
    const imageRef = useRef<any>(null);

    const [editingData, setEditingData] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        setEditingData(JSON.parse(JSON.stringify(data || {})));
    }, [data]);

    const handleUpdateData = async () => {
        if(!editingData?.place) return notify('Please enter a place', 3000);
        if(!editingData?.type) return notify('Please enter a type', 3000);
        if(!editingData?.city) return notify('Please enter a city', 3000);
        if(!editingData?.state) return notify('Please enter a state', 3000);
        if(!editingData?.country) return notify('Please enter a country', 3000);

        setIsProcessing(true);

        const payload = new FormData();

        payload.append('place', editingData?.place);
        payload.append('type', editingData?.type);
        payload.append('city', editingData?.city);
        payload.append('state', editingData?.state);
        payload.append('country', editingData?.country);
        payload.append('website', editingData?.website || '');
        payload.append('appleMapsUrl', editingData?.appleMapsUrl || '');
        payload.append('googleMapsUrl', editingData?.googleMapsUrl || '');

        payload.append('latitude', editingData?.latitude || '');
        payload.append('longitude', editingData?.longitude || '');

        if (imageRef?.current.files[0]) payload.append('picture', imageRef?.current.files[0]);

        try {
            const response = await fetch({
                endpoint: `/locations${editingData?.isNew ? '' : `/${editingData?.id}`}`,
                method: editingData?.isNew ? 'POST' : 'PUT',
                data: payload,
                hasFiles: true,
            });

            if (response) {
                notify('Location saved successfully', 3000);
                onSave(response);
                setEditingData({});
            } else notify('An error occurred', 3000);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'An error occurred';
            notify(message || 'An error occurred', 3000);
        }

        setIsProcessing(false);
    }

    return (
        <>

            {/* Drawer */}
            <CustomDrawer
                isOpen={!!editingData?.id}
                title={editingData?.isNew ? `Create Location` : 'Update Location'}
                isProcessing={isProcessing}
                onSubmit={handleUpdateData}
                onClose={onClose}
            >
                {/* Place and Type */}
                <Grid
                    mt={4}
                    templateColumns={{
                        base: '1fr',
                        md: 'repeat(2, 1fr)',
                    }}
                    gap={4}
                >
                    <FormControl id="place">
                        <FormLabel>Place</FormLabel>
                        <Input
                            type="text"
                            autoComplete="off"
                            required={true}
                            value={editingData?.place || ''}
                            onChange={(e) => setEditingData({ ...editingData, place: e.target.value })}
                        />
                    </FormControl>

                    <FormControl id="type">
                        <FormLabel>Type</FormLabel>
                        <Input
                            type="text"
                            autoComplete="off"
                            required={true}
                            value={editingData?.type || ''}
                            onChange={(e) => setEditingData({ ...editingData, type: e.target?.value })}
                        />
                    </FormControl>
                </Grid>

                {/* City, State */}
                <Grid
                    mt={4}
                    templateColumns={{
                        base: '1fr',
                        md: 'repeat(2, 1fr)',
                    }}
                    gap={4}
                >
                    <FormControl id="city">
                        <FormLabel>City</FormLabel>
                        <Input
                            type="text"
                            autoComplete="off"
                            required={true}
                            value={editingData?.city || ''}
                            onChange={(e) => setEditingData({ ...editingData, city: e.target.value })}
                        />
                    </FormControl>

                    <FormControl id="state">
                        <FormLabel>State</FormLabel>
                        <Input
                            type="text"
                            autoComplete="off"
                            required={true}
                            value={editingData?.state || ''}
                            onChange={(e) => setEditingData({ ...editingData, state: e.target.value })}
                        />
                    </FormControl>
                </Grid>

                {/* Country */}
                <FormControl mt={4}>
                    <FormLabel>Country</FormLabel>
                    <Input
                        type="text"
                        autoComplete="off"
                        required={true}
                        value={editingData?.country || ''}
                        onChange={(e) => setEditingData({ ...editingData, country: e.target.value })}
                    />
                </FormControl>

                {/* Latitude, Longitude */}
                <Grid
                    mt={4}
                    templateColumns={{
                        base: '1fr',
                        md: 'repeat(2, 1fr)',
                    }}
                    gap={4}
                >
                    <FormControl id="latitude">
                        <FormLabel>Latitude (Optional)</FormLabel>
                        <Input
                            type="number"
                            step="any"
                            autoComplete="off"
                            value={editingData?.latitude || ''}
                            onChange={(e) => setEditingData({ ...editingData, latitude: e.target.value })}
                        />
                    </FormControl>

                    <FormControl id="longitude">
                        <FormLabel>Longitude (Optional)</FormLabel>
                        <Input
                            type="number"
                            step="any"
                            autoComplete="off"
                            value={editingData?.longitude || ''}
                            onChange={(e) => setEditingData({ ...editingData, longitude: e.target.value })}
                        />
                    </FormControl>
                </Grid>

                {
                    editingData?.isNew
                        ? <>
                            {/* Website */}
                            <FormControl mt={4}>
                                <FormLabel>Website</FormLabel>
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    value={editingData?.website || ''}
                                    onChange={(e) => setEditingData({ ...editingData, website: e.target.value })}
                                />
                            </FormControl>

                            {/* Apple Map Link  */}
                            <FormControl mt={4}>
                                <FormLabel>Apple Map Link</FormLabel>
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    value={editingData?.appleMapsUrl || ''}
                                    onChange={(e) => setEditingData({ ...editingData, appleMapsUrl: e.target.value })}
                                />
                            </FormControl>

                            {/* Google Map Link */}
                            <FormControl mt={4}>
                                <FormLabel>Google Map Link</FormLabel>
                                <Input
                                    type="text"
                                    autoComplete="off"
                                    value={editingData?.googleMapsUrl || ''}
                                    onChange={(e) => setEditingData({ ...editingData, googleMapsUrl: e.target.value })}
                                />
                            </FormControl>
                        </>
                        : null
                }

                {/* Image */}
                <FormControl mt={4} id="productImage">
                    <FormLabel>Image</FormLabel>

                    <Box position='relative'>
                        <Image
                            src={editingData?.pictureURL || '/images/cover-placeholder.webp'}
                            alt={editingData?.name}
                            width='full'
                            loading="lazy"
                            aspectRatio={21 / 9}
                            rounded='lg'
                            objectFit='contain'
                            bgColor='gray.100'
                            onError={(e: any) => {
                                e.target.src = '/images/cover-placeholder.webp';
                                e.target.onerror = null;
                            }}
                        />

                        {/* Edit Cover Button */}
                        <IconButton
                            position='absolute'
                            top='2'
                            right='2'
                            rounded='full'
                            colorScheme='gray'
                            aria-label='Edit cover photo'
                            icon={<IconCamera size={22} />}
                            onClick={() => imageRef.current.click()}
                        />
                    </Box>
                </FormControl>

                {/* Image input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={imageRef}
                    hidden
                    onChange={(e: any) => {
                        const photo = e.target.files[0];

                        if(!photo) return;

                        setEditingData({
                            ...editingData,
                            pictureURL: URL.createObjectURL(photo),
                            smallPictureURL: URL.createObjectURL(photo),
                        });
                    }}
                />
            </CustomDrawer>
        </>
    )
}

export default UpdateLocationDrawer;