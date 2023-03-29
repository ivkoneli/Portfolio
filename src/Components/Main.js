import { background } from "@chakra-ui/react";
import React, { useState , useEffect}   from "react";
import { useNavigate} from "react-router-dom";
import NavBar from './Navbar';
import { Box, Flex, Text } from '@chakra-ui/react';

function Main()  {


return (
    
    <div>  
        <NavBar/>
        <Text>Ivkoneli</Text>
    </div> 
 )
}

export default Main ;