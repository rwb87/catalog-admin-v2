import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { useEffect, useRef, useState } from "react";
import CustomDrawer from "@/components/Drawer";
import { Box, Button, Flex, FormControl, FormLabel, Grid, IconButton, Image, Input } from "@chakra-ui/react";
import SearchableInput from "@/components/SearchableInput";
import { IconCamera, IconPlus } from "@tabler/icons-react";
import { encodeAmpersand } from "@/helpers/utils";
import { useGlobalVolatileStorage } from "@/_store";
import UpdateBrandDrawer from "@/components/brands/UpdateBrandDrawer";

type UpdateProductDrawerProps = {
    data: any;
    onSave: (data: any) => void;
    onClose: () => void;
}
const UpdateProductDrawer = ({ data, onSave, onClose }: UpdateProductDrawerProps) => {
    const productImageRef = useRef<any>(null);

    const { brands: globalBrands, styles: globalStyles } = useGlobalVolatileStorage() as any;

    const [editingData, setEditingData] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const [isSearchingBrands, setIsSearchingBrands] = useState<boolean>(false);
    const [brandSearchTerm, setBrandSearchTerm] = useState<string>('');
    const [brands, setBrands] = useState<any[]>([]);
    const [newBrand, setNewBrand] = useState<any | null>({});

    const [isCreatingStyle, setIsCreatingStyle] = useState<boolean>(false);
    const [isSearchingStyles, setIsSearchingStyles] = useState<boolean>(false);
    const [styleSearchTerm, setStyleSearchTerm] = useState<string>('');
    const [styles, setStyles] = useState<any[]>([]);

    useEffect(() => {
        setEditingData(data);

        setIsCreatingStyle(false);

        setBrands(globalBrands);
        setStyles(globalStyles);

        setBrandSearchTerm(data?.brand?.name);
        setStyleSearchTerm(data?.style?.label);
    }, [data]);

    useEffect(() => {
        setIsSearchingBrands(true);

        if(globalBrands && !brandSearchTerm?.toString()?.trim()?.length) getBrands();
        else {
            const debounce = setTimeout(() => getBrands(), 500);
            return () => clearTimeout(debounce);
        }
    }, [brandSearchTerm]);

    useEffect(() => {
        setIsSearchingStyles(true);

        if(globalStyles && !styleSearchTerm?.toString()?.trim()?.length) getStyles();
        else {
            const debounce = setTimeout(() => getStyles(), 500);
            return () => clearTimeout(debounce);
        }
    }, [styleSearchTerm]);

    const getBrands = async () => {
        if(globalBrands && !brandSearchTerm?.toString()?.trim()?.length) {
            setIsSearchingBrands(false);
            return setBrands(globalBrands);
        }

        try {
            const response = await fetch({
                endpoint: `/brands?search=${encodeAmpersand(brandSearchTerm)}`,
                method: 'GET',
            });

            setBrands(response);
        } catch (error: any) {
            setBrands([]);
        }

        setIsSearchingBrands(false);
    }

    const getStyles = async () => {
        if(globalStyles && !styleSearchTerm?.toString()?.trim()?.length) {
            setIsSearchingStyles(false);
            return setStyles(globalStyles);
        }

        try {
            const response = await fetch({
                endpoint: `/items/styles?search=${encodeAmpersand(styleSearchTerm)}`,
                method: 'GET',
            });

            setStyles(response);
        } catch (error: any) {
            setStyles([]);
        }

        setIsSearchingStyles(false);
    }

    const handleUpdateData = async () => {
        if(!editingData?.name) return notify('Please enter a name');
        // if(!editingData?.link) return notify('Please enter a link');
        if(!editingData?.price) return notify('Please enter a price');
        if(!editingData?.brand?.id) return notify('Please select a brand');

        setIsProcessing(true);

        const payload = new FormData();

        payload.append('name', editingData?.name);
        payload.append('link', editingData?.link || null);
        payload.append('brand', editingData?.brand ?? null);
        payload.append('brandId', editingData?.brand?.id ?? null);
        payload.append('price', parseFloat(editingData?.price || 0).toFixed(2));
        payload.append('dealPrice', parseFloat(editingData?.dealPrice || 0).toFixed(2));

        const dealPercent = parseFloat(editingData?.dealPrice) > 0 ? ((parseFloat(editingData?.dealPrice) - parseFloat(editingData?.price)) / parseFloat(editingData?.price)) * 100 : 0;
        payload.append('dealPercent', dealPercent?.toString());

        if(isCreatingStyle) payload.append('style', editingData?.style?.label);
        else if (editingData?.style?.label?.toString()?.trim()) payload.append('styleId', editingData?.styleId || editingData?.style?.id);

        if (!editingData?.style && !editingData?.styleId) payload.append('styleId', '');

        if (productImageRef?.current.files[0]) payload.append('picture', productImageRef?.current.files[0]);

        try {
            const response = await fetch({
                endpoint: `/items${editingData?.isNew ? '' : `/${editingData?.id}`}`,
                method: editingData?.isNew ? 'POST' : 'PUT',
                data: payload,
                hasFiles: true,
            });

            if (response) {
                notify('Product saved successfully');
                onSave(response);
                setEditingData({});
                window?.dispatchEvent(new CustomEvent('global:fetch-global-data'));
            } else notify('An error occurred');
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'An error occurred';
            notify(message);
        }

        setIsProcessing(false);
    }

    return (
        <>

            {/* Product Drawer */}
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
                        md: 'repeat(1, 1fr)',
                    }}
                    gap={4}
                >
                    <FormControl id="name">
                        <FormLabel>Name</FormLabel>
                        <Input
                            type="text"
                            autoComplete="off"
                            required={true}
                            value={editingData?.name || ''}
                            onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                        />
                    </FormControl>

                    <FormControl id="link" display='none'>
                        <FormLabel>Initial Link</FormLabel>
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
                    <Flex justify='space-between' mb={1}>
                        <FormLabel>Brand</FormLabel>

                        {/* Create brand button */}
                        <Button
                            size='sm'
                            variant='ghost'
                            colorScheme='gray'
                            leftIcon={<IconPlus size={16} />}
                            onClick={() => {
                                setEditingData({});

                                setNewBrand({
                                    id: Math.random().toString(36).substring(7),
                                    name: '',
                                    pageLink: '',
                                    pictureURL: '',
                                    smallPictureURL: '',
                                    partnership: 'NONE',
                                    isNew: true,
                                })
                            }}
                        >Create Brand</Button>
                    </Flex>

                    {/* Brand search input */}
                    <SearchableInput
                        data={brands}
                        property='name'
                        defaultValue={editingData?.brand?.name}
                        placeholder="Search brand..."
                        isLoading={isSearchingBrands}
                        onInputChange={(term: any) => setBrandSearchTerm(term)}
                        onSelect={(brand: any) => {
                            setEditingData({
                                ...editingData,
                                brand: brand,
                            });
                        }}
                    />
                </FormControl>

                {/* Style */}
                <FormControl mt={4}>
                    <Flex justify='space-between' mb={1}>
                        <FormLabel>Style</FormLabel>

                        {/* Create style button */}
                        <Button
                            size='sm'
                            variant='ghost'
                            colorScheme='gray'
                            leftIcon={<IconPlus
                                size={16}
                                style={{
                                    rotate: isCreatingStyle ? '45deg' : '',
                                    transition: 'rotate 0.1s ease-in-out',
                                }}
                            />}
                            onClick={() => {
                                setIsCreatingStyle(!isCreatingStyle)
                                setEditingData({
                                    ...editingData,
                                    style: isCreatingStyle ? data?.style : {},
                                });
                            }}
                        >{isCreatingStyle ? 'Select' : 'Create'} Style</Button>
                    </Flex>

                    {/* Style search input */}
                    {
                        isCreatingStyle
                            ? <Input
                                display={isCreatingStyle ? 'block' : 'none'}
                                type="text"
                                autoComplete="off"
                                value={editingData?.style?.label || ''}
                                placeholder="Enter style label..."
                                height='38px'
                                onChange={(e) => {
                                    setEditingData({
                                        ...editingData,
                                        style: {
                                            label: e.target.value,
                                        },
                                    })
                                }}
                            />
                            : <SearchableInput
                                data={styles}
                                property='label'
                                defaultValue={editingData?.style?.label}
                                placeholder="Search style..."
                                isLoading={isSearchingStyles}
                                onInputChange={(term: any) => {
                                    setStyleSearchTerm(term)
                                }}
                                onSelect={(style: any) => {
                                    setEditingData({
                                        ...editingData,
                                        style: style,
                                        styleId: style?.id,
                                    });
                                }}
                            />
                    }
                </FormControl>

                {/* Product Image */}
                <FormControl mt={4} id="productImage">
                    <FormLabel>Product Image</FormLabel>

                    <Box position='relative'>
                        <Image
                            src={editingData?.originalImageLink || '/images/cover-placeholder.webp'}
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

                        setEditingData({
                            ...editingData,
                            originalImageLink: URL.createObjectURL(photo),
                            squareImageLink: URL.createObjectURL(photo),
                        });
                    }}
                />
            </CustomDrawer>

            {/* Brand Drawer */}
            <UpdateBrandDrawer
                data={newBrand}
                onSave={async (brand: any) => {
                    setNewBrand({});
                    setIsSearchingBrands(true);
                    await getBrands();
                    setBrandSearchTerm(brand?.name);
                    setEditingData({
                        ...data,
                        brand: brand,
                    });
                }}
                onClose={() => {
                    setNewBrand({});
                    setEditingData(data);
                }}
            />
        </>
    )
}

export default UpdateProductDrawer;