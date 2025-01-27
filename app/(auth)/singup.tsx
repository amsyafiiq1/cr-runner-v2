import {
  ScrollView,
  SizableText,
  Input,
  Button,
  YStack,
  Avatar,
  View,
  Select,
  Sheet,
  Adapt,
} from "tamagui";
import { useMemo, useState } from "react";
import { useAuthStore } from "store/auth.store";
import * as ImagePicker from "expo-image-picker";
import { Camera, ChevronDown } from "@tamagui/lucide-icons";
import * as FileSystem from "expo-file-system";
import { KeyboardAvoidingView, Platform } from "react-native";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState<ImagePicker.ImagePickerAsset | null>(
    null
  );
  const [plateNo, setPlateNo] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);

  const handleSignUp = async () => {
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !id ||
      !name ||
      !phoneNumber ||
      !avatar ||
      !plateNo ||
      !vehicleType
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const base64 = await FileSystem.readAsStringAsync(avatar?.uri!, {
      encoding: "base64",
    });
    const contentType = avatar?.mimeType || "image/jpeg";

    console.log("🚀 ~ handleSignUp ~ vehicleType:", vehicleType);

    signUpWithEmail(email, password, {
      id,
      name,
      phoneNumber,
      plateNo,
      vehicleType,
      avatar: { base64Data: base64, type: contentType },
    });
  };

  const selectImage = async (openCamera: boolean) => {
    let result: ImagePicker.ImagePickerResult;

    if (!openCamera) {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });
    } else {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    }

    if (!result.canceled) {
      setAvatar(result.assets[0]);
    }
  };

  return (
    <ScrollView>
      <View flex={1} gap={"$4"} pt={"$12"} pb={"$4"} px={"$4"}>
        <YStack gap={"$2"} alignItems="center">
          <AvatarImage
            uri={avatar?.uri || require("assets/images/avatar.png")}
            selectImage={selectImage}
          />
        </YStack>
        <SizableText
          fontSize={"$8"}
          lineHeight={"$10"}
          fontWeight={800}
          textAlign="center"
        >
          Sign Up
        </SizableText>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
        />

        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          secureTextEntry
        />
        <Input
          placeholder="Student / Staff ID"
          value={id}
          onChangeText={(text) => setId(text)}
        />
        <Input
          placeholder="Name"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <Input
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
        />

        <Select
          value={vehicleType}
          onValueChange={setVehicleType}
          disablePreventBodyScroll
        >
          <Select.Trigger iconAfter={ChevronDown}>
            <Select.Value placeholder="Vehicle Type" />
          </Select.Trigger>

          <Adapt when="sm" platform="touch">
            <Sheet
              modal
              snapPointsMode="fit"
              dismissOnSnapToBottom
              animationConfig={{
                type: "spring",
                damping: 20,
                mass: 1,
                stiffness: 250,
              }}
            >
              <Sheet.Frame>
                <Sheet.ScrollView>
                  <Adapt.Contents />
                </Sheet.ScrollView>
              </Sheet.Frame>
              <Sheet.Overlay
                animation="tooltip"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
              />
            </Sheet>
          </Adapt>

          <Select.Content zIndex={200000}>
            <Select.Viewport minWidth={200}>
              <Select.Group>
                <Select.Label>Vehicle Type</Select.Label>
                {useMemo(
                  () =>
                    vehicleTypes.map((type) => (
                      <Select.Item
                        key={type.id}
                        value={type.id.toString()}
                        index={type.id}
                      >
                        <Select.ItemText>{type.name}</Select.ItemText>
                      </Select.Item>
                    )),
                  [vehicleTypes]
                )}
              </Select.Group>
            </Select.Viewport>
          </Select.Content>
        </Select>
        <Input
          placeholder="Vehicle Plate Number"
          value={plateNo}
          onChangeText={(text) => setPlateNo(text)}
        />
        <Button onPress={handleSignUp} theme={"blue"}>
          Sign Up
        </Button>
      </View>
    </ScrollView>
  );
};

function AvatarImage({
  uri,
  selectImage,
}: {
  uri: string;
  selectImage: (openCamera: boolean) => void;
}) {
  return (
    <View>
      <Avatar size={"$12"} circular>
        <Avatar.Image
          src={uri}
          accessibilityLabel="User profile picture"
          backgroundColor={"$gray10"}
        />
        <Avatar.Fallback backgroundColor="$blue10" />
      </Avatar>
      <Button
        circular
        position="absolute"
        bottom={-10}
        right={0}
        onPress={() => selectImage(true)}
      >
        <Camera />
      </Button>
    </View>
  );
}

export default SignupPage;

const vehicleTypes = [
  {
    id: 1,
    name: "Motorcycle",
  },
  {
    id: 2,
    name: "Car",
  },
  {
    id: 3,
    name: "Bicycle",
  },
];
