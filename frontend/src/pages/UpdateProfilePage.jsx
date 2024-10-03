import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Textarea,
    useColorModeValue,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function UpdateProfilePage() {
    const [user, setUser] = useRecoilState(userAtom);
    const [inputs, setInputs] = useState({
        name: user.name,
        email: user.email,
        password: "",
        jsonCookie: user.jsonCookie,
        emailText: user.emailText
    });

    const showToast = useShowToast();
    const [loading, setLoading] = useState(false);

    const apiUrl = process.env.REACT_APP_BACKEND_API_URL;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const res = await axios.put(`${apiUrl}/api/users/update`, {
                ...inputs
            }, {
                withCredentials: true
            });

            const data = await res.json();
            if (data.error) {
                showToast('Error', data.error, 'error');
                return;
            }
            setUser(data);
            showToast('Success', 'Profile updated successfully', 'success');
            localStorage.setItem('jobs-list', JSON.stringify(data));
        } catch (error) {
            showToast('Error', error.message, 'error');
        }
        finally {
            setLoading(false);
        }

        handleCancelAndSubmit();
    }

    const navigate = useNavigate();

    const handleCancelAndSubmit = () => {
        navigate(`/`);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Flex
                align={'center'}
                justify={'center'}
                my={6}
            >
                <Stack
                    spacing={4}
                    w={'full'}
                    maxW={'md'}
                    bg={useColorModeValue('white', 'gray.dark')}
                    rounded={'xl'}
                    boxShadow={'lg'}
                    p={6}
                >
                    <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
                        User Profile Edit
                    </Heading>
                    <FormControl>
                        <FormLabel>Full Name</FormLabel>
                        <Input
                            placeholder="John Doe"
                            _placeholder={{ color: 'gray.500' }}
                            type="text"
                            value={inputs.name}
                            onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Email Address</FormLabel>
                        <Input
                            placeholder="johndoe@example.com"
                            _placeholder={{ color: 'gray.500' }}
                            type="email"
                            value={inputs.email}
                            onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input
                            placeholder="Enter new Password"
                            _placeholder={{ color: 'gray.500' }}
                            type="password"
                            value={inputs.password}
                            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                        />
                    </FormControl>

                    {
                        user.isPro && (
                            <>
                                <FormControl>
                                    <FormLabel>LinkedIn JSON Cookie</FormLabel>
                                    <Textarea
                                        placeholder="Paste LinkedIn JSON Cookie"
                                        _placeholder={{ color: 'gray.500' }}
                                        value={inputs.jsonCookie}
                                        onChange={(e) => setInputs({ ...inputs, jsonCookie: e.target.value })}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Email Text</FormLabel>
                                    <Textarea
                                        placeholder="Enter Email Text"
                                        _placeholder={{ color: 'gray.500' }}
                                        value={inputs.emailText}
                                        onChange={(e) => setInputs({ ...inputs, emailText: e.target.value })}
                                    />
                                </FormControl>
                            </>
                        )
                    }

                    <Stack spacing={6} direction={['column', 'row']}>
                        <Button
                            bg={'red.400'}
                            color={'white'}
                            w="full"
                            _hover={{
                                bg: 'red.500',
                            }}
                            onClick={handleCancelAndSubmit}
                        >
                            Cancel
                        </Button>
                        <Button
                            bg={'green.400'}
                            loadingText="Submitting..."
                            color={'white'}
                            w="full"
                            isLoading={loading}
                            _hover={{
                                bg: 'green.500',
                            }}
                            type='submit'
                        >
                            Submit
                        </Button>
                    </Stack>
                </Stack>
            </Flex>
        </form>
    )
}
