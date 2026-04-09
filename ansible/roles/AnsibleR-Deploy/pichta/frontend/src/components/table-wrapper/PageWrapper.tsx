import { FC, ReactNode } from 'react'

import {Box, Center, Paper} from '@mantine/core'

export const PageWrapper: FC<{
    children: ReactNode
    formId: string
    width?: number | string
    height?: number | string
}> = ({ children, formId, width, height }) => (
    <Center id={formId} w='100rem' py={16} h={height || '100%'}>
        <Box  w={width} p="md">
            {children}
        </Box>
    </Center>
)