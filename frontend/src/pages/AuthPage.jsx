import { useRecoilValue } from "recoil";
import LoginCard from "../components/LoginCard";
import SignUpCard from "../components/SignUpCard";
import authScreenAtom from "../atoms/authAtom";

const AuthPage = () => {
    const authScreenState = useRecoilValue(authScreenAtom);
    return (
        <>
            {authScreenState === "login" ? <LoginCard /> : <SignUpCard />}
        </>
    )
};

export default AuthPage;