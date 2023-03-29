import React, { useState , useEffect}   from "react";
import { useNavigate} from "react-router-dom";
import { Link } from 'react-router-dom';
import { Box, Flex, Text } from '@chakra-ui/react';

function NavBar() {
  return (
    <Box position="fixed" top={0} left={0} right={0}>
      <Flex
        as="nav"
        display="flex"
        placeItems="center"
        wrap="wrap"
        w="100%"
        p={7}
        margin="0 auto"
        h="15vh"
        backgroundColor="rgb(22,14,40)"
      >
        <Box display="flex" justifyContent="center" placeItems="center" width="100%" fontSize="25" fontFamily="revert" letterSpacing="2px">       
            <Text color="white" paddingLeft="15px" paddingRight="15px"  >
              Projects
            </Text>
            <Text color="white" paddingLeft="15px" paddingRight="15px">
              About Me
            </Text>
            <Text color="white" paddingLeft="15px" paddingRight="15px">
              Contact
            </Text>      
        </Box>
      </Flex>
    </Box>
  );
};

export default NavBar;
