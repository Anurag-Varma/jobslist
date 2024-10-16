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
        jsonCookies: user.jsonCookies,
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

            const data = await res.data;
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
                        Edit User Profile
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
                            autoComplete="email"
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input
                            placeholder="Enter new password"
                            _placeholder={{ color: 'gray.500' }}
                            type="password"
                            value={inputs.password}
                            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                            autoComplete="new-password"
                        />
                    </FormControl>
                    {
                        user.isPro && (
                            <>
                                <FormControl>
                                    <FormLabel>LinkedIn JSON Cookie</FormLabel>
                                    <Textarea
                                        placeholder="Paste LinkedIn JSON Cookie here.
( Login to LinkedIn in any browser and use the Cookie-Editor extension to export cookies in JSON format. )"
                                        _placeholder={{ color: 'gray.500' }}
                                        rows="6"
                                        value={inputs.jsonCookies}
                                        onChange={(e) => setInputs({ ...inputs, jsonCookies: e.target.value })}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Email Text Template</FormLabel>
                                    <Textarea
                                        placeholder="Paste Email Text Template here.
( You can use the following placeholders in your email template: {PERSON_NAME}, {COMPANY}, {JOB_TITLE} and {JOB_LINK}. These will be automatically replaced with the relevant details for each job. )"
                                        _placeholder={{ color: 'gray.500' }}
                                        rows="12"
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
