import { PropsWithChildren } from 'react';

import { Box, Flex } from '@chakra-ui/react';

import { useDarkMode } from 'lib/hooks/useDarkMode';

type Props = {};

export function TopBar({ children }: PropsWithChildren<Props>): JSX.Element {
  const mode = useDarkMode();

  return (
    <Box
      bgColor={mode('white', 'dark.main')}
      top="0"
      m="0"
      boxShadow="md"
      zIndex={10}
      borderBottomWidth="2px"
      borderBottomStyle="solid"
    >
      <Flex justifyContent="space-between" alignItems="center" p="3">
        {children}
      </Flex>
    </Box>
  );
}
