// app/index.tsx
import { Redirect } from "expo-router";

export default function Index() {
    const isLoggedIn = false;

    return isLoggedIn
        ? <Redirect href="/(auth)/(tabs)"/>
        : <Redirect href="/(public)" />;
}

 