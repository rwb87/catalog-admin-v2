import fetch from "@/helpers/fetch";
import { encodeAmpersand } from "@/helpers/utils";
import { useEffect, useState } from "react";
import CustomDrawer from "@/components/Drawer";
import { Box, Flex, Input } from "@chakra-ui/react";
import ProductsTable from "./ProductsTable";
import Confirmation from "@/components/Confirmation";
import notify from "@/helpers/notify";

export default function MergeProductsDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState([]);

    const [mainProduct, setMainProduct] = useState<any>(null);
    const [secondaryProduct, setSecondaryProduct] = useState<any>(null);

    useEffect(() => {
        const openDrawer = (event: any) => {
            const { product } = event.detail;

            if(!product) return;

            setMainProduct(product);
            setIsOpen(true);
        }

        window.addEventListener('drawer:merge-products', openDrawer);

        return () => window.removeEventListener('drawer:merge-products', openDrawer);
    }, []);

    useEffect(() => {
        if(!isOpen) return;

        setSearchTerm('');
        setData([]);
    }, [isOpen]);

    useEffect(() => {
        if(!isOpen) return;

        setIsLoading(true);

        const debounce = setTimeout(() => getData(), 500);
        return () => clearTimeout(debounce);
    }, [searchTerm, isOpen]);

    const getData = async () => {
        if(!isOpen) return;

        setIsLoading(true);

        try {
            const response = await fetch({
                endpoint: `/items?offset=0&limit=50&search=${encodeAmpersand(searchTerm)}`,
                method: 'GET',
            });

            setData(response?.items);
        } catch (error) {
            console.log(error);
        }

        setIsLoading(false);
    }

    const handleSelect = (item: any) => {
        if(item.id === mainProduct?.id) return;

        setSecondaryProduct(item);
    }

    const handleMerge = async () => {
        setIsProcessing(true);

        try {
            await fetch({
                endpoint: `/items/${mainProduct.id}/merge`,
                method: 'POST',
                data: {
                    secondaryItemId: secondaryProduct?.id,
                }
            });

            notify('Products have been merged');

            handleClose();
            window.dispatchEvent(new CustomEvent('refresh:data'));
        } catch (error) {
            console.log(error);
            notify('Products could not be merged');
        }

        setIsProcessing(false);

    }

    const handleClose = () => {
        setIsOpen(false);
        setIsProcessing(false);
        setMainProduct(null);
        setSecondaryProduct(null);
    }

    return (
        <>
            <CustomDrawer
                isOpen={isOpen}
                title='Search product'
                placement="bottom"
                onClose={handleClose}
            >
                <Flex
                    direction='row'
                    alignItems='center'
                    gap={4}
                >
                    <Input
                        type="text"
                        placeholder='Search products by product or brand name...'
                        value={searchTerm}
                        onChange={(e: any) => setSearchTerm(e?.target?.value)}
                    />
                </Flex>

                <Box mt={4}>
                    <ProductsTable
                        isLoading={isLoading}
                        data={data}
                        isSelectable={true}
                        onSelect={handleSelect}
                    />
                </Box>
            </CustomDrawer>

            {/* Merge product confirmation */}
            <Confirmation
                isOpen={!!mainProduct && !!secondaryProduct}
                isProcessing={isProcessing}
                title='Merge product'
                text={`Do you want to merge the product <b>${secondaryProduct?.name}</b> with <b>${mainProduct?.name}</b>? <br /> <br /> <b>${mainProduct?.name}</b> will contain everything from <b>${secondaryProduct?.name}</b>.`}
                confirmText="Yes, merge"
                processingConfirmText="Merging..."
                isDangerous={false}
                size='2xl'
                onConfirm={handleMerge}
                onCancel={() => {
                    setSecondaryProduct(null);
                }}
            />
        </>
    )
}