import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { useEffect, useRef, useState } from "react";
import CustomDrawer from "@/components/Drawer";
import { Box, FormControl, FormLabel, Grid, IconButton, Image, Input, Select } from "@chakra-ui/react";
import { IconCamera } from "@tabler/icons-react";

type UpdateBrandDrawerProps = {
    data: any,
    onSave: (data: any) => void,
    onClose?: () => void,
}
const UpdateBrandDrawer = ({ data, onSave, onClose }: UpdateBrandDrawerProps) => {
    const brandImageRef = useRef<any>(null);
    const [editingData, setEditingData] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        setEditingData(JSON.parse(JSON.stringify(data)));
    }, [data]);

    const handleUpdateData = async () => {
        setIsProcessing(true);

        const payload = new FormData();

        payload.append('name', editingData?.name);
        payload.append('pageLink', editingData?.pageLink);
        payload.append('partnership', editingData?.partnership);

        if (brandImageRef?.current.files[0]) payload.append('picture', brandImageRef?.current.files[0]);

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

                <FormControl mt={4} id="creatorBanner">
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

                {/* Brand Logo input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={brandImageRef}
                    hidden
                    onChange={(e: any) => {
                        const photo = e.target.files[0];

                        if(!photo) return;

                        setEditingData({ ...editingData, pictureURL: URL.createObjectURL(photo) });
                    }}
                />
            </Grid>
        </CustomDrawer>
    )
}

export default UpdateBrandDrawer;