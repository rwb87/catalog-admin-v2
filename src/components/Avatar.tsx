import { Flex, Text } from '@chakra-ui/react';
import { useMemo } from 'react';

type AvatarProps = {
    size?: string,
    name: string,
    src: string,
    showName?: boolean,
    style?: object,
}
export default function Avatar({ size = '2.2rem', name, src, showName = false, style = {} }: AvatarProps) {
    const randomAvatar = useMemo(() => {
        return `https://ui-avatars.com/api/?background=random&name=${name}&size=96&format=svg`;
    }, [name]);

    return (
        <Flex
            direction='row'
            gap={3}
            alignItems='center'
        >
            <img
                src={src || randomAvatar}
                alt={name}
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    ...style,
                }}
                onError={(e: any) => {
                    e.target.src = randomAvatar;
                    e.target.onerror = null;
                }}
            />

            { showName && <Text size='sm'>{name}</Text> }
        </Flex>
    )
}