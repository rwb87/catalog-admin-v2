import { Box, Flex, Text } from '@chakra-ui/react';
import { IconRosetteDiscountCheckFilled } from '@tabler/icons-react';
import { useMemo } from 'react';

type AvatarProps = {
    size?: string,
    name?: string,
    user: any,
    showName?: boolean,
    showBadge?: boolean,
    style?: object,
}
export default function Avatar({ size = '2.2rem', name, user, showName = true, showBadge = true, style = {} }: AvatarProps) {
    const randomAvatar = useMemo(() => {
        return `https://ui-avatars.com/api/?background=random&name=${name || user.name}&size=96&format=svg`;
    }, [name, user.name]);

    return (
        <Flex
            direction='row'
            gap={3}
            alignItems='center'
            display='inline-flex'
            position='relative'
            pr={showName ? 2 : 0}
        >
            <img
                src={user?.smallPictureURL || randomAvatar}
                alt={name || user?.username || '-'}
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

            { showName && <Text size='sm'>{name || user?.username || '-'}</Text> }

            {/* Badge */}
            {
                showName && showBadge && user?.isEarlyAdaptor
                    ? <Box
                            position='absolute'
                            top={-2}
                            left={-3}
                        >
                            <IconRosetteDiscountCheckFilled
                                fill="orange"
                                color="orange"
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    padding: 0,
                                    display: 'inline-block',
                                    marginLeft: '0.25rem',
                                }}
                            />
                        </Box>
                    : null
            }
        </Flex>
    )
}