import { Box, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface Props {
    value: string;
    onSubmit?: (value: string) => void;
    onChange?: (value: string) => void;
}
export default function SearchBox({ value = '', onSubmit, onChange }: Props) {
    const [searchTerm, setSearchTerm] = useState(value);

    if(typeof onSubmit === 'function' && typeof onChange === 'function') throw new Error('Either onSubmit or onChange must be provided');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(typeof onSubmit !== 'function') return;

        onSubmit?.(searchTerm);
    }

    useEffect(() => {
        if(typeof onChange !== 'function') return;

        const debounce = setTimeout(() => {
            setSearchTerm(searchTerm);
            onChange?.(searchTerm);
        }, 500);

        return () => { clearTimeout(debounce) }
    }, [searchTerm]);

    useEffect(() => {
        if(value === searchTerm) return;

        setSearchTerm(value);
    }, [value]);

    return (
        <Box
            width={{
                base: 'full',
                lg: 'auto'
            }}
        >
            <form
                onSubmit={handleSubmit}
                style={{
                    position: 'relative',
                }}
            >
                <InputGroup
                    width={{
                        base: 'full',
                        xl: '250px',
                    }}
                >
                    <InputLeftElement
                        pointerEvents='none'
                        color='gray.300'
                        borderWidth={2}
                        borderColor='gray.100'
                        rounded='full'
                        width='2rem'
                        height='2rem'
                    >
                        <IconSearch size={16} strokeWidth={1.5} />
                    </InputLeftElement>

                    <Input
                        type='search'
                        placeholder='Search'
                        variant='outline'
                        width='full'
                        size='sm'
                        rounded='full'
                        bgColor='white'
                        borderWidth={2}
                        borderColor='gray.100'
                        pl={10}
                        fontWeight='medium'
                        _focusVisible={{
                            borderColor: 'gray.200 !important',
                            boxShadow: 'none !important',
                        }}
                        value={searchTerm}
                        onChange={(event: any) => setSearchTerm(event.target.value)}
                    />
                </InputGroup>
            </form>
        </Box>
    )
}