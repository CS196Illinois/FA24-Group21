import { Text, View } from "react-native";
import { database, auth } from "../configs/firebaseConfig"
import { ref, set, onValue } from 'firebase/database';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hello!!</Text>
    </View>
  );
}
