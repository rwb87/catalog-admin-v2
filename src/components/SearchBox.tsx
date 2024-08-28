import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type Props = {
    value: string;
    onChange: (value: string) => void;
}
export default function SearchBox({ value, onChange }: Props) {
    const [search, setSearch] = useState<string>(value || '');

    useEffect(() => {
        setSearch(value || '');
    }, [value]);

    useEffect(() => {
        if(typeof onChange !== 'function') return;

        const debounce = setTimeout(() => {
            onChange(search);
        }, 500);
        return () => clearTimeout(debounce);
    }, [search, onChange]);

    return (
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
                defaultValue={search}
                onChange={(event: any) => setSearch(event.target.value)}
            />
        </InputGroup>
    )
}