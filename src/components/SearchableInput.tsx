import { themeColors } from "@/_theme";
import { useEffect, useState } from "react";
import ReactSelect from "react-select";

type SearchableInputProps = {
    data: any[];
    property: string;
    defaultValue?: any;
    placeholder?: string;
    isLoading?: boolean;
    onInputChange?: (value: string) => void;
    onSelect?: (item: any) => void;
}
const SearchableInput = ({ data, property = 'name', defaultValue, placeholder = 'Search...', isLoading = false, onInputChange, onSelect }: SearchableInputProps) => {
    const [searchTerm, setSearchTerm] = useState(defaultValue || '');

    useEffect(() => {
        setSearchTerm(defaultValue || '');
    }, [defaultValue]);

    useEffect(() => {
        const debounce = setTimeout(() => onInputChange?.(searchTerm || ''), 500);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    return (
        <ReactSelect
            options={data}
            getOptionLabel={(option: any) => option?.[property]}
            getOptionValue={(option: any) => option?.[property]}
            placeholder={placeholder}
            value={data?.find((item: any) => item?.[property] === searchTerm)}
            onInputChange={(value) => {
                setSearchTerm(value);
                onInputChange?.(value || '')
            }}
            onChange={(item: any) => {
                setSearchTerm(item?.[property]);
                onSelect?.(item);
            }}
            isMulti={false}
            isLoading={isLoading}
            noOptionsMessage={() => (
                !data?.length && !isLoading && !searchTerm?.trim()?.length
                    ? 'Start typing to search...'
                    : !data?.length && !searchTerm?.trim()?.length
                        ? 'Start typing to search...'
                        : 'No results found'
            )}
            isSearchable={true}
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