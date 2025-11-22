import { View, Text, StyleSheet, ActivityIndicator,Button,Pressable, ScrollView} from "react-native";
import React, { useState } from "react";
import { TextInput } from "react-native-gesture-handler";
import TaxiRegistration from '@/components/ui/taxiRegistrationModal'
import axios from "axios";


export default function taxiDispacher() {
const [showComponent, setShowComponent] = useState(false);
const [showModal, setShowModal] = useState(false);
 const [loading, setLoading] = useState(false);
 const [WaitingCount, setWaitingCount] = useState("");
  const [Status , setStatus ] = useState("");
 const handleCreate = async () => {
    if (!WaitingCount) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
         "http://localhost:5000/passengerqueue",
        { WaitingCount, Status },
        { withCredentials: true }
      );

      alert(res.data.message || "Added successfully!");

    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };


return(
     <ScrollView>
    <View style={
        {  flex: 1,
  backgroundColor: "white",
  width: "100%",
  alignItems: "center",
  paddingBottom: 60,
  justifyContent: "center",}
    }>
        <Text style={{paddingRight:300,fontSize:20,paddingTop:20,}}>Stations: </Text>
        <Text style={{paddingRight:300,fontSize:20,paddingBottom:20}}>Route:</Text>
       <View style={styles.v2}>
        <Text style={{paddingBottom:20,paddingTop:20,fontSize:30}}>Passengers Waiting:</Text>
        <TextInput   onChangeText={setWaitingCount} placeholder="14" style={{color:"black",fontSize:40,borderRadius:10,backgroundColor:"white",width:300,height:60,}}></TextInput>
        <Pressable
         style={({ pressed }):any => [
          styles.b1,
          pressed && { backgroundColor: "#005BBB" }, 
        ]}
         onPress={handleCreate}
        >
           <Text style={{color:"white",fontSize:20,}}>Update Number</Text>
        </Pressable>
       </View>
       <View style={styles.v3}>
        <Text style={{paddingBottom:30,paddingTop:20,fontSize:30}}>Taxi Waiting:</Text>
           <Pressable
            style={({ pressed }):any => [
          styles.b2,
          pressed && { backgroundColor: "#005BBB" }, 
        ]}
            onPress={() => setShowModal(true)}
           >
              <Text style={{color:"white",fontSize:20,}}>New Taxi</Text>
        
        </Pressable>
        {showModal && (
     
<TaxiRegistration visible={showModal} onClose={() => setShowModal(false)} onTaxiCreated={function (): void {
                  throw new Error("Function not implemented.");
               } } />
    )}
       </View>
       <View style={styles.v4}>
        <Text style={{fontSize:20,}}>Alerts:</Text>

        </View>
    </View>
    </ScrollView>
)
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 ,
    alignItems: "center",  
    justifyContent: "center",
  },
v2:{
backgroundColor:"#00bfff",
borderRadius:10,
width:350,
height:250,
marginBottom:20,
   alignItems: "center",  
   paddingTop:10,
},

v3:{
backgroundColor:"#00bfff",
borderRadius:10,
width:350,
height:200,
   alignItems: "center", 
   marginBottom:20, 
},
v4:{
backgroundColor:"#00bfff",
width:350,
height:100,
borderRadius:10,
  paddingTop:20,
  paddingLeft:20,
},
b1:{
    borderRadius:10,
   width:200,
height:50,
backgroundColor:"#778899",
marginTop:15,
paddingTop:10,
paddingLeft:30,
},
b2:{
    borderRadius:10,
   width:200,
height:50,
backgroundColor:"#778899",
paddingTop:10,
paddingLeft:50,
}

})