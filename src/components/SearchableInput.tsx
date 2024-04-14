import { Box, Button, Flex, Input } from "@chakra-ui/react";
import { useMemo, useState } from "react";

type SearchableInputProps = {
    data: any[];
    property: string;
    defaultValue?: any;
    placeholder?: string;
    onChange: (item: any) => void;
}
const SearchableInput = ({ data, property = 'name', defaultValue, placeholder = 'Search...', onChange }: SearchableInputProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(defaultValue || '');

    const filteredItems = useMemo(() => {
        return data?.filter((item: any) => item?.[property]?.toLowerCase().includes(searchTerm?.toLowerCase()));
    }, [searchTerm, data, property]);

    return (

        <Box position='relative'>
            <Input
                type="text"
                autoComplete="off"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            />

            <Flex
                direction='column'
                position='absolute'
                top='100%'
                left='0'
                width='full'
                zIndex={1}
                bgColor='white'
                border='1px solid'
                borderColor='gray.100'
                rounded='md'
                display={isOpen ? 'block' : 'none'}
                maxHeight='200px'
                overflowY='auto'
                shadow='md'
            >
                {
                    filteredItems?.map((item: any) => <Button
                        key={item?.id}
                        variant='ghost'
                        size='sm'
                        width='full'
                        textAlign='left'
                        justifyContent='flex-start'
                        rounded='none'
                        onClick={() => {
                            onChange?.(item);
                            setSearchTerm(item?.[property]);
                        }}
                    >{item?.[property]}</Button>)
                }
            </Flex>
        </Box>
    )
}

export default SearchableInput;