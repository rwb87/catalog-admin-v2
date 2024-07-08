import { Box, Flex, IconButton, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Tag, Text } from "@chakra-ui/react";
import { IconHash } from "@tabler/icons-react";

export default function KeywordsPopover({ keywords }: { keywords: any[] }) {
    return (
        <Popover
            direction="ltr"
            isLazy={true}
            closeOnBlur={true}
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
                />
            </PopoverTrigger>
            <PopoverContent textAlign='left'>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>Keywords</PopoverHeader>
                <PopoverBody whiteSpace='wrap'>
                    {
                        keywords?.length
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