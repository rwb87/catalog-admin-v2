import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { useEffect, useRef, useState } from "react";
import CustomDrawer from "@/components/Drawer";
import { Box, FormControl, FormLabel, Grid, IconButton, Image, Input } from "@chakra-ui/react";
import SearchableInput from "@/components/SearchableInput";
import { IconCamera } from "@tabler/icons-react";
import { encodeAmpersand } from "@/helpers/utils";
import { useGlobalVolatileStorage } from "@/_store";

type UpdateProductDrawerProps = {
    data: any;
    onSave: (data: any) => void;
    onClose: () => void;
}
const UpdateProductDrawer = ({ data, onSave, onClose }: UpdateProductDrawerProps) => {
    const productImageRef = useRef<any>(null);
    const {brands: globalBrands, setBrands: setGlobalBrands} = useGlobalVolatileStorage() as any;

    const [editingData, setEditingData] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const [isSearchingBrands, setIsSearchingBrands] = useState<boolean>(false);
    const [brandSearchTerm, setBrandSearchTerm] = useState<string>('');
    const [brands, setBrands] = useState<any[]>([]);

    useEffect(() => {
        setIsSearchingBrands(true);
        const debounce = setTimeout(() => getBrands(), 500);
        return () => clearTimeout(debounce);
    }, [brandSearchTerm]);

    useEffect(() => {
        setEditingData(data);
    }, [data]);

    const getBrands = async () => {
        if(globalBrands?.length) {
            setIsSearchingBrands(false);
            return setBrands(globalBrands);
        }

        try {
            const endpoint = brandSearchTerm?.toString()?.trim() === ''
                ? '/brands?limit=200'
                : `/brands?search=${encodeAmpersand(brandSearchTerm)}`;

            const response = await fetch({
                endpoint: endpoint,
                method: 'GET',
            });

            setBrands(response);
            setGlobalBrands(response);
        } catch (error: any) {
            setBrands([]);
        }

        setIsSearchingBrands(false);
    }

    const handleUpdateData = async () => {
        setIsProcessing(true);

        const payload = new FormData();

        payload.append('name', editingData?.name);
        payload.append('link', editingData?.link);
        payload.append('brand', editingData?.brand ?? null);
        payload.append('brandId', editingData?.brand?.id ?? null);
        payload.append('price', parseFloat(editingData?.price || 0).toFixed(2));
        payload.append('dealPrice', parseFloat(editingData?.dealPrice || 0).toFixed(2));

        const dealPercent = parseFloat(editingData?.dealPrice) > 0 ? ((parseFloat(editingData?.dealPrice) - parseFloat(editingData?.price)) / parseFloat(editingData?.price)) * 100 : 0;
        payload.append('dealPercent', dealPercent?.toString());

        if (productImageRef?.current.files[0]) payload.append('picture', productImageRef?.current.files[0]);

        try {
            const response = await fetch({
                endpoint: `/items${editingData?.isNew ? '' : `/${editingData?.id}`}`,
                method: editingData?.isNew ? 'POST' : 'PUT',
                data: payload,
                hasFiles: true,
            });

            if (response) {
                notify('Product saved successfully', 3000);
                onSave(response);
                setEditingData({});
            } else notify('An error occurred', 3000);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'An error occurred';
            notify(message, 3000);
        }

        setIsProcessing(false);
    }

    return (
        <CustomDrawer
            isOpen={!!editingData?.id}
            title={editingData?.isNew ? `Create Product` : 'Update Product'}
            isProcessing={isProcessing}
            onSubmit={handleUpdateData}
            onClose={onClose}
        >
            {/* Name and Link */}
            <Grid
                mt={4}
                templateColumns={{
                    base: '1fr',
                    md: 'repeat(2, 1fr)',
                }}
                gap={4}
            >
                <FormControl id="name">
                    <FormLabel>Product Name</FormLabel>
                    <Input
                        type="text"
                        autoComplete="off"
                        required={true}
                        value={editingData?.name || ''}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                    />
                </FormControl>

                <FormControl id="link">
                    <FormLabel>Product Link</FormLabel>
                    <Input
                        type="text"
                        autoComplete="off"
                        required={true}
                        value={editingData?.link || ''}
                        onChange={(e) => setEditingData({ ...editingData, link: e.target?.value?.toLowerCase() })}
                    />
                </FormControl>
            </Grid>

            {/* Price and Discounts */}
            <Grid
                mt={4}
                templateColumns={{
                    base: '1fr',
                    md: 'repeat(2, 1fr)',
                }}
                gap={4}
            >
                <FormControl id="price">
                    <FormLabel>Price</FormLabel>
                    <Input
                        type="number"
                        step="0.01"
                        required
                        autoComplete="off"
                        value={editingData?.price || 0}
                        onChange={(e) => setEditingData({ ...editingData, price: e.target.value })}
                    />
                </FormControl>

                <FormControl id="dealPrice">
                    <FormLabel>Discounted Price</FormLabel>
                    <Input
                        type="number"
                        step="0.01"
                        autoComplete="off"
                        value={editingData?.dealPrice || 0}
                        onChange={(e) => {
                            const { value } = e.target;

                            const dealPercent = parseFloat(value) > 0 ? ((parseFloat(value) - parseFloat(editingData?.price)) / parseFloat(editingData?.price)) * 100 : 0;

                            setEditingData({
                                ...editingData,
                                dealPercent: dealPercent?.toString(),
                                dealPrice: e.target.value,
                            });
                        }}
                    />
                </FormControl>
            </Grid>

            {/* Brand */}
            <FormControl mt={4}>
                <FormLabel>Product Brand</FormLabel>
                <SearchableInput
                    data={brands}
                    property='name'
                    defaultValue={editingData?.brand?.name}
                    placeholder="Search brand..."
                    isLoading={isSearchingBrands}
                    onDynamicSearch={(term: any) => setBrandSearchTerm(term)}
                    onChange={(brand: any) => {
                        setEditingData({
                            ...editingData,
                            brand: brand,
                        });
                    }}
                />
            </FormControl>

            {/* Product Image */}
            <FormControl mt={4} id="productImage">
                <FormLabel>Product Image</FormLabel>

                <Box position='relative'>
                    <Image
                        src={editingData?.pictureURL}
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
                        onClick={() => productImageRef.current.click()}
                    />
                </Box>
            </FormControl>

            {/* Product Image input */}
            <input
                type="file"
                accept="image/*"
                ref={productImageRef}
                hidden
                onChange={(e: any) => {
                    const photo = e.target.files[0];

                    if(!photo) return;

                    setEditingData({ ...editingData, pictureURL: URL.createObjectURL(photo) });
                }}
            />
        </CustomDrawer>
    )
}

export default UpdateProductDrawer;