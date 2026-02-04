import { StyleSheet, Image, View, Text } from "react-native";
import PrimaryButton from "@components/PrimaryButton";
import SecondryButton from "@components/SecondryButton";


export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={{borderWidth:1}}>
      <Text style={styles.title}>Welcome to LawMate</Text>
      <Text>"Your Smart Legal Partner"</Text>
      </View>
      <View style={{borderWidth:1,flex:1}}>
        <PrimaryButton
        title="Sign Up as an Admin"
        onPress={() => {
          console.log("Sign up as an Admin Press");
        }}
      />
      <PrimaryButton
        title="Sign Up as a Lawyer"
        onPress={() => {
          console.log("Sign up as a Lawyer Press");
        }}
      />
      <PrimaryButton
        title="Sign Up as a Client"
        onPress={() => {
          console.log("Sign up as a Client Press");
        }}
      />
      <Text style={styles.subTitle}> OR</Text>
      <SecondryButton
        title="Log In"
        onPress={() => {
          console.log("Log In Press");
        }}
      />
      </View>
      {/* <Image
        source={require("../../../assets/images/Welcome.png")}
        style={styles.image}
      />
      <Text style={styles.title}>Welcome to LawMate</Text>
      <Text>"Your Smart Legal Partner"</Text>
      <PrimaryButton
        title="Sign Up as an Admin"
        onPress={() => {
          console.log("Sign up as an Admin Press");
        }}
      />
      <PrimaryButton
        title="Sign Up as a Lawyer"
        onPress={() => {
          console.log("Sign up as a Lawyer Press");
        }}
      />
      <PrimaryButton
        title="Sign Up as a Client"
        onPress={() => {
          console.log("Sign up as a Client Press");
        }}
      />
      <Text style={styles.subTitle}> OR</Text>
      <SecondryButton
        title="Log In"
        onPress={() => {
          console.log("Log In Press");
        }}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  subTitle: {
    fontSize: 10,
    marginTop: 10,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  image: {
    width: 200,
    height: 200,
  },
});
