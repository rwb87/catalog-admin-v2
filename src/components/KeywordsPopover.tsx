import fetch from "@/helpers/fetch";
import { Box, Flex, IconButton, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Tag, Text } from "@chakra-ui/react";
import { IconHash, IconLoader2 } from "@tabler/icons-react";
import { useCallback, useId, useRef, useState } from "react";

type Props = {
    type: 'looks' | 'products',
    id: number,
}
export default function KeywordsPopover({ type, id }: Props) {
    const initialFocusRef = useRef(null);
    const uuid = useId();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [keywords, setKeywords] = useState<any[]>([]);

    const handleFetchKeywords = useCallback(async () => {
        if(!['looks', 'products'].includes(type) || !id) return;

        setIsOpen(true);

        if(isOpen) return;
        setIsLoading(true);

        const apiEndpoints = {
            looks: '/looks',
            products: '/items',
        }

        try {
            const response = await fetch({
                endpoint: `${apiEndpoints[type]}/${id}/keywords`,
                method: 'GET',
            });

            if(response) setKeywords(response || []);
            else setKeywords([]);
        } catch (error) {
            console.log(error);
            setKeywords([]);
        }

        setIsLoading(false);
    }, [isOpen, id, type]);

    return (
        <Popover
            id={uuid?.toString()}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            direction="ltr"
            isLazy={true}
            closeOnBlur={true}
            initialFocusRef={initialFocusRef}
        >
            <PopoverTrigger>
                <IconButton
                    aria-label='Hashtags'
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
                    icon={<IconHash size={22} />}
                    onClick={handleFetchKeywords}
                />
            </PopoverTrigger>
            <PopoverContent textAlign='left'>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Keywords</PopoverHeader>
                <PopoverBody whiteSpace='wrap'>
                    {
                        isLoading
                            ? <Text
                                fontSize='sm'
                                fontStyle='italic'
                                opacity={0.5}
                                display='flex'
                                justifyContent='center'
                                alignItems='center'
                                gap={2}
                                width='full'
                            >
                                <IconLoader2 size={20} className="animate-spin" />
                                Loading...
                            </Text>
                            : keywords?.length
                                ? <Flex flexWrap='wrap' gap={2}>
                                    {
                                        keywords?.map((keyword: any, index: number) => <Box key={index}>
                                            <Tag colorScheme='teal'>{keyword?.keyword?.name}</Tag>
                                        </Box>)
                                    }
                                </Flex>
                                : <Text fontSize='sm' fontStyle='italic' opacity={0.5}>No keyword</Text>
                    }
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}