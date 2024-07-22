import { PRODUCT_LINK_TYPES } from "@/_config";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Button, Flex, IconButton, Input, Select, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconAlertTriangle, IconArrowDown, IconArrowUp, IconCornerDownRight, IconDeviceFloppy, IconError404, IconPlus, IconShoppingCartExclamation, IconTrash, IconUnlink } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import Avatar from "@/components/Avatar";

type LookProductsProps = {
    links: any;
    productId: string;
    allowModify?: boolean;
    onSave?: (links: any) => void;
    onCancel?: () => void;
}
const ProductLinks = ({ links, productId, allowModify = true, onSave, onCancel }: LookProductsProps) => {
    const [editedLinks, setEditedLinks] = useState<any>([])
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        if(!links?.length) return setEditedLinks([]);

        const newLinks = JSON.parse(JSON.stringify(links));
        let sortedLinks = newLinks.sort((a: any, b: any) => a?.orderIndex - b?.orderIndex);

        // Sort links by status active or inactive
        sortedLinks = sortedLinks.sort((a: any, b: any) => {
            if (a?.status === 'active' && b?.status === 'inactive') return -1;
            if (a?.status === 'inactive' && b?.status === 'active') return 1;
            return 0;
        });

        setEditedLinks(sortedLinks);
    }, [links]);

    const handleInputChange = (e: any, index: number) => {
        const { name, value, type } = e.target;

        const newLinks = [...editedLinks];
        newLinks[index][name] = type === 'number' ? parseFloat(value || 0) : value;

        setEditedLinks(newLinks);
    }

    const handleAddNew = () => {
        setEditedLinks([
            ...editedLinks,
            {
                itemId: productId,
                link: "",
                linkType: "BACKUP",
                linkClass: "BASIC",
                price: 0,
                discountPrice: 0,
                orderIndex: editedLinks.length,
            }
        ])
    }

    const handleRemove = (index: number) => {
        const newLinks = [...editedLinks];
        newLinks.splice(index, 1);
        setEditedLinks(newLinks);
    }

    const handleMoveUp = (index: number) => {
        if (index === 0) return;

        const newLinks = [...editedLinks];
        const [removed] = newLinks.splice(index, 1);
        newLinks.splice(index - 1, 0, removed);
        setEditedLinks(newLinks);
    }

    const handleMoveDown = (index: number) => {
        if (index === editedLinks.length - 1) return;

        const newLinks = [...editedLinks];
        const [removed] = newLinks.splice(index, 1);
        newLinks.splice(index + 1, 0, removed);
        setEditedLinks(newLinks);
    }

    const handleSave = async () => {

        // Filter out empty links
        const filteredLinks = editedLinks.filter((link: any) => link.link.trim() !== '');

        // Reset order index
        const newLinks = filteredLinks.map((link: any, index: number) => ({ ...link, orderIndex: index }));
        setEditedLinks(newLinks);

        await handleSaveLinks(newLinks);
    }

    const handleSaveLinks = async (links: any[]) => {
        setIsProcessing(true);

        try {
            const response = await fetch({
                endpoint: `/items/${productId}/links`,
                method: 'POST',
                data: { links: links },
            });

            if (response) notify('Links saved successfully', 3000);
            else notify('An error occurred', 3000);

        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsProcessing(false);
        onSave?.(links);
    }

    const renderLinkStatus = (link: any) => {
        const isDataAvailable = typeof link?.scrapedDataParsed !== 'undefined' && typeof link?.scrapedDataParsed?.status !== 'undefined';
        const is404 = link?.scrapedDataParsed?.status === 404;
        const isOtherError = link?.scrapedDataParsed?.status !== 200 && link?.scrapedDataParsed?.status !== 404;
        const isOutOfStock = link?.scrapedDataParsed?.status === 200 && (link?.scrapedDataParsed?.outOfStock || false);
        const alerts: any = [];

        // Status: Unavailable
        if(!isDataAvailable) {
            alerts.push(
                <Tooltip label='Link information unavailable'>
                    <IconUnlink size={20} />
                </Tooltip>
            )
        }

        // Status: 404 Link not found
        if(isDataAvailable && is404) {
            alerts.push(
                <Tooltip label='Link not found'>
                    <IconError404 size={20} />
                </Tooltip>
            )
        }

        // Status: Other error
        if(isDataAvailable && isOtherError) {
            alerts.push(
                <Tooltip label={`Status: ${link?.scrapedDataParsed?.status}`}>
                    <IconAlertTriangle size={20} />
                </Tooltip>
            )
        }

        // Status: 200 Out of stock
        if(isDataAvailable && isOutOfStock) {
            alerts.push(
                <Tooltip label='Out of stock'>
                    <IconShoppingCartExclamation size={20} />
                </Tooltip>
            )
        }

        // Return if there are alerts
        if(alerts?.length) {
            return (
                <Flex
                    alignItems='center'
                    justifyContent='center'
                    gap={2}
                    width='full'
                    color='red.500'
                    textAlign='center'
                >{ alerts?.map((alert: any, index: number) => <React.Fragment key={index}>{alert}</React.Fragment>) }</Flex>
            )
        }

        // Return if everything is OK
        return <Text color='green.500' fontSize='sm' fontWeight='bold'>OK</Text>
    }

    const handleOpenChangeCreatorDrawer = (link: any) => {
        window?.dispatchEvent(new CustomEvent('drawer:change-creator', {
            detail: {
                link: link,
            }
        }));
    }

    return (
        <>
            <Table>
                <Thead>
                    <Tr>
                        <Th width='30px'></Th>
                        <Th>Link</Th>
                        <Th>Type</Th>
                        <Th>Price</Th>
                        <Th>Discount Price</Th>
                        <Th>Status</Th>
                        <Th>Link For</Th>
                        <Th textAlign='center'>Link Status</Th>
                        <Th textAlign='right'>Actions</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {
                        editedLinks?.map((link: any, index: number) => {
                            return (
                                <Tr key={index}>
                                    <Td width='30px' textAlign='left'>
                                        <IconCornerDownRight size={20} />
                                    </Td>
                                    <Td>
                                        <Input
                                            type='text'
                                            placeholder='Link'
                                            variant='solid'
                                            borderWidth={1}
                                            borderColor='gray.100'
                                            px={6}
                                            size='sm'
                                            rounded='full'
                                            autoComplete="off"
                                            required={true}
                                            name='link'
                                            readOnly={!allowModify}
                                            value={link?.link ?? ''}
                                            onChange={(e) => handleInputChange(e, index)}
                                        />
                                    </Td>
                                    <Td>
                                        <Select
                                            variant='solid'
                                            borderWidth={1}
                                            borderColor='gray.100'
                                            size='sm'
                                            rounded='full'
                                            width={60}
                                            name='linkType'
                                            isReadOnly={!allowModify}
                                            icon={allowModify ? <BiChevronDown size={2} /> : <></>}
                                            value={link?.linkType ?? ''}
                                            onChange={(e) => handleInputChange(e, index)}
                                        >
                                            {
                                                Object.keys(PRODUCT_LINK_TYPES).map((key: any) => (
                                                    PRODUCT_LINK_TYPES[key] === PRODUCT_LINK_TYPES.CREATOR_AFFILIATE
                                                        ? <option key={key} value={PRODUCT_LINK_TYPES.CREATOR_AFFILIATE}>⭐ {PRODUCT_LINK_TYPES.CREATOR_AFFILIATE}</option>
                                                        : <option key={key} value={PRODUCT_LINK_TYPES[key]}>{PRODUCT_LINK_TYPES[key]}</option>
                                                ))
                                            }
                                        </Select>
                                    </Td>
                                    <Td maxWidth='200px'>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder='Price'
                                            variant='solid'
                                            borderWidth={1}
                                            borderColor='gray.100'
                                            px={6}
                                            size='sm'
                                            rounded='full'
                                            autoComplete="off"
                                            name='price'
                                            readOnly={!allowModify}
                                            value={link?.price ?? ''}
                                            onChange={(e) => handleInputChange(e, index)}
                                        />
                                    </Td>
                                    <Td maxWidth='200px'>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder='Discount Price'
                                            variant='solid'
                                            borderWidth={1}
                                            borderColor='gray.100'
                                            px={6}
                                            size='sm'
                                            rounded='full'
                                            autoComplete="off"
                                            name='discountPrice'
                                            readOnly={!allowModify}
                                            value={link?.discountPrice ?? ''}
                                            onChange={(e) => handleInputChange(e, index)}
                                        />
                                    </Td>
                                    <Td>
                                        <Select
                                            variant='solid'
                                            borderWidth={1}
                                            borderColor='gray.100'
                                            size='sm'
                                            rounded='full'
                                            width={28}
                                            name='status'
                                            isReadOnly={!allowModify}
                                            icon={allowModify ? <BiChevronDown size={2} /> : <></>}
                                            value={link?.status ?? false}
                                            onChange={(e) => handleInputChange(e, index)}
                                        >
                                            <option value='active'>Active</option>
                                            <option value='inactive'>Inactive</option>
                                        </Select>
                                    </Td>
                                    <Td>
                                        {
                                            link?.user
                                                ? <Button
                                                    variant='ghost'
                                                    rounded='full'
                                                    gap={2}
                                                    pl={1}
                                                    pt={1}
                                                    pb={1}
                                                    height='auto'
                                                    fontWeight='normal'
                                                    cursor='pointer'
                                                    onClick={() => handleOpenChangeCreatorDrawer(link)}
                                                >
                                                    <Avatar user={link?.user} />
                                                </Button>
                                                : <Text fontStyle='italic' opacity={0.5}>NIL</Text>
                                        }
                                    </Td>
                                    <Td textAlign='center'>{renderLinkStatus(link)}</Td>
                                    <Td
                                        textAlign='right'
                                        whiteSpace='nowrap'
                                        display={allowModify ? 'table-cell' : 'none'}
                                    >
                                        <IconButton
                                            aria-label='Move Up'
                                            variant='ghost'
                                            colorScheme='blue'
                                            rounded='full'
                                            size='sm'
                                            icon={<IconArrowUp size={22} />}
                                            onClick={() => handleMoveUp(index)}
                                        />

                                        <IconButton
                                            aria-label='Move Down'
                                            variant='ghost'
                                            colorScheme='blue'
                                            rounded='full'
                                            size='sm'
                                            ml={4}
                                            icon={<IconArrowDown size={22} />}
                                            onClick={() => handleMoveDown(index)}
                                        />

                                        <IconButton
                                            aria-label='Delete'
                                            variant='ghost'
                                            colorScheme='red'
                                            rounded='full'
                                            size='sm'
                                            ml={4}
                                            icon={<IconTrash size={22} />}
                                            onClick={() => handleRemove(index)}
                                        />
                                    </Td>
                                </Tr>
                            )
                        })
                    }
                </Tbody>
            </Table>

            {/* Actions */}
            <Flex
                alignItems='center'
                justifyContent='space-between'
                mt={4}
                pt={0}
                rounded='lg'
                display={allowModify ? 'flex' : 'none'}
            >
                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconPlus size={20} />}
                    onClick={handleAddNew}
                >Add Link</Button>

                <Flex
                    alignItems='center'
                    gap={4}
                >
                    <Button
                        variant='ghost'
                        colorScheme='gray'
                        size='sm'
                        isDisabled={isProcessing}
                        onClick={() => {
                            setEditedLinks([]);
                            onCancel?.();
                        }}
                    >Cancel</Button>

                    <Button
                        variant='solid'
                        colorScheme='green'
                        size='sm'
                        leftIcon={<IconDeviceFloppy size={20} />}
                        isLoading={isProcessing}
                        isDisabled={isProcessing}
                        loadingText='Saving...'
                        onClick={handleSave}
                    >Save Links</Button>
                </Flex>
            </Flex>
        </>
    )
}

export default ProductLinks;