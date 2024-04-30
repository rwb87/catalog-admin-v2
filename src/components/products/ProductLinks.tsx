import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Button, Flex, IconButton, Input, Select, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { IconArrowDown, IconArrowUp, IconCornerDownRight, IconDeviceFloppy, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { BiChevronDown } from "react-icons/bi";

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

        // Make alpha link always first
        sortedLinks = sortedLinks.filter((link: any) => link.linkType !== 'ALPHA');
        sortedLinks.unshift(newLinks.find((link: any) => link.linkType === 'ALPHA'));

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
                linkClass: "NONE",
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

        // Check if there is an Alpha link
        const hasAlphaLink = editedLinks.filter((link: any) => link.linkType === 'ALPHA').length;
        if (!hasAlphaLink) return notify('A product must have an Alpha link');

        // Check if there is more than one Alpha link
        if (hasAlphaLink > 1) return notify('A product can only have one Alpha link');

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

    return (
        <>
            <Table>
                <Thead>
                    <Tr>
                        <Th width='30px'></Th>
                        <Th>Link</Th>
                        <Th>Class</Th>
                        <Th>Type</Th>
                        <Th>Price</Th>
                        <Th>Discount Price</Th>
                        <Th textAlign='right'>Actions</Th>
                    </Tr>
                </Thead>

                <Tbody>
                    {
                        editedLinks?.map((link: any, index: number) => <Tr key={index}>
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
                                    width={48}
                                    name='linkClass'
                                    isReadOnly={!allowModify}
                                    icon={allowModify ? <BiChevronDown size={2} /> : <></>}
                                    value={link?.linkClass ?? ''}
                                    onChange={(e) => handleInputChange(e, index)}
                                >
                                    <option value='GAAN'>GAAN</option>
                                    <option value='CREATOR-AFFILIATE'>⭐ Creator Affiliate</option>
                                    <option value='BASIC'>Basic</option>
                                    <option value='NONE'>None</option>
                                </Select>
                            </Td>
                            <Td>
                                <Select
                                    variant='solid'
                                    borderWidth={1}
                                    borderColor='gray.100'
                                    size='sm'
                                    rounded='full'
                                    width={32}
                                    name='linkType'
                                    isReadOnly={!allowModify}
                                    icon={allowModify ? <BiChevronDown size={2} /> : <></>}
                                    value={link?.linkType ?? ''}
                                    onChange={(e) => handleInputChange(e, index)}
                                >
                                    <option value='ALPHA'>👑 Alpha</option>
                                    <option value='BACKUP'>Backup</option>
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
                        </Tr>)
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