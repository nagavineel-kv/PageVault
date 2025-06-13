import { useState } from 'react'
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native'
import {useRouter} from "expo-router";
import styles from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from '../../constants/colors';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import {useAuthStore} from "../../store/authStore";
import { API_URL } from '../../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const {token} = useAuthStore();
  const pickImage = async()=> {
    try {
      //request permission if needed
      if(Platform.OS !== "web"){
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if(status !== "granted"){
          Alert.alert("Permission Denied", "PageVault Would Like to Access Your Photos");
          return;
        }
        //Launch image library
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes:"images",
          allowsEditing:true,
          aspect:[4, 3],
          quality: 0.5, // lower quality for smaller base64 representation
          base64: true
        });
        if(!result.canceled){
          setImage(result.assets[0].uri)
          //if base64 is provided
          if(result.assets[0].base64){
            setImageBase64(result.assets[0].base64)
          }else{
            //otherwise convert to base64
            const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {encoding: FileSystem.EncodingType.Base64});
            setImageBase64(base64);
          }
        }
      }
    } catch (error) {
      console.log("Error Picking up Image", error);
      Alert.alert("Error", "There was a problem selecting your image!");
    }
  }
  const handleSubmit = async() => {
    if(!title || !caption || !imageBase64 || !rating){
      Alert.alert("Error", "Please fill in all fields!");
      return;
    }
    try {
      setLoading(true);
      // const token = await AsyncStorage.getItem("token");
      // console.log(token);
      //Get File extension from URI to JPEG
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType ? `image/${fileType.toLowerCase()}`:"image/jpeg";
      const imageDataUrl = `data:${imageType};base64,${imageBase64}`;
      const response = await fetch(`${API_URL}/books`,{
        method:"POST",
        headers:{
          Authorization: `Bearer ${token}`,
          "Content-Type":"application/json",
        },
        body: JSON.stringify({
          title, caption, rating: rating.toString(), image: imageDataUrl
        }),
      });
      //First read raw response text
      const text = await response.text();
      console.log("📩 Server response text:", text);
      const data = JSON.parse(text);
      //const data = await response.json();
      if(!response.ok) throw new Error(data.message || "Something went wrong");
      Alert.alert("Success", "Your book recommendation has posted!");
      setTitle("");
      setCaption("");
      setRating(3);
      setImage(null);
      setImageBase64(null);
      router.push("/");
    } catch (error) {
      console.log("Error creating post: ", error);
      Alert.alert("Error 1", error.message || "Something went wrong!");
    }

  }
  const renderRatingPicker = () => {
    const stars = [];
    for(let i =1; i<=5; i++){
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
          <Ionicons name={i <= rating ? "star":"star-outline"} size={32} color={i <= rating ? "#f4b400" : COLORS.textSecondary} />
        </TouchableOpacity>
      )
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1}} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
        <View style={styles.card}>
          {/** Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Book Recommendation</Text>
            <Text style={styles.subtitle}>Share your favourite reads with others</Text>
          </View>
          <View style={styles.form}>
            {/**BookTitle */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons name='book-outline' size={20} color={COLORS.textSecondary} style={styles.inputIcon}/>
                <TextInput style={styles.input} placeholder='Enter book title' placeholderTextColor={COLORS.placeholderText} value={title} onChangeText={setTitle}/>
              </View>
            </View>
            {/** Rating */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Rating</Text>
              {renderRatingPicker()}
            </View>
            {/** Image */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Upload Book Image</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (<Image source={{uri: image}} style={styles.image}/>) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name='image-outline' size={40} color={COLORS.textSecondary} />
                    <Text style={styles.placeholderText}>Tap to select image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            {/**Caption */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption</Text>
              <TextInput 
                style={styles.textArea}
                placeholder='Write your review or thoughts about this book'
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
              {loading ? (<ActivityIndicator color={COLORS.white}/>) : (<><Ionicons name='cloud-upload-outline' size={20} color={COLORS.white} style={styles.buttonIcon}/><Text style={styles.buttonText}>Share</Text></>)}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}