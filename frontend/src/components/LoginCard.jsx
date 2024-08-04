import React, { useState } from 'react';
import {
    Grid,
    GridItem,
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    Link,
    FormErrorMessage,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import authScreenAtom from '../atoms/authAtom';
import useShowToast from '../hooks/useShowToast';
import userAtom from '../atoms/userAtom';

export default function LoginCard() {
    const { register, handleSubmit, formState: { errors }, setError } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const setUser = useSetRecoilState(userAtom);
    const setAuthScreenState = useSetRecoilState(authScreenAtom);
    const showToast = useShowToast();

    const validateEmail = (email) => {
        const newErrors = {};
        let isValid = true;

        if (!email) {
            newErrors.email = 'Email address is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Invalid email address';
            isValid = false;
        }

        return { isValid, newErrors };
    };

    const onSubmit = async (input, event) => {
        event.preventDefault();

        const { isValid, newErrors } = validateEmail(input.email);
        if (!isValid) {
            Object.keys(newErrors).forEach((key) => {
                setError(key, { type: 'manual', message: newErrors[key] });
            });
            return;
        }

        setLoading(true);

        try {
            const apiUrl = process.env.BACKEND_API_URL;
            const res = await fetch(`${apiUrl}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(input)
            });

            const data = await res.json();
            if (data.error) {
                showToast('Error', data.error, 'error')
                return;
            }
            localStorage.setItem('jobs-list', JSON.stringify(data));
            setUser(data);
        } catch (error) {
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
                                Welcome Back to
                                <br />
                                <span style={{ color: '#4299e1' }}>Jobs List</span>
                            </Heading>
                            <Text fontSize={'lg'} color={'gray.600'}>
                                We're excited to have you back!
                            </Text>
                        </Stack>
                    </Stack>
                </GridItem>
                <GridItem colSpan={1}>
                    <Box
                        rounded={'lg'}
                        bg={'white'}
                        boxShadow={'lg'}
                        p={8}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack spacing={4} width={'400px'}>
                                <FormControl isRequired isInvalid={!!errors.email}>
                                    <FormLabel>Email address</FormLabel>
                                    <Input
                                        type="email"
                                        {...register("email", { required: "Email is required" })}
                                        autoComplete="email"
                                    />
                                    {errors.email && <FormErrorMessage>{errors.email.message}</FormErrorMessage>}
                                </FormControl>
                                <FormControl isRequired isInvalid={!!errors.password}>
                                    <FormLabel>Password</FormLabel>
                                    <InputGroup>
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            {...register("password", { required: "Password is required" })}
                                            autoComplete="password"
                                        />
                                        <InputRightElement h={'full'}>
                                            <Button
                                                variant={'ghost'}
                                                onClick={() => setShowPassword((showPassword) => !showPassword)}>
                                                {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                                            </Button>
                                        </InputRightElement>
                                    </InputGroup>
                                    {errors.password && <FormErrorMessage>{errors.password.message}</FormErrorMessage>}
                                </FormControl>
                                <Stack spacing={10} pt={2}>
                                    <Button
                                        type="submit"
                                        loadingText="Logging in..."
                                        size="lg"
                                        bg={'blue.400'}
                                        color={'white'}
                                        _hover={{
                                            bg: 'blue.500',
                                        }}
                                        isLoading={loading}
                                    >
                                        Login
                                    </Button>
                                </Stack>
                                <Stack pt={6}>
                                    <Text align={'center'}>
                                        Don't have an account? <Link color={'blue.400'} onClick={() => setAuthScreenState("signup")}>Sign Up</Link>
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
