import {
    Grid,
    GridItem,
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    HStack,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    Link,
    FormErrorMessage,
    List,
    ListItem,
    ListIcon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ViewIcon, ViewOffIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { useSetRecoilState } from 'recoil';
import authScreenAtom from '../atoms/authAtom';
import useShowToast from '../hooks/useShowToast';
import userAtom from '../atoms/userAtom';

export default function SignUpCard() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [inputs, setInputs] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
    });

    const setAuthScreenState = useSetRecoilState(authScreenAtom);
    const showToast = useShowToast();
    const setUser = useSetRecoilState(userAtom);

    const validateForm = () => {
        let isValid = true;
        const newErrors = { name: '', email: '', password: '' };

        if (!inputs.name) {
            newErrors.name = 'Full Name is required';
            isValid = false;
        }

        if (!inputs.email) {
            newErrors.email = 'Email address is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
            newErrors.email = 'Invalid email address';
            isValid = false;
        }

        if (!inputs.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (inputs.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const apiUrl = process.env.BACKEND_API_URL;
            const res = await fetch(`${apiUrl}/api/users/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inputs),
            });

            const data = await res.json();
            if (data.error) {
                showToast('Error', data.error, 'error');
                return;
            }

            localStorage.setItem('jobs-list', JSON.stringify(data));
            setUser(data);
        }
        catch (error) {
            showToast('Error', error.message, 'error');
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <Flex minH={'100vh'} align={'center'} justify={'center'} bg={'#f4f2ee'}>
            <Grid templateColumns="repeat(2, 1fr)" gap={6} maxW="60%">
                <GridItem colSpan={1} alignContent={'center'}>
                    <Stack spacing={8} mx={'auto'} py={12} px={6}>
                        <Stack align={'flex-start'}>

                            <Heading fontSize={'4xl'} textAlign={'left'}>
                                Welcome to
                                <br />
                                <span style={{ color: '#4299e1' }}>Jobs List</span>
                            </Heading>
                            <Text fontSize={'lg'} color={'gray.600'}>
                                Discover why we're better than LinkedIn Jobs:
                            </Text>
                            <List spacing={3} textAlign={'left'} style={{ paddingLeft: '15px' }}>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color="green.500" />
                                    No Ads or Promoted Job Listings
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color="green.500" />
                                    Filter Out Previously Viewed or Applied Jobs
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color="green.500" />
                                    Single Listing for Each Job Opportunity
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color="green.500" />
                                    Universal Access to All Job Listings
                                </ListItem>
                                <ListItem>
                                    <ListIcon as={CheckCircleIcon} color="green.500" />
                                    Fast Updates with No Expired Jobs
                                </ListItem>
                            </List>
                        </Stack>
                    </Stack>
                </GridItem>
                <GridItem colSpan={1}>
                    <Box rounded={'lg'} bg={'white'} boxShadow={'lg'} p={8}>
                        <form onSubmit={handleSignUp}>
                            <Stack spacing={4} width={'400px'}>
                                <HStack>
                                    <FormControl isRequired isInvalid={!!errors.name}>
                                        <FormLabel color={'black'}>Full Name</FormLabel>
                                        <Input
                                            type="text"
                                            onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                                            value={inputs.name}
                                            autoComplete="new-name"
                                        />
                                        {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
                                    </FormControl>
                                </HStack>
                                <FormControl isRequired isInvalid={!!errors.email}>
                                    <FormLabel color={'black'}>Email address</FormLabel>
                                    <Input
                                        type="email"
                                        onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                                        value={inputs.email}
                                        autoComplete="new-email"
                                    />
                                    {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                                </FormControl>
                                <FormControl isRequired isInvalid={!!errors.password}>
                                    <FormLabel color={'black'}>Password</FormLabel>
                                    <InputGroup>
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                                            value={inputs.password}
                                            autoComplete="new-password"
                                        />
                                        <InputRightElement h={'full'}>
                                            <Button
                                                variant={'ghost'}
                                                onClick={() => setShowPassword((showPassword) => !showPassword)}>
                                                {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                    {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
                                </FormControl>
                                <Stack spacing={10} pt={2}>
                                    <Button
                                        loadingText="Signing up..."
                                        size="lg"
                                        bg={'blue.400'}
                                        color={'white'}
                                        _hover={{
                                            bg: 'blue.500',
                                        }}
                                        type="submit"
                                        isLoading={loading}
                                    >
                                        Sign up
                                    </Button>
                                </Stack>
                                <Stack pt={6}>
                                    <Text align={'center'} color={'black'}>
                                        Already a user? <Link color={'blue.400'} onClick={() => setAuthScreenState("login")}>Login</Link>
                                    </Text>
                                </Stack>
                            </Stack>
                        </form>
                    </Box>
                </GridItem>
            </Grid>
        </Flex >
    );
}
