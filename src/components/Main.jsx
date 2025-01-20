import {FoodsComponent} from "./FoodsComponent.jsx";
import FriendsComponent from "./FriendsComponent.jsx";
import useUserContext from "../hooks/useUserContext.js";

export const Main = () => {

    const {user} = useUserContext();
    console.log(user);
    const activeUserId = user?.id;

    return (
        <>
            <h1>SaveTheFoods</h1>
            <FoodsComponent ownerId={activeUserId}/>
            <FriendsComponent/>
        </>
    )
}