import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { useEffect, useRef, useState } from "react";
import CustomDrawer from "@/components/Drawer";
import { Box, Checkbox, FormControl, FormLabel, Grid, IconButton, Image, Input, Select } from "@chakra-ui/react";
import { IconCamera, IconCheck } from "@tabler/icons-react";
import { getImageMetadata } from "@/helpers/utils";

type UpdateBrandDrawerProps = {
    data: any,
    onSave: (data: any) => void,
    onClose?: () => void,
}
const UpdateBrandDrawer = ({ data, onSave, onClose }: UpdateBrandDrawerProps) => {
    const brandImageRef = useRef<any>(null);
    const [editingData, setEditingData] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);

    useEffect(() => {
        const parsedData = JSON.parse(JSON.stringify(data));

        setEditingData({
            ...parsedData,
            photoMetadata: parsedData?.photoMetadataParsed || {},
        });

        if(typeof parsedData?.photoMetadataParsed?.width === 'number' && typeof parsedData?.photoMetadataParsed?.height === 'number') {
            setAspectRatio(parseInt(parsedData?.photoMetadataParsed?.width) / parseInt(parsedData?.photoMetadataParsed?.height) || null);
        }
    }, [data]);

    const handleUpdateData = async () => {
        if(!editingData?.name) return notify('Brand name is required', 3000);
        if(!editingData?.pageLink) return notify('Brand website is required', 3000);
        if(editingData?.partnership === undefined) return notify('Brand partnership is required', 3000);

        if(editingData.photoMetadata?.width || editingData.photoMetadata?.height) {
            if(isNaN(editingData.photoMetadata?.width) || isNaN(editingData.photoMetadata?.height)) return notify('Image width and height must be numbers', 3000);
        }

        setIsProcessing(true);

        const payload = new FormData();

        payload.append('name', editingData?.name);
        payload.append('pageLink', editingData?.pageLink);
        payload.append('partnership', editingData?.partnership);

        if (brandImageRef?.current.files[0]) {
            payload.append('picture', brandImageRef?.current.files[0]);
        }

        const photoMetadata = editingData?.photoMetadata;
        if(editingData?.photoMetadata?.width) photoMetadata.width = parseInt(photoMetadata?.width) || null;
        if(editingData?.photoMetadata?.height) photoMetadata.height = parseInt(photoMetadata?.height) || null;
        payload.append('photoMetadata', JSON.stringify(photoMetadata));

        try {
            const response = await fetch({
                endpoint: `/brands${editingData?.isNew ? '' : `/${editingData?.id}`}`,
                method: editingData?.isNew ? 'POST' : 'PUT',
                data: payload,
                hasFiles: true,
            });

            if (response) {
                notify('Brand saved successfully', 3000);

                onSave?.(editingData?.isNew ? { ...response, isNew: true } : response);

                setEditingData({});
                onClose?.();
            } else notify('An error occurred', 3000);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsProcessing(false);
    }

    return (
        <CustomDrawer
            isOpen={!!editingData?.id}
            title={editingData?.isNew ? `Create Brand` : 'Update Brand'}
            isProcessing={isProcessing}
            onSubmit={handleUpdateData}
            onClose={onClose}
        >
            <Grid
                mt={4}
                templateColumns='1fr'
                gap={4}
            >
                <FormControl id="name">
                    <FormLabel>Brand Name</FormLabel>
                    <Input
                        type="text"
                        required
                        autoComplete="off"
                        value={editingData?.name}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                    />
                </FormControl>

                <FormControl id="pageLink">
                    <FormLabel>Brand Website</FormLabel>
                    <Input
                        type="text"
                        autoComplete="off"
                        value={editingData?.pageLink}
                        onChange={(e) => setEditingData({ ...editingData, pageLink: e.target?.value?.toLowerCase() })}
                    />
                </FormControl>

                <FormControl id="partnership">
                    <FormLabel>Brand Partnership</FormLabel>
                    <Select
                        value={editingData?.partnership}
                        onChange={(e) => setEditingData({ ...editingData, partnership: e.target.value })}
                    >
                        <option value="NONE">None</option>
                        <option value="GAAN">GAAN</option>
                    </Select>
                </FormControl>

                <FormControl mt={4} id="bannerImage">
                    <FormLabel>Brand Logo (Leave blank to keep current image)</FormLabel>

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
                            onClick={() => brandImageRef.current.click()}
                        />
                    </Box>
                </FormControl>

                {/* Image width and Height */}
                <Grid
                    templateColumns={{
                        base: 'repeat(1, 1fr)',
                        md: 'repeat(2, 1fr)',
                    }}
                    gap={4}
                >
                    <FormControl id="width">
                        <FormLabel>Width (px) i.e. 1920</FormLabel>
                        <Input
                            type="number"
                            step="1"
                            pattern="^\d+$"
                            value={editingData?.photoMetadata?.width ?? ''}
                            onChange={(e) => setEditingData({
                                ...editingData,
                                photoMetadata: {
                                    ...editingData?.photoMetadata,
                                    width: e.target.value,
                                }
                            })}
                            onBlur={(e: any) => {
                                if(!aspectRatio) return;

                                const width = parseInt(e.target.value);
                                if(!isNaN(width)) {
                                    setEditingData({
                                        ...editingData,
                                        photoMetadata: {
                                            ...editingData?.photoMetadata,
                                            width,
                                            height: Math.round(width / aspectRatio),
                                        }
                                    });
                                }
                            }}
                        />
                    </FormControl>

                    <FormControl id="height">
                        <FormLabel>Height (px) i.e. 1080</FormLabel>
                        <Input
                            type="number"
                            step="1"
                            pattern="^\d+$"
                            value={editingData?.photoMetadata?.height ?? ''}
                            onChange={(e) => setEditingData({
                                ...editingData,
                                photoMetadata: {
                                    ...editingData?.photoMetadata,
                                    height: e.target.value,
                                }
                            })}
                            onBlur={(e: any) => {
                                if(!aspectRatio) return;

                                const height = parseInt(e.target.value);
                                if(!isNaN(height)) {
                                    setEditingData({
                                        ...editingData,
                                        photoMetadata: {
                                            ...editingData?.photoMetadata,
                                            height,
                                            width: Math.round(height * aspectRatio),
                                        }
                                    });
                                }
                            }}
                        />
                    </FormControl>
                </Grid>

                {/* Locked Aspect Ratio */}
                <Checkbox
                    id="lockAspectRatio"
                    colorScheme='blue'
                    defaultChecked={true}
                    readOnly
                    cursor='not-allowed'
                    icon={<IconCheck style={{ width: 30, height: 30, padding: 0 }} strokeWidth={2} />}
                >Locked Aspect Ratio</Checkbox>

                {/* Brand Logo input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={brandImageRef}
                    hidden
                    onChange={async (e: any) => {
                        const photo = e.target.files[0];

                        if(!photo) return;

                        const imageMetadata: any = await getImageMetadata(photo);

                        setAspectRatio(imageMetadata?.width / imageMetadata?.height);
                        setEditingData({
                            ...editingData,
                            pictureURL: URL.createObjectURL(photo),
                            photoMetadata: {
                                ...imageMetadata,
                                width: parseInt(imageMetadata?.width),
                                height: parseInt(imageMetadata?.height),
                            }
                        });
                    }}
                />
            </Grid>
        </CustomDrawer>
    )
}

export default UpdateBrandDrawer;