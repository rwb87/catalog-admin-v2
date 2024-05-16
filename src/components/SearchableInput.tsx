import { themeColors } from "@/_theme";
import { useEffect, useMemo, useState } from "react";
import ReactSelect from "react-select";

type SearchableInputProps = {
    data: any[];
    property: string;
    defaultValue?: any;
    placeholder?: string;
    isLoading?: boolean;
    onDynamicSearch?: (searchTerm: string) => void;
    onChange: (item: any) => void;
}
const SearchableInput = ({ data, property = 'name', defaultValue, placeholder = 'Search...', isLoading = false, onDynamicSearch, onChange }: SearchableInputProps) => {
    const [searchTerm, setSearchTerm] = useState(defaultValue || '');

    useEffect(() => {
        setSearchTerm(defaultValue || '');
    }, [defaultValue]);

    const filteredItems = useMemo(() => {
        return data?.filter((item: any) => item?.[property]?.toLowerCase().includes(searchTerm?.toLowerCase()));
    }, [searchTerm, data, property]);

    return (

        // <Box position='relative'>
        //     <Input
        //         type="text"
        //         autoComplete="off"
        //         placeholder={placeholder}
        //         value={searchTerm}
        //         onChange={(e) => {
        //             onDynamicSearch?.(e.target.value);
        //             setSearchTerm(e.target.value)
        //             setIsOpen(true);
        //         }}
        //         onFocus={() => {
        //             onDynamicSearch?.(searchTerm);
        //             setIsOpen(true)
        //         }}
        //         onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        //     />

        //     <Box
        //         display={isLoading ? 'block' : 'none'}
        //         pointerEvents='none'
        //         position='absolute'
        //         right={2}
        //         top={1}
        //     >
        //         <IconLoader2 size={18} className="animate-spin" />
        //     </Box>

        //     <Flex
        //         direction='column'
        //         position='absolute'
        //         top='100%'
        //         left='0'
        //         width='full'
        //         zIndex={1}
        //         bgColor='white'
        //         border='1px solid'
        //         borderColor='gray.100'
        //         rounded='md'
        //         display={isOpen ? 'block' : 'none'}
        //         maxHeight='200px'
        //         overflowY='auto'
        //         shadow='md'
        //     >
        //         {
        //             !isLoading
        //                 ? !filteredItems?.length
        //                     ? <Button
        //                         width='full'
        //                         variant='ghost'
        //                         isDisabled={true}
        //                         fontStyle='italic'
        //                     >No Results</Button>
        //                     : filteredItems?.map((item: any) => <Button
        //                         key={item?.id}
        //                         variant='ghost'
        //                         size='sm'
        //                         width='full'
        //                         textAlign='left'
        //                         justifyContent='flex-start'
        //                         rounded='none'
        //                         onClick={() => {
        //                             setSearchTerm(item?.[property]);
        //                             onChange?.(item);
        //                         }}
        //                     >{item?.[property]}</Button>)
        //                 : <Button
        //                     width='full'
        //                     variant='ghost'
        //                     isDisabled={true}
        //                     fontStyle='italic'
        //                     fontWeight='normal'
        //                 >Loading...</Button>
        //         }
        //     </Flex>
        // </Box>

        <ReactSelect
            options={filteredItems}
            getOptionLabel={(option: any) => option?.[property]}
            getOptionValue={(option: any) => option?.[property]}
            placeholder={placeholder}
            value={filteredItems?.find((item: any) => item?.[property] === searchTerm)}
            onChange={(item: any) => onChange?.(item)}
            onInputChange={(value) => {
                onDynamicSearch?.(value);
                setSearchTerm(value);
            }}
            isMulti={false}
            isLoading={isLoading}
            noOptionsMessage={() => 'No Results'}
            isClearable={true}
            styles={{
                control: (baseStyles, state) => ({
                    ...baseStyles,
                    cursor: 'pointer',
                    borderColor: state.isFocused ? themeColors.primary[500] : themeColors.gray[200],
                    paddingTop: '0',
                    paddingBottom: '0',
                    fontWeight: 600,
                }),
                clearIndicator: (baseStyles) => ({
                    ...baseStyles,
                    padding: '2px 8px',
                }),
                dropdownIndicator: (baseStyles) => ({
                    ...baseStyles,
                    padding: '2px 8px',
                }),
            }}
        />
    )
}

export default SearchableInput;